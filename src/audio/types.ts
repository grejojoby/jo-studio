export type VoiceProfile = 'neutral' | 'male' | 'female';

export type PresetId =
  | 'natural'
  | 'close-male'
  | 'warm-male'
  | 'clear-female'
  | 'silk-female';

export interface MacroSettings {
  clarity: number;
  warmth: number;
  smoothness: number;
  reverb: number;
  delay: number;
}

export interface EffectSettings {
  highPassHz: number;
  warmthDb: number;
  presenceDb: number;
  compressorThresholdDb: number;
  compressorRatio: number;
  deEsserDb: number;
  limiterThresholdDb: number;
  reverbSeconds: number;
  reverbMix: number;
  delayMs: number;
  delayFeedback: number;
  delayMix: number;
}

export interface VocalPreset {
  id: PresetId;
  name: string;
  voice: VoiceProfile;
  description: string;
  macros: MacroSettings;
  base: EffectSettings;
}

export interface Range {
  min: number;
  max: number;
}
