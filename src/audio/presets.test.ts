import { describe, expect, it } from 'vitest';
import { EFFECT_RANGES, PRESETS, resolveEffects } from './presets';

describe('vocal presets', () => {
  it('provides neutral, male, and female starting points', () => {
    expect(PRESETS).toHaveLength(5);
    expect(PRESETS.map((preset) => preset.voice)).toEqual(
      expect.arrayContaining(['neutral', 'male', 'female']),
    );
  });

  it('keeps every resolved effect within the safe studio range', () => {
    for (const preset of PRESETS) {
      for (const macroValue of [-100, 0, 50, 100, 250]) {
        const effects = resolveEffects(preset.id, {
          clarity: macroValue,
          warmth: macroValue,
          smoothness: macroValue,
          reverb: macroValue,
          delay: macroValue,
        });

        for (const [key, range] of Object.entries(EFFECT_RANGES)) {
          const value = effects[key as keyof typeof effects];
          expect(value, `${preset.id}.${key}`).toBeGreaterThanOrEqual(range.min);
          expect(value, `${preset.id}.${key}`).toBeLessThanOrEqual(range.max);
        }
      }
    }
  });

  it('returns a fresh settings object so advanced edits cannot mutate a preset', () => {
    const first = resolveEffects('natural', PRESETS[0].macros);
    first.warmthDb = 99;

    expect(resolveEffects('natural', PRESETS[0].macros).warmthDb).not.toBe(99);
  });
});
