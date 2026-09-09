import { createEffectChain, type EffectChain } from './effect-graph';
import { extractPeaks } from './waveform';
import type { EffectSettings } from './types';

const MAX_AUDIO_BYTES = 250 * 1024 * 1024;
const AUDIO_EXTENSIONS = /\.(aac|flac|m4a|mp3|mp4|ogg|opus|wav|webm)$/i;

export interface AnalysedAudio {
  durationSeconds: number;
  peaks: number[];
}

export interface LiveLevels {
  vocal: number;
  backing: number;
}

const METER_FLOOR_DB = -48;
const METER_CEILING_DB = 0;

export function meterLevel(samples: Float32Array): number {
  let sum = 0;
  for (const sample of samples) sum += sample * sample;
  const rms = Math.sqrt(sum / Math.max(1, samples.length));
  if (rms === 0) return 0;
  const db = 20 * Math.log10(rms);
  return clampMixLevel((db - METER_FLOOR_DB) / (METER_CEILING_DB - METER_FLOOR_DB));
}

export interface PlaybackRequest {
  vocal?: Blob;
  backing?: Blob;
  effects: EffectSettings;
  vocalVolume: number;
  backingVolume: number;
}

export function assertUsableAudioFile(file: File): void {
  if (file.size > MAX_AUDIO_BYTES) throw new Error('Choose an audio file smaller than 250 MB.');
  if (file.type && !file.type.startsWith('audio/')) throw new Error('Choose an audio file.');
  if (!file.type && !AUDIO_EXTENSIONS.test(file.name)) throw new Error('Choose an audio file.');
}

