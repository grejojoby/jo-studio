import { clampMixLevel } from './audio-engine';
import { createEffectChain } from './effect-graph';
import type { EffectSettings } from './types';

export interface RenderRequest {
  vocal: AudioBuffer;
  backing?: AudioBuffer;
  effects: EffectSettings;
  vocalVolume: number;
  backingVolume: number;
  vocalOnly: boolean;
}

export function calculateRenderDuration(
  vocalSeconds: number,
  backingSeconds: number,
  reverbSeconds: number,
  delayMs: number,
): number {
  const sourceDuration = Math.max(0, vocalSeconds, backingSeconds);
  const effectTail = Math.min(3, Math.max(0, reverbSeconds) + Math.max(0, delayMs) / 1_000);
  return sourceDuration + effectTail;
}

export async function renderAudio(request: RenderRequest): Promise<AudioBuffer> {
  const sampleRate = Math.min(48_000, Math.max(44_100, request.vocal.sampleRate));
  const backingDuration = request.vocalOnly ? 0 : request.backing?.duration ?? 0;
  const duration = calculateRenderDuration(
    request.vocal.duration,
    backingDuration,
    request.effects.reverbSeconds,
    request.effects.delayMs,
  );
  const context = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
  const master = context.createDynamicsCompressor();
  master.threshold.value = -1;
  master.ratio.value = 20;
  master.knee.value = 0;
  master.attack.value = 0.003;
  master.release.value = 0.12;
  master.connect(context.destination);

  const vocalSource = context.createBufferSource();
  const vocalGain = context.createGain();
  const chain = createEffectChain(context, request.effects);
  vocalSource.buffer = request.vocal;
  vocalGain.gain.value = clampMixLevel(request.vocalVolume);
  vocalSource.connect(vocalGain).connect(chain.input);
  chain.output.connect(master);
  vocalSource.start(0);

  if (!request.vocalOnly && request.backing) {
    const backingSource = context.createBufferSource();
    const backingGain = context.createGain();
    backingSource.buffer = request.backing;
    backingGain.gain.value = clampMixLevel(request.backingVolume);
    backingSource.connect(backingGain).connect(master);
    backingSource.start(0);
  }

  return context.startRendering();
}
