import type { ChangeEvent, ReactNode } from 'react';
import { formatDuration } from '../audio/waveform';
import type { LiveLevels } from '../audio/audio-engine';
import type { StudioProject, VocalTake } from '../studio-model';
import { CloseIcon, HeadphonesIcon, MicIcon, PlayIcon, PlusIcon, SpeakerIcon } from './Icons';
import { Waveform } from './Waveform';

interface TrackWorkspaceProps {
  project: StudioProject;
  selectedTake?: VocalTake;
  disabled: boolean;
  onBacking: (file: File) => void;
  onVocal: (file: File) => void;
  onRemoveBacking: () => void;
  onChooseTake: (id: string) => void;
  onRemoveTake: (id: string) => void;
  onNewTake: () => void;
  levels: LiveLevels;
  onLevel: (track: 'vocalVolume' | 'backingVolume', value: number) => void;
  onMonitoring: (enabled: boolean) => void;
  transport: ReactNode;
}

function chosenFile(event: ChangeEvent<HTMLInputElement>, action: (file: File) => void) {
  const file = event.target.files?.[0];
  if (file) action(file);
  event.target.value = '';
}

function noise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const idleBackingPeaks = Array.from({ length: 320 }, (_, i) => 0.28 + noise(i) * 0.5 + Math.sin(i / 9) * 0.06);
const idleVocalPeaks = Array.from({ length: 320 }, (_, i) => {
  const phrase = Math.max(0, Math.sin(i / 17) * Math.sin(i / 41 + 1.3));
  return 0.03 + phrase * (0.35 + noise(i + 7) * 0.65);
});

const METER_SCALE = ['12', '6', '0', '-6', '-12', '-24', '-∞'];
const METER_SEGMENTS = 24;

function Meter({ level }: { level: number }) {
  const lit = Math.round(level * (METER_SEGMENTS - 3));
  return (
    <span className="meter-block" aria-hidden="true">
      <span className="meter-scale">{METER_SCALE.map((mark) => <i key={mark}>{mark}</i>)}</span>
      <span className="level-meter">
        {Array.from({ length: METER_SEGMENTS }, (_, index) => (
          <i key={index} data-lit={index < lit} data-zone={index >= METER_SEGMENTS - 3 ? 'hot' : index >= METER_SEGMENTS - 7 ? 'warm' : 'safe'} />
        ))}
      </span>
    </span>
  );
}

function Fader({ label, value, disabled, onChange }: { label: string; value: number; disabled: boolean; onChange: (value: number) => void }) {
  return (
    <span className="fader-rail">
      <input className="vertical-fader" aria-label={label} type="range" min="0" max="1" step="0.01" value={value}
        disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} />
    </span>
  );
}

