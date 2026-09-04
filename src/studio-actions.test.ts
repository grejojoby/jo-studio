import { describe, expect, it } from 'vitest';
import { PRESETS } from './audio/presets';
import { addTake, changeEffect, changeMacro, selectPreset } from './studio-actions';
import { createDefaultProject, type VocalTake } from './studio-model';

describe('studio project actions', () => {
  it('selects a preset and synchronizes macro and advanced settings', () => {
    const project = selectPreset(createDefaultProject(), 'silk-female');
    const preset = PRESETS.find((candidate) => candidate.id === 'silk-female')!;

    expect(project.presetId).toBe('silk-female');
    expect(project.macros).toEqual(preset.macros);
    expect(project.effects.deEsserDb).toBeGreaterThan(0);
  });

  it('clamps macro changes and recalculates effects', () => {
    const project = changeMacro(createDefaultProject(), 'reverb', 500);

    expect(project.macros.reverb).toBe(100);
    expect(project.effects.reverbMix).toBeLessThanOrEqual(0.2);
  });

  it('clamps detailed edits to the safe effect envelope', () => {
    const project = changeEffect(createDefaultProject(), 'delayFeedback', 2);

    expect(project.effects.delayFeedback).toBe(0.3);
  });

  it('selects a newly added vocal take', () => {
    const take = {
      id: 'take-1', name: 'Take 1', blob: new Blob(), durationSeconds: 5,
      createdAt: 1_700_000_000_000, peaks: [0.5],
    } satisfies VocalTake;

    const project = addTake(createDefaultProject(), take);

    expect(project.takes).toEqual([take]);
    expect(project.selectedTakeId).toBe('take-1');
  });
});
