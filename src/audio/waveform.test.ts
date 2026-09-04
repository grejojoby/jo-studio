import { describe, expect, it } from 'vitest';
import { extractPeaks, formatDuration } from './waveform';

describe('extractPeaks', () => {
  it('returns the loudest absolute sample in each visual bucket', () => {
    const samples = new Float32Array([0.1, -0.6, 0.2, 0.4, -0.9, 0.3]);

    expect(extractPeaks(samples, 3)).toEqual([0.6, 0.4, 0.9]);
  });

  it('returns quiet buckets for an empty recording', () => {
    expect(extractPeaks(new Float32Array(), 4)).toEqual([0, 0, 0, 0]);
  });
});

describe('formatDuration', () => {
  it('formats finite non-negative durations as minutes and seconds', () => {
    expect(formatDuration(65.8)).toBe('1:05');
    expect(formatDuration(Number.NaN)).toBe('0:00');
    expect(formatDuration(-5)).toBe('0:00');
  });
});
