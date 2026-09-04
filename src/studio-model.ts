import { DEFAULT_PRESET_ID, getPreset, resolveEffects } from './audio/presets';
import type { EffectSettings, MacroSettings, PresetId } from './audio/types';

export interface AudioAsset {
  name: string;
  blob: Blob;
  durationSeconds: number;
  peaks: number[];
}

export interface VocalTake extends AudioAsset {
  id: string;
  createdAt: number;
}

export interface StudioProject {
  version: 1;
  backing?: AudioAsset;
  takes: VocalTake[];
  selectedTakeId?: string;
  presetId: PresetId;
  macros: MacroSettings;
  effects: EffectSettings;
  vocalVolume: number;
  backingVolume: number;
  monitorEnabled: boolean;
  updatedAt: number;
}

export function createDefaultProject(): StudioProject {
  const preset = getPreset(DEFAULT_PRESET_ID);
  const macros = { ...preset.macros };

  return {
    version: 1,
    takes: [],
    presetId: DEFAULT_PRESET_ID,
    macros,
    effects: resolveEffects(DEFAULT_PRESET_ID, macros),
    vocalVolume: 0.88,
    backingVolume: 0.72,
    monitorEnabled: true,
    updatedAt: Date.now(),
  };
}