export function TrackWorkspace({ project, selectedTake, disabled, onBacking, onVocal, onRemoveBacking,
  onChooseTake, onRemoveTake, onNewTake, levels, onLevel, onMonitoring, transport }: TrackWorkspaceProps) {
  const takeLabel = (take: VocalTake) => take.name.split(' · ')[0];

  return (
    <section className="track-workspace" aria-labelledby="tracks-heading">
      <h2 className="visually-hidden" id="tracks-heading">Session tracks</h2>

      <div className="console-card">
        <div className="waveform-stage">
          <article className="waveform-channel backing-lane">
            <header className="channel-header">
              <div className="channel-identity"><h3>Backing</h3>{project.backing && <p>{project.backing.name}</p>}</div>
              <div className="channel-actions">
                <input className="visually-hidden" id="backing-file" type="file" accept="audio/*"
                  disabled={disabled} aria-label="Add backing track" onChange={(event) => chosenFile(event, onBacking)} />
                <label className="text-button" aria-disabled={disabled} htmlFor="backing-file">
                  {project.backing ? 'Replace' : 'Add track'}
                </label>
                {project.backing && <button className="icon-button" type="button" disabled={disabled}
                  aria-label="Remove backing track" onClick={onRemoveBacking}><CloseIcon /></button>}
                <span className="channel-duration">{project.backing ? formatDuration(project.backing.durationSeconds) : '--:--'}</span>
              </div>
            </header>
            <div className="channel-waveform">
              {project.backing ? <Waveform peaks={project.backing.peaks} /> : <Waveform peaks={idleBackingPeaks} />}
            </div>
          </article>

          <article className="waveform-channel vocal-lane">
            <header className="channel-header">
              <div className="channel-identity"><h3>Lead vocal</h3>{selectedTake && <p>{selectedTake.name}</p>}</div>
              <div className="channel-actions">
                <input className="visually-hidden" id="vocal-file" type="file" accept="audio/*"
                  disabled={disabled} aria-label="Import vocal" onChange={(event) => chosenFile(event, onVocal)} />
                <label className="text-button" aria-disabled={disabled} htmlFor="vocal-file">Import</label>
                <span className="channel-duration">{selectedTake ? formatDuration(selectedTake.durationSeconds) : '--:--'}</span>
              </div>
            </header>
            <div className="channel-waveform">
              <span className="lane-icon" aria-hidden="true"><MicIcon /></span>
              {selectedTake ? <Waveform peaks={selectedTake.peaks} active /> : <Waveform peaks={idleVocalPeaks} active />}
            </div>
          </article>
          <span className="playhead" aria-hidden="true" />
        </div>

        <div className="mixer-stage">
          <div className="channel-strip backing-strip">
            <span className="strip-label">Backing</span>
            <div className="strip-controls">
              <Meter level={levels.backing} />
              <Fader label="Backing level" value={project.backingVolume} disabled={disabled}
                onChange={(value) => onLevel('backingVolume', value)} />
            </div>
            <output className="strip-readout" aria-label="Backing level"><SpeakerIcon /><span>{Math.round(project.backingVolume * 100)}</span></output>
          </div>

          {transport}

          <div className="channel-strip vocal-strip">
            <span className="strip-label">Lead vocal</span>
            <div className="strip-controls">
              <Meter level={levels.vocal} />
              <Fader label="Vocal level" value={project.vocalVolume} disabled={disabled}
                onChange={(value) => onLevel('vocalVolume', value)} />
            </div>
            <label className="monitor-toggle" data-on={project.monitorEnabled} title="Live effects in headphones">
              <input className="visually-hidden" type="checkbox" checked={project.monitorEnabled} disabled={disabled}
                onChange={(event) => onMonitoring(event.target.checked)} />
              <HeadphonesIcon />
              <span className="visually-hidden">Live effects in headphones</span>
            </label>
          </div>
        </div>
      </div>

      <div className="takes-deck">
        <h3 className="takes-heading">Takes</h3>
        <ol className="take-list">
          {project.takes.map((take) => {
            const selected = take.id === project.selectedTakeId;
            return (
              <li key={take.id} data-selected={selected}>
                <button className="take-choice" type="button" disabled={disabled}
                  aria-pressed={selected} onClick={() => onChooseTake(take.id)}>
                  <span className="take-meta">
                    <span className="take-play" aria-hidden="true">{selected && <PlayIcon />}</span>
                    <strong title={take.name}>{takeLabel(take)}</strong>
                    <small>{formatDuration(take.durationSeconds)}</small>
                  </span>
                  <Waveform peaks={take.peaks} active={selected} bars={140} />
                </button>
                <button className="icon-button take-remove" type="button" disabled={disabled}
                  aria-label={`Delete ${take.name}`} onClick={() => onRemoveTake(take.id)}><CloseIcon /></button>
              </li>
            );
          })}
          <li className="new-take">
            <button className="new-take-card" type="button" disabled={disabled} onClick={onNewTake}>
              <PlusIcon /><span>New take</span>
            </button>
          </li>
        </ol>
      </div>
    </section>
  );
}
