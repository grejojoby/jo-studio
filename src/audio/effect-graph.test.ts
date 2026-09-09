import { createDefaultProject } from '../studio-model';
import { describe, expect, it, vi } from 'vitest';
import { createEffectChain, createImpulseSamples } from './effect-graph';

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

// Exercise graph updates without requiring audio hardware in the test runner.
function audioContextStub() {
  const node = () => ({
    connect: vi.fn((target: unknown) => target), disconnect: vi.fn(),
    gain: param(), frequency: param(), Q: param(), threshold: param(), ratio: param(),
    knee: param(), attack: param(), release: param(), delayTime: param(), buffer: undefined,
  });
  const context = {
    currentTime: 0, sampleRate: 1_000,
    createGain: vi.fn(node), createBiquadFilter: vi.fn(node),
    createDynamicsCompressor: vi.fn(node), createConvolver: vi.fn(node), createDelay: vi.fn(node),
    createBuffer: vi.fn((_channels: number, length: number) => ({ getChannelData: () => new Float32Array(length) })),
  };
  return context;
}

function param() { return { value: 0, setTargetAtTime: vi.fn() }; }

describe('effect updates', () => {
  it('preserves the active room response when adjusting an unrelated effect', () => {
    const context = audioContextStub();
    const settings = createDefaultProject().effects;
    const chain = createEffectChain(context as unknown as BaseAudioContext, settings);
    const room = context.createConvolver.mock.results[0].value;
    const originalBuffer = room.buffer;
    chain.update({ ...settings, warmthDb: 2 });
    expect(room.buffer).toBe(originalBuffer);
    expect(context.createBuffer).toHaveBeenCalledTimes(1);
    chain.update({ ...settings, reverbSeconds: 1.8 });
    expect(room.buffer).not.toBe(originalBuffer);
    expect(context.createBuffer).toHaveBeenCalledTimes(2);
  });

  it('uses only the protective limiter for live monitoring and full compression for playback', () => {
    const live = audioContextStub();
    const playback = audioContextStub();
    const settings = createDefaultProject().effects;
    const monitor = createEffectChain(live as unknown as BaseAudioContext, settings, { monitoring: true });
    createEffectChain(playback as unknown as BaseAudioContext, settings);
    expect(live.createDynamicsCompressor).toHaveBeenCalledTimes(1);
    expect(playback.createDynamicsCompressor).toHaveBeenCalledTimes(2);
    const limiter = live.createDynamicsCompressor.mock.results[0].value;
    expect(limiter.threshold.setTargetAtTime).toHaveBeenCalledWith(settings.limiterThresholdDb, 0, 0.01);
    monitor.dispose();
    expect(limiter.disconnect).toHaveBeenCalled();
  });
});
