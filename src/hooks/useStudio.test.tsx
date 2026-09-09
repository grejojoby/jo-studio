import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultProject } from '../studio-model';
import { useStudio } from './useStudio';

const mocks = vi.hoisted(() => ({
  engine: {
    analyse: vi.fn(), decode: vi.fn(), startPlayback: vi.fn(), stopPlayback: vi.fn(),
    startInputMeter: vi.fn(), stopInputMeter: vi.fn(), startMonitor: vi.fn(), stopMonitor: vi.fn(),
    setEffects: vi.fn(), setMixLevels: vi.fn(), dispose: vi.fn(),
    levels: { vocal: 0.4, backing: 0 }, inputPeak: 0.3,
  },
  recorder: { start: vi.fn(), stop: vi.fn(), dispose: vi.fn(), isRecording: false },
  store: { load: vi.fn(), save: vi.fn(), clear: vi.fn(), close: vi.fn() },
}));
vi.mock('../audio/audio-engine', () => ({
  AudioEngine: vi.fn(function () { return mocks.engine; }), assertUsableAudioFile: vi.fn(),
}));
vi.mock('../audio/microphone-recorder', () => ({
  MicrophoneRecorder: vi.fn(function () { return mocks.recorder; }),
}));
vi.mock('../storage/project-store', () => ({
  ProjectStore: vi.fn(function () { return mocks.store; }),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.store.load.mockResolvedValue(undefined);
  mocks.store.save.mockResolvedValue(undefined);
  mocks.recorder.isRecording = false;
  mocks.recorder.start.mockImplementation(async () => {
    mocks.recorder.isRecording = true;
    return {} as MediaStream;
  });
  mocks.recorder.stop.mockImplementation(async () => {
    mocks.recorder.isRecording = false;
    return new Blob(['recorded audio']);
  });
  mocks.engine.analyse.mockResolvedValue({ durationSeconds: 2, peaks: [0.1, 0.3] });
});

describe('recording lifecycle', () => {
  it('ignores repeated record clicks while microphone permission is pending', async () => {
    const permission = deferred<MediaStream>();
    mocks.recorder.start.mockReturnValue(permission.promise);
    const { result } = renderHook(useStudio);
    await waitFor(() => expect(result.current.isReady).toBe(true));
    let start: Promise<void>;
    act(() => { start = result.current.toggleRecording(); void result.current.toggleRecording(); });
    expect(result.current.isBusy).toBe(true);
    expect(mocks.recorder.start).toHaveBeenCalledTimes(1);
    await act(async () => { permission.resolve({} as MediaStream); await start; });
    expect(result.current.isRecording).toBe(true);
    expect(result.current.isBusy).toBe(false);
    expect(mocks.engine.startMonitor).not.toHaveBeenCalled();
    await act(async () => { await result.current.toggleRecording(); });
    expect(result.current.project.takes).toHaveLength(1);
    expect(mocks.recorder.stop).toHaveBeenCalledTimes(1);
  });

  it('keeps finishing a take locked until the captured audio is saved', async () => {
    const audio = deferred<Blob>();
    mocks.recorder.stop.mockReturnValue(audio.promise);
    const { result } = renderHook(useStudio);
    await waitFor(() => expect(result.current.isReady).toBe(true));
    await act(async () => { await result.current.toggleRecording(); });
    let stop: Promise<void>;
    act(() => { stop = result.current.toggleRecording(); void result.current.toggleRecording(); });
    expect(result.current.isBusy).toBe(true);
    expect(mocks.recorder.stop).toHaveBeenCalledTimes(1);
    expect(mocks.recorder.start).toHaveBeenCalledTimes(1);
    await act(async () => { audio.resolve(new Blob(['take'])); await stop; });
    expect(result.current.project.takes).toHaveLength(1);
    expect(result.current.isBusy).toBe(false);
  });

  it('restores the session with microphone playback off for speakers', async () => {
    mocks.store.load.mockResolvedValue({ ...createDefaultProject(), monitorEnabled: true });
    const { result } = renderHook(useStudio);
    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.project.monitorEnabled).toBe(false);
  });

  it('releases a microphone that arrives after leaving the studio', async () => {
    const permission = deferred<MediaStream>();
    mocks.recorder.start.mockReturnValue(permission.promise);
    const { result, unmount } = renderHook(useStudio);
    await waitFor(() => expect(result.current.isReady).toBe(true));
    let start: Promise<void>;
    act(() => { start = result.current.toggleRecording(); });
    unmount();
    const disposals = mocks.recorder.dispose.mock.calls.length;
    await act(async () => { permission.resolve({} as MediaStream); await start; });
    expect(mocks.recorder.dispose).toHaveBeenCalledTimes(disposals + 1);
    expect(mocks.engine.startInputMeter).not.toHaveBeenCalled();
  });
});
