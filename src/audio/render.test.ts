import { describe, expect, it } from 'vitest';
import { calculateRenderDuration } from './render';

describe('calculateRenderDuration', () => {
  it('uses the longest source and preserves a restrained effect tail', () => {
    expect(calculateRenderDuration(12, 20, 1.1, 180)).toBeCloseTo(21.28, 5);
  });

  it('never adds more than three seconds of silence', () => {
    expect(calculateRenderDuration(10, 0, 20, 9_000)).toBe(13);
  });
});
