import { describe, expect, it, vi } from 'vitest';
import { microphoneConstraints, pickRecorderMimeType, stopMediaStream } from './microphone-recorder';

describe('microphone recording safeguards', () => {
  it('requests noise-suppressed vocal capture without gain or echo processing', () => {
    expect(microphoneConstraints).toEqual({
      audio: {
        autoGainControl: false,
        echoCancellation: false,
        noiseSuppression: true,
        channelCount: 1,
      },
      video: false,
    });
  });

  it('chooses the first recorder format supported by the browser', () => {
    expect(pickRecorderMimeType((type) => type === 'audio/webm;codecs=opus')).toBe(
      'audio/webm;codecs=opus',
    );
    expect(pickRecorderMimeType(() => false)).toBeUndefined();
  });

  it('releases every microphone track', () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }, { stop }] } as unknown as MediaStream;

    stopMediaStream(stream);

    expect(stop).toHaveBeenCalledTimes(2);
  });
});
