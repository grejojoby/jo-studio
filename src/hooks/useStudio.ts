import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioEngine, assertUsableAudioFile, type LiveLevels } from '../audio/audio-engine';
import { encodeMp3Blob, encodeWavBlob } from '../audio/encode';
import { MicrophoneRecorder } from '../audio/microphone-recorder';
import { renderAudio } from '../audio/render';
import type { EffectSettings, MacroSettings, PresetId } from '../audio/types';
import {
  addTake, changeEffect, changeMacro, deleteTake, selectPreset, selectTake,
  setBacking, setLevel, setMonitoring,
} from '../studio-actions';
import { createDefaultProject, type AudioAsset, type StudioProject } from '../studio-model';
import { ProjectStore } from '../storage/project-store';

export type ExportFormat = 'wav' | 'mp3';
export type ExportTarget = 'mix' | 'vocal';

function errorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'Microphone access was blocked. Allow it in your browser, then try again.';
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function useStudio() {
  const [project, setProject] = useState<StudioProject>(createDefaultProject);
  const [isReady, setReady] = useState(false);
  const [isRecording, setRecording] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [isExporting, setExporting] = useState(false);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [levels, setLevels] = useState<LiveLevels>({ vocal: 0, backing: 0 });
  const [status, setStatus] = useState('Ready when you are.');
  const [error, setError] = useState<string>();
  const engine = useMemo(() => new AudioEngine(), []);
  const recorder = useMemo(() => new MicrophoneRecorder(), []);
  const store = useMemo(() => new ProjectStore(), []);
  const ticker = useRef<number | undefined>(undefined);

  const selectedTake = project.takes.find((take) => take.id === project.selectedTakeId);

  useEffect(() => {
    let cancelled = false;
    store.load()
      .then((saved) => { if (!cancelled && saved) setProject(saved); })
      .catch((cause) => { if (!cancelled) setError(`Could not restore this session: ${errorMessage(cause)}`); })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [store]);

  useEffect(() => {
    if (!isReady) return;
    const timeout = window.setTimeout(() => {
      store.save(project).catch((cause) => setError(`Could not save locally: ${errorMessage(cause)}`));
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [isReady, project, store]);

  useEffect(() => () => {
    if (ticker.current) window.clearInterval(ticker.current);
    void engine.dispose();
    store.close();
  }, [engine, store]);

  const analyseAsset = useCallback(async (file: File): Promise<AudioAsset> => {
    assertUsableAudioFile(file);
    const analysis = await engine.analyse(file);
    return { name: file.name, blob: file, ...analysis };
  }, [engine]);

  const importBacking = useCallback(async (file: File) => {
    setError(undefined);
    setStatus('Reading backing track…');
    try {
      const asset = await analyseAsset(file);
      setProject((current) => setBacking(current, asset));
      setStatus('Backing track ready.');
    } catch (cause) { setError(errorMessage(cause)); setStatus('Backing track not added.'); }
  }, [analyseAsset]);

  const importVocal = useCallback(async (file: File) => {
    setError(undefined);
    setStatus('Reading vocal…');
    try {
      const asset = await analyseAsset(file);
      setProject((current) => addTake(current, {
        ...asset,
        id: crypto.randomUUID(),
        name: `Take ${String(current.takes.length + 1).padStart(2, '0')} · ${file.name}`,
        createdAt: Date.now(),
      }));
      setStatus('Vocal take ready.');
    } catch (cause) { setError(errorMessage(cause)); setStatus('Vocal not added.'); }
  }, [analyseAsset]);

  const stopTicker = useCallback(() => {
    if (ticker.current) window.clearInterval(ticker.current);
    ticker.current = undefined;
    setPositionSeconds(0);
    setLevels({ vocal: 0, backing: 0 });
  }, []);

  const startTicker = useCallback((tick: () => void) => {
    if (ticker.current) window.clearInterval(ticker.current);
    ticker.current = window.setInterval(() => { setLevels(engine.levels); tick(); }, 50);
  }, [engine]);

  const stopPreview = useCallback(() => {
    engine.stopPlayback();
    stopTicker();
    setPlaying(false);
  }, [engine, stopTicker]);

  const togglePreview = useCallback(async () => {
    if (isPlaying) { stopPreview(); return; }
    setError(undefined);
    try {
      await engine.startPlayback({
        vocal: selectedTake?.blob,
        backing: project.backing?.blob,
        effects: project.effects,
        vocalVolume: project.vocalVolume,
        backingVolume: project.backingVolume,
      });
      setPlaying(true);
      setStatus('Playing your current mix.');
      startTicker(() => {
        setPositionSeconds(engine.positionSeconds);
        if (!engine.isPlaying) { stopPreview(); setStatus('Preview finished.'); }
      });
    } catch (cause) { setError(errorMessage(cause)); }
  }, [engine, isPlaying, project, selectedTake, startTicker, stopPreview]);

  const toggleRecording = useCallback(async () => {
    setError(undefined);
    if (isRecording) {
      setRecording(false);
      stopTicker();
      engine.stopInputMeter();
      engine.stopMonitor();
      engine.stopPlayback();
      setStatus('Finishing your take…');
      try {
        const blob = await recorder.stop();
        if (blob.size === 0) throw new Error('The recording was empty. Check your microphone and try again.');
        const analysis = await engine.analyse(blob);
        setProject((current) => addTake(current, {
          ...analysis,
          blob,
          id: crypto.randomUUID(),
          name: `Take ${String(current.takes.length + 1).padStart(2, '0')}`,
          createdAt: Date.now(),
        }));
        setStatus('Take saved locally.');
      } catch (cause) { setError(errorMessage(cause)); setStatus('Take not saved.'); }
      return;
    }

    stopPreview();
    setStatus(project.backing ? 'Preparing the backing track…' : 'Waiting for microphone permission…');
    try {
      if (project.backing) await engine.decode(project.backing.blob);
      const stream = await recorder.start();
      await engine.startInputMeter(stream);
      if (project.monitorEnabled) await engine.startMonitor(stream, project.effects, project.vocalVolume);
      if (project.backing) {
        await engine.startPlayback({
          backing: project.backing.blob, effects: project.effects,
          vocalVolume: project.vocalVolume, backingVolume: project.backingVolume,
        });
      }
      const startedAt = performance.now();
      startTicker(() => setPositionSeconds((performance.now() - startedAt) / 1_000));
      setRecording(true);
      setStatus(project.monitorEnabled ? 'Recording with effects in your headphones.' : 'Recording a dry take.');
    } catch (cause) {
      if (recorder.isRecording) await recorder.stop().catch(() => undefined);
      engine.stopInputMeter();
      engine.stopMonitor();
      engine.stopPlayback();
      setError(errorMessage(cause));
      setStatus('Recording did not start.');
    }
  }, [engine, isRecording, project, recorder, startTicker, stopPreview, stopTicker]);

  const exportAudio = useCallback(async (format: ExportFormat, target: ExportTarget) => {
    if (!selectedTake) return;
    setExporting(true);
    setError(undefined);
    setStatus('Rendering your audio locally…');
    try {
      const [vocal, backing] = await Promise.all([
        engine.decode(selectedTake.blob),
        target === 'mix' && project.backing ? engine.decode(project.backing.blob) : undefined,
      ]);
      const rendered = await renderAudio({
        vocal, backing, effects: project.effects, vocalVolume: project.vocalVolume,
        backingVolume: project.backingVolume, vocalOnly: target === 'vocal',
      });
      const blob = format === 'wav' ? encodeWavBlob(rendered) : encodeMp3Blob(rendered);
      download(blob, `hushline-${target}.${format}`);
      setStatus('Export ready.');
    } catch (cause) { setError(errorMessage(cause)); setStatus('Export failed.'); }
    finally { setExporting(false); }
  }, [engine, project, selectedTake]);

  const clearSession = useCallback(async () => {
    if (!window.confirm('Clear the backing track, every take, and all sound settings from this browser?')) return;
    stopPreview();
    await store.clear();
    setProject(createDefaultProject());
    setStatus('Local session cleared.');
    setError(undefined);
  }, [stopPreview, store]);

  return {
    project, selectedTake, isReady, isRecording, isPlaying, isExporting,
    positionSeconds, levels, status, error, importBacking, importVocal, togglePreview,
    toggleRecording, exportAudio, clearSession,
    removeBacking: () => setProject((current) => setBacking(current)),
    chooseTake: (id: string) => setProject((current) => selectTake(current, id)),
    removeTake: (id: string) => setProject((current) => deleteTake(current, id)),
    choosePreset: (id: PresetId) => setProject((current) => {
      const next = selectPreset(current, id);
      engine.setEffects(next.effects);
      return next;
    }),
    updateMacro: (name: keyof MacroSettings, value: number) => setProject((current) => {
      const next = changeMacro(current, name, value);
      engine.setEffects(next.effects);
      return next;
    }),
    updateEffect: (name: keyof EffectSettings, value: number) => setProject((current) => {
      const next = changeEffect(current, name, value);
      engine.setEffects(next.effects);
      return next;
    }),
    updateLevel: (track: 'vocalVolume' | 'backingVolume', value: number) => {
      engine.setMixLevels(track === 'vocalVolume' ? value : project.vocalVolume,
        track === 'backingVolume' ? value : project.backingVolume);
      setProject((current) => setLevel(current, track, value));
    },
    updateMonitoring: (enabled: boolean) => setProject((current) => setMonitoring(current, enabled)),
  };
}
