import { EFFECT_RANGES, getPreset, resolveEffects } from './audio/presets';
import type { EffectSettings, MacroSettings, PresetId } from './audio/types';
import type { AudioAsset, StudioProject, VocalTake } from './studio-model';

function updated(project: StudioProject, patch: Partial<StudioProject>): StudioProject {
  return { ...project, ...patch, updatedAt: Date.now() };
}

export function selectPreset(project: StudioProject, presetId: PresetId): StudioProject {
  const preset = getPreset(presetId);
  const macros = { ...preset.macros };
  return updated(project, { presetId, macros, effects: resolveEffects(presetId, macros) });
}

export function changeMacro(
  project: StudioProject,
  name: keyof MacroSettings,
  value: number,
): StudioProject {
  const macros = { ...project.macros, [name]: Math.min(100, Math.max(0, value)) };
  const resolved = resolveEffects(project.presetId, macros);
  const affected: Record<keyof MacroSettings, Array<keyof EffectSettings>> = {
    clarity: ['presenceDb'], warmth: ['warmthDb'],
    smoothness: ['compressorThresholdDb', 'compressorRatio', 'deEsserDb'],
    reverb: ['reverbSeconds', 'reverbMix'], delay: ['delayFeedback', 'delayMix'],
  };
  const effects = { ...project.effects };
  for (const key of affected[name]) effects[key] = resolved[key];
  return updated(project, { macros, effects });
}

export function changeEffect(
  project: StudioProject,
  name: keyof EffectSettings,
  value: number,
): StudioProject {
  const range = EFFECT_RANGES[name];
  const safeValue = Math.min(range.max, Math.max(range.min, value));
  return updated(project, { effects: { ...project.effects, [name]: safeValue } });
}

export function addTake(project: StudioProject, take: VocalTake): StudioProject {
  return updated(project, { takes: [...project.takes, take], selectedTakeId: take.id });
}

export function deleteTake(project: StudioProject, takeId: string): StudioProject {
  const takes = project.takes.filter((take) => take.id !== takeId);
  const selectedTakeId = project.selectedTakeId === takeId ? takes.at(-1)?.id : project.selectedTakeId;
  return updated(project, { takes, selectedTakeId });
}

export function selectTake(project: StudioProject, takeId: string): StudioProject {
  return project.takes.some((take) => take.id === takeId)
    ? updated(project, { selectedTakeId: takeId })
    : project;
}

export function setBacking(project: StudioProject, backing?: AudioAsset): StudioProject {
  return updated(project, { backing });
}

export function setLevel(
  project: StudioProject,
  track: 'vocalVolume' | 'backingVolume',
  value: number,
): StudioProject {
  return updated(project, { [track]: Math.min(1, Math.max(0, value)) });
}

export function setMonitoring(project: StudioProject, enabled: boolean): StudioProject {
  return updated(project, { monitorEnabled: enabled });
}
