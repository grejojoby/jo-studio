import { describe, expect, it } from 'vitest';
import { createImpulseSamples } from './effect-graph';

describe('createImpulseSamples', () => {
  it('creates a deterministic, decaying stereo room response', () => {
    const first = createImpulseSamples(0.5, 1_000);
    const second = createImpulseSamples(0.5, 1_000);

    expect(first).toEqual(second);
    expect(first).toHaveLength(2);
    expect(first[0]).toHaveLength(500);
    expect(Math.abs(first[0][0])).toBeGreaterThan(Math.abs(first[0][499]));
  });

  it('clamps unsafe duration and sample-rate inputs', () => {
    expect(createImpulseSamples(99, 10)[0]).toHaveLength(2_200);
  });
});
