import type { EffectSettings } from './types';

export interface EffectChain {
  input: GainNode;
  output: GainNode;
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
): EffectChain {
  const input = context.createGain();
  const highPass = context.createBiquadFilter();
  const warmth = context.createBiquadFilter();
  const presence = context.createBiquadFilter();
  const deEsser = context.createBiquadFilter();
  const compressor = context.createDynamicsCompressor();
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
  highPass.frequency.value = settings.highPassHz;
  highPass.Q.value = 0.7;
  warmth.type = 'lowshelf';
  warmth.frequency.value = 220;
  warmth.gain.value = settings.warmthDb;
  presence.type = 'peaking';
  presence.frequency.value = 3_200;
  presence.Q.value = 0.8;
  presence.gain.value = settings.presenceDb;
  deEsser.type = 'highshelf';
  deEsser.frequency.value = 6_400;
  deEsser.gain.value = -settings.deEsserDb;
  compressor.threshold.value = settings.compressorThresholdDb;
  compressor.ratio.value = settings.compressorRatio;
  compressor.knee.value = 12;
  compressor.attack.value = 0.012;
  compressor.release.value = 0.18;
  convolver.buffer = createImpulseBuffer(context, settings.reverbSeconds);
  reverbWet.gain.value = settings.reverbMix;
  delay.delayTime.value = settings.delayMs / 1_000;
  delayFeedback.gain.value = settings.delayFeedback;
  delayWet.gain.value = settings.delayMix;
  limiter.threshold.value = settings.limiterThresholdDb;
  limiter.ratio.value = 20;
  limiter.knee.value = 0;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.12;

  input.connect(highPass).connect(warmth).connect(presence).connect(deEsser).connect(compressor);
  compressor.connect(dry).connect(mix);
  compressor.connect(convolver).connect(reverbWet).connect(mix);
  compressor.connect(delay).connect(delayWet).connect(mix);
  delay.connect(delayFeedback).connect(delay);
  mix.connect(limiter).connect(output);

  const nodes: AudioNode[] = [input, highPass, warmth, presence, deEsser, compressor, dry,
    convolver, reverbWet, delay, delayFeedback, delayWet, mix, limiter, output];

  return {
    input,
    output,
    dispose: () => nodes.forEach((node) => node.disconnect()),
  };
}