export function clampMixLevel(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export class AudioEngine {
  private context?: AudioContext;
  private readonly decodedBuffers = new WeakMap<Blob, AudioBuffer>();
  private playbackSources: AudioBufferSourceNode[] = [];
  private playbackChain?: EffectChain;
  private monitorChain?: EffectChain;
  private monitorSource?: MediaStreamAudioSourceNode;
  private monitorGain?: GainNode;
  private readonly meterSamples = new WeakMap<AnalyserNode, Float32Array<ArrayBuffer>>();
  private inputSource?: MediaStreamAudioSourceNode;
  private inputAnalyser?: AnalyserNode;
  private vocalAnalyser?: AnalyserNode;
  private backingAnalyser?: AnalyserNode;
  private vocalGain?: GainNode;
  private backingGain?: GainNode;
  private playbackStartedAt = 0;
  private playbackDuration = 0;

  private async getContext(): Promise<AudioContext> {
    this.context ??= new AudioContext({ latencyHint: 'interactive' });
    if (this.context.state === 'suspended') await this.context.resume();
    return this.context;
  }

  async decode(blob: Blob): Promise<AudioBuffer> {
    const cached = this.decodedBuffers.get(blob);
    if (cached) return cached;
    const context = await this.getContext();
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    this.decodedBuffers.set(blob, decoded);
    return decoded;
  }

  async analyse(blob: Blob, bucketCount = 320): Promise<AnalysedAudio> {
    const buffer = await this.decode(blob);
    return {
      durationSeconds: buffer.duration,
      peaks: extractPeaks(buffer.getChannelData(0), bucketCount),
    };
  }

  async startPlayback(request: PlaybackRequest): Promise<number> {
    this.stopPlayback();
    const context = await this.getContext();
    const [vocalBuffer, backingBuffer] = await Promise.all([
      request.vocal ? this.decode(request.vocal) : undefined,
      request.backing ? this.decode(request.backing) : undefined,
    ]);
    if (!vocalBuffer && !backingBuffer) throw new Error('Add a vocal or backing track before playing.');

    const startAt = context.currentTime + 0.005;
    if (vocalBuffer) {
      const source = context.createBufferSource();
      const gain = context.createGain();
      const chain = createEffectChain(context, request.effects);
      source.buffer = vocalBuffer;
      gain.gain.value = clampMixLevel(request.vocalVolume);
      source.connect(gain).connect(chain.input);
      chain.output.connect(context.destination);
      this.vocalAnalyser = this.createAnalyser(context);
      gain.connect(this.vocalAnalyser);
      source.start(startAt);
      this.vocalGain = gain;
      this.playbackChain = chain;
      this.playbackSources.push(source);
    }
    if (backingBuffer) {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = backingBuffer;
      gain.gain.value = clampMixLevel(request.backingVolume);
      source.connect(gain).connect(context.destination);
      this.backingAnalyser = this.createAnalyser(context);
      gain.connect(this.backingAnalyser);
      source.start(startAt);
      this.backingGain = gain;
      this.playbackSources.push(source);
    }

    this.playbackStartedAt = startAt;
    this.playbackDuration = Math.max(vocalBuffer?.duration ?? 0, backingBuffer?.duration ?? 0);
    return this.playbackDuration;
  }

  async startInputMeter(stream: MediaStream): Promise<void> {
    this.stopInputMeter();
    const context = await this.getContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = this.createAnalyser(context);
    source.connect(analyser);
    this.inputSource = source;
    this.inputAnalyser = analyser;
  }

  stopInputMeter(): void {
    this.inputSource?.disconnect();
    this.inputSource = undefined;
    this.inputAnalyser = undefined;
  }

  get levels(): LiveLevels {
    return {
      vocal: Math.max(this.readLevel(this.inputAnalyser), this.readLevel(this.vocalAnalyser)),
      backing: this.readLevel(this.backingAnalyser),
    };
  }

  get inputPeak(): number {
    if (!this.inputAnalyser) return 0;
    const samples = this.meterSamples.get(this.inputAnalyser)!;
    this.inputAnalyser.getFloatTimeDomainData(samples);
    let peak = 0;
    for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
    return Math.min(1, peak);
  }

  private createAnalyser(context: AudioContext): AnalyserNode {
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    this.meterSamples.set(analyser, new Float32Array(analyser.fftSize));
    return analyser;
  }

  private readLevel(analyser?: AnalyserNode): number {
    if (!analyser) return 0;
    const samples = this.meterSamples.get(analyser)!;
    analyser.getFloatTimeDomainData(samples);
    return meterLevel(samples);
  }

  async startMonitor(stream: MediaStream, settings: EffectSettings, volume: number): Promise<void> {
    this.stopMonitor();
    const context = await this.getContext();
    const source = context.createMediaStreamSource(stream);
    const gain = context.createGain();
    const chain = createEffectChain(context, settings, { monitoring: true });
    gain.gain.value = clampMixLevel(volume);
    source.connect(gain).connect(chain.input);
    chain.output.connect(context.destination);
    this.monitorSource = source;
    this.monitorGain = gain;
    this.monitorChain = chain;
  }

  setMixLevels(vocalVolume: number, backingVolume: number): void {
    const now = this.context?.currentTime ?? 0;
    this.vocalGain?.gain.setTargetAtTime(clampMixLevel(vocalVolume), now, 0.01);
    this.monitorGain?.gain.setTargetAtTime(clampMixLevel(vocalVolume), now, 0.01);
    this.backingGain?.gain.setTargetAtTime(clampMixLevel(backingVolume), now, 0.01);
  }

  setEffects(settings: EffectSettings): void {
    this.playbackChain?.update(settings);
    this.monitorChain?.update(settings);
  }

  get positionSeconds(): number {
    if (!this.context || this.playbackSources.length === 0) return 0;
    return Math.min(this.playbackDuration, Math.max(0, this.context.currentTime - this.playbackStartedAt));
  }

  get isPlaying(): boolean {
    return this.playbackSources.length > 0 && this.positionSeconds < this.playbackDuration;
  }

  stopPlayback(): void {
    for (const source of this.playbackSources) {
      try { source.stop(); } catch { /* source already ended */ }
      source.disconnect();
    }
    this.playbackSources = [];
    this.playbackChain?.dispose();
    this.playbackChain = undefined;
    this.vocalGain?.disconnect();
    this.backingGain?.disconnect();
    this.vocalGain = undefined;
    this.backingGain = undefined;
    this.vocalAnalyser = undefined;
    this.backingAnalyser = undefined;
    this.playbackDuration = 0;
  }

  stopMonitor(): void {
    this.monitorSource?.disconnect();
    this.monitorSource = undefined;
    this.monitorGain?.disconnect();
    this.monitorGain = undefined;
    this.monitorChain?.dispose();
    this.monitorChain = undefined;
  }

  async dispose(): Promise<void> {
    this.stopPlayback();
    this.stopMonitor();
    this.stopInputMeter();
    await this.context?.close();
    this.context = undefined;
  }
}
