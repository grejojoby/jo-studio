import { describe, expect, it } from 'vitest';
import { assertUsableAudioFile, clampMixLevel } from './audio-engine';

describe('audio input validation', () => {
  it('accepts common audio files and an empty browser MIME type', () => {
    expect(() => assertUsableAudioFile(new File(['x'], 'voice.wav', { type: 'audio/wav' }))).not.toThrow();
    expect(() => assertUsableAudioFile(new File(['x'], 'voice.mp3'))).not.toThrow();
  });

  it('rejects non-audio and oversized files with clear messages', () => {
    expect(() => assertUsableAudioFile(new File(['x'], 'notes.txt', { type: 'text/plain' })))
      .toThrow('Choose an audio file');
    const oversized = { name: 'huge.wav', type: 'audio/wav', size: 251 * 1024 * 1024 } as File;
    expect(() => assertUsableAudioFile(oversized)).toThrow('smaller than 250 MB');
  });
});

describe('clampMixLevel', () => {
  it('keeps track levels between silence and unity', () => {
    expect(clampMixLevel(-2)).toBe(0);
    expect(clampMixLevel(0.72)).toBe(0.72);
    expect(clampMixLevel(4)).toBe(1);
  });
});
