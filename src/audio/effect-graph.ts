import type { EffectSettings } from './types';

export interface EffectChain {
  input: GainNode;
  output: GainNode;
  update: (settings: EffectSettings) => void;
  dispose: () => void;
}

export function createImpulseSamples(durationSeconds: number, sampleRate: number): Float32Array[] {
  const duration = Math.min(2.2, Math.max(0.45, durationSeconds));
  const rate = Math.min(192_000, Math.max(1_000, sampleRate));
  const length = Math.max(1, Math.round(duration * rate));
  let seed = 0x5eed1234;

  const random = () => {
    seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;
    return seed / 0xffffffff;
  };

  return Array.from({ length: 2 }, () => {
    const samples = new Float32Array(length);
    for (let index = 0; index < length; index += 1) {
      const envelope = (1 - index / length) ** 2.8;
      samples[index] = (random() * 2 - 1) * envelope;
    }
    return samples;
  });
}

function createImpulseBuffer(context: BaseAudioContext, durationSeconds: number): AudioBuffer {
  const channels = createImpulseSamples(durationSeconds, context.sampleRate);
  const buffer = context.createBuffer(2, channels[0].length, context.sampleRate);
  channels.forEach((samples, channel) => buffer.getChannelData(channel).set(samples));
  return buffer;
}

export function createEffectChain(
  context: BaseAudioContext,
  settings: EffectSettings,
  options: { monitoring?: boolean } = {},
): EffectChain {
  const input = context.createGain();
  const highPass = context.createBiquadFilter();
  const warmth = context.createBiquadFilter();
  const presence = context.createBiquadFilter();
  const deEsser = context.createBiquadFilter();
  // Browser compressors use look-ahead. Keep the limiter, but skip the extra
  // compressor in live monitoring; the recorded take receives full processing.
  const compressor = options.monitoring ? undefined : context.createDynamicsCompressor();
  const dry = context.createGain();
  const convolver = context.createConvolver();
  const reverbWet = context.createGain();
  const delay = context.createDelay(0.5);
  const delayFeedback = context.createGain();
  const delayWet = context.createGain();
  const mix = context.createGain();
  const limiter = context.createDynamicsCompressor();
  const output = context.createGain();

  highPass.type = 'highpass';
  highPass.Q.value = 0.7;
  warmth.type = 'lowshelf';
  warmth.frequency.value = 220;
  presence.type = 'peaking';
  presence.frequency.value = 3_200;
  presence.Q.value = 0.8;
  deEsser.type = 'highshelf';
  deEsser.frequency.value = 6_400;
  if (compressor) {
    compressor.knee.value = 12;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.18;
  }
  limiter.ratio.value = 20;
  limiter.knee.value = 0;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.12;

  let roomSeconds: number | undefined;
  const update = (next: EffectSettings) => {
    const now = context.currentTime;
    highPass.frequency.setTargetAtTime(next.highPassHz, now, 0.01);
    warmth.gain.setTargetAtTime(next.warmthDb, now, 0.01);
    presence.gain.setTargetAtTime(next.presenceDb, now, 0.01);
    deEsser.gain.setTargetAtTime(-next.deEsserDb, now, 0.01);
    compressor?.threshold.setTargetAtTime(next.compressorThresholdDb, now, 0.01);
    compressor?.ratio.setTargetAtTime(next.compressorRatio, now, 0.01);
    reverbWet.gain.setTargetAtTime(next.reverbMix, now, 0.01);
    delay.delayTime.setTargetAtTime(next.delayMs / 1_000, now, 0.01);
    delayFeedback.gain.setTargetAtTime(next.delayFeedback, now, 0.01);
    delayWet.gain.setTargetAtTime(next.delayMix, now, 0.01);
    limiter.threshold.setTargetAtTime(next.limiterThresholdDb, now, 0.01);
    if (roomSeconds !== next.reverbSeconds) {
      convolver.buffer = createImpulseBuffer(context, next.reverbSeconds);
      roomSeconds = next.reverbSeconds;
    }
  };

  update(settings);

  input.connect(highPass).connect(warmth).connect(presence).connect(deEsser);
  const voice = compressor ?? deEsser;
  if (compressor) deEsser.connect(compressor);
  voice.connect(dry).connect(mix);
  voice.connect(convolver).connect(reverbWet).connect(mix);
  voice.connect(delay).connect(delayWet).connect(mix);
  delay.connect(delayFeedback).connect(delay);
  mix.connect(limiter).connect(output);

  const nodes: AudioNode[] = [input, highPass, warmth, presence, deEsser, ...(compressor ? [compressor] : []), dry,
    convolver, reverbWet, delay, delayFeedback, delayWet, mix, limiter, output];

  return {
    input,
    output,
    update,
    dispose: () => nodes.forEach((node) => node.disconnect()),
  };
}
