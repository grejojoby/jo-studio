import type { EffectSettings, MacroSettings, PresetId, Range, VocalPreset } from './types';

export const EFFECT_RANGES: Record<keyof EffectSettings, Range> = {
  highPassHz: { min: 55, max: 150 },
  warmthDb: { min: -1.5, max: 3 },
  presenceDb: { min: -1.5, max: 3.5 },
  compressorThresholdDb: { min: -28, max: -12 },
  compressorRatio: { min: 1.5, max: 4 },
  deEsserDb: { min: 0, max: 6 },
  limiterThresholdDb: { min: -3, max: -0.5 },
  reverbSeconds: { min: 0.45, max: 2.2 },
  reverbMix: { min: 0, max: 0.2 },
  delayMs: { min: 70, max: 360 },
  delayFeedback: { min: 0, max: 0.3 },
  delayMix: { min: 0, max: 0.14 },
};

const balancedMacros: MacroSettings = {
  clarity: 50,
  warmth: 50,
  smoothness: 50,
  reverb: 35,
  delay: 16,
};

export const PRESETS: VocalPreset[] = [
  {
    id: 'natural', name: 'Natural', voice: 'neutral',
    description: 'Barely-there polish for any voice.', macros: balancedMacros,
    base: { highPassHz: 75, warmthDb: 0.5, presenceDb: 0.8, compressorThresholdDb: -18,
      compressorRatio: 2.1, deEsserDb: 1.5, limiterThresholdDb: -1, reverbSeconds: 0.9,
      reverbMix: 0.07, delayMs: 150, delayFeedback: 0.08, delayMix: 0.025 },
  },
  {
    id: 'close-male', name: 'Close', voice: 'male',
    description: 'Clear and intimate, with less low build-up.', macros: { ...balancedMacros, clarity: 62, warmth: 38 },
    base: { highPassHz: 82, warmthDb: 0.1, presenceDb: 1.4, compressorThresholdDb: -19,
      compressorRatio: 2.3, deEsserDb: 1.2, limiterThresholdDb: -1, reverbSeconds: 0.72,
      reverbMix: 0.055, delayMs: 125, delayFeedback: 0.06, delayMix: 0.015 },
  },
  {
    id: 'warm-male', name: 'Warm', voice: 'male',
    description: 'A little body and a short, soft room.', macros: { ...balancedMacros, warmth: 68, reverb: 42 },
    base: { highPassHz: 68, warmthDb: 1.4, presenceDb: 0.4, compressorThresholdDb: -20,
      compressorRatio: 2.4, deEsserDb: 1.4, limiterThresholdDb: -1, reverbSeconds: 1.05,
      reverbMix: 0.085, delayMs: 165, delayFeedback: 0.07, delayMix: 0.02 },
  },
  {
    id: 'clear-female', name: 'Clear', voice: 'female',
    description: 'Open detail with controlled brightness.', macros: { ...balancedMacros, clarity: 64, smoothness: 58 },
    base: { highPassHz: 95, warmthDb: 0.25, presenceDb: 1.25, compressorThresholdDb: -19,
      compressorRatio: 2.2, deEsserDb: 2.6, limiterThresholdDb: -1, reverbSeconds: 0.92,
      reverbMix: 0.075, delayMs: 145, delayFeedback: 0.06, delayMix: 0.018 },
  },
  {
    id: 'silk-female', name: 'Silk', voice: 'female',
    description: 'Smooth edges and a gentle sense of space.', macros: { ...balancedMacros, smoothness: 72, reverb: 46 },
    base: { highPassHz: 88, warmthDb: 0.8, presenceDb: 0.45, compressorThresholdDb: -21,
      compressorRatio: 2.6, deEsserDb: 3.4, limiterThresholdDb: -1.2, reverbSeconds: 1.18,
      reverbMix: 0.095, delayMs: 185, delayFeedback: 0.08, delayMix: 0.025 },
  },
];

export const DEFAULT_PRESET_ID: PresetId = 'natural';

function clamp(value: number, range: Range): number {
  return Math.min(range.max, Math.max(range.min, value));
}

function macroOffset(value: number): number {
  return (Math.min(100, Math.max(0, value)) - 50) / 50;
}

export function getPreset(id: PresetId): VocalPreset {
  return PRESETS.find((preset) => preset.id === id) ?? PRESETS[0];
}

export function resolveEffects(id: PresetId, macros: MacroSettings): EffectSettings {
  const base = getPreset(id).base;
  const clarity = macroOffset(macros.clarity);
  const warmth = macroOffset(macros.warmth);
  const smoothness = macroOffset(macros.smoothness);
  const reverb = macroOffset(macros.reverb);
  const delay = macroOffset(macros.delay);
  const values: EffectSettings = {
    ...base,
    warmthDb: base.warmthDb + warmth * 1.5,
    presenceDb: base.presenceDb + clarity * 1.75,
    compressorThresholdDb: base.compressorThresholdDb - smoothness * 4,
    compressorRatio: base.compressorRatio + smoothness * 0.7,
    deEsserDb: base.deEsserDb + smoothness * 1.4,
    reverbSeconds: base.reverbSeconds + reverb * 0.4,
    reverbMix: base.reverbMix + reverb * 0.07,
    delayFeedback: base.delayFeedback + delay * 0.07,
    delayMix: base.delayMix + delay * 0.05,
  };

  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      clamp(value, EFFECT_RANGES[key as keyof EffectSettings]),
    ]),
  ) as unknown as EffectSettings;
}
