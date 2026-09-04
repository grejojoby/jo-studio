import { describe, expect, it } from 'vitest';
import { encodeMp3Blob, encodeWavBuffer, floatToPcm16 } from './encode';

describe('floatToPcm16', () => {
  it('clamps samples and maps them to signed 16-bit PCM', () => {
    expect([...floatToPcm16(new Float32Array([-2, -1, 0, 1, 2]))]).toEqual([
      -32768, -32768, 0, 32767, 32767,
    ]);
  });
});

describe('encodeMp3Blob', () => {
  it('encodes bounded PCM data into an MPEG audio blob', () => {
    const audio = {
      numberOfChannels: 1,
      sampleRate: 44_100,
      getChannelData: () => new Float32Array(4_410).fill(0.1),
    };

    const blob = encodeMp3Blob(audio);

    expect(blob.type).toBe('audio/mpeg');
    expect(blob.size).toBeGreaterThan(0);
  });
});

describe('encodeWavBuffer', () => {
  it('writes a stereo 16-bit PCM WAV header and interleaved sample data', () => {
    const buffer = encodeWavBuffer(
      [new Float32Array([0, 1]), new Float32Array([0, -1])],
      48_000,
    );
    const view = new DataView(buffer);
    const text = (offset: number, length: number) =>
      String.fromCharCode(...new Uint8Array(buffer, offset, length));

    expect(text(0, 4)).toBe('RIFF');
    expect(text(8, 4)).toBe('WAVE');
    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint32(24, true)).toBe(48_000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(text(36, 4)).toBe('data');
    expect(view.getInt16(44, true)).toBe(0);
    expect(view.getInt16(46, true)).toBe(0);
    expect(view.getInt16(48, true)).toBe(32767);
    expect(view.getInt16(50, true)).toBe(-32768);
  });
});
