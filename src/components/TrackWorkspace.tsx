import type { ChangeEvent, ReactNode } from 'react';
import { formatDuration } from '../audio/waveform';
import type { StudioProject, VocalTake } from '../studio-model';
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
  onLevel: (track: 'vocalVolume' | 'backingVolume', value: number) => void;
  onMonitoring: (enabled: boolean) => void;
  transport: ReactNode;
}

function chosenFile(event: ChangeEvent<HTMLInputElement>, action: (file: File) => void) {
  const file = event.target.files?.[0];
  if (file) action(file);
  event.target.value = '';
}

const idleBackingPeaks = [0.08, 0.18, 0.12, 0.28, 0.2, 0.34, 0.16, 0.24, 0.38, 0.2, 0.3, 0.16,
  0.26, 0.42, 0.24, 0.32, 0.18, 0.28, 0.14, 0.35, 0.2, 0.3, 0.12, 0.22];
const idleVocalPeaks = [0.04, 0.08, 0.12, 0.3, 0.62, 0.34, 0.2, 0.44, 0.76, 0.38, 0.18, 0.26,
  0.58, 0.84, 0.42, 0.2, 0.32, 0.68, 0.36, 0.18, 0.48, 0.72, 0.3, 0.1];

function EmptyTrack({ active = false }: { active?: boolean }) {
  return (
    <div className="empty-lane">
      <Waveform peaks={active ? idleVocalPeaks : idleBackingPeaks} active={active} />
    </div>
  );
}

function Meter() {
  return <span className="level-meter" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>;
}

export function TrackWorkspace({ project, selectedTake, disabled, onBacking, onVocal,
  onRemoveBacking, onChooseTake, onRemoveTake, onLevel, onMonitoring, transport }: TrackWorkspaceProps) {
  return (
    <section className="track-workspace" aria-labelledby="tracks-heading">
      <h2 className="visually-hidden" id="tracks-heading">Session tracks</h2>
      <div className="waveform-stage">
        <article className="waveform-channel backing-lane">
          <header className="channel-header">
            <div className="channel-identity"><span className="track-icon backing-icon" aria-hidden="true">♫</span><div><h3>Backing</h3><p>{project.backing?.name ?? 'Karaoke or accompaniment'}</p></div></div>
            <div className="channel-actions">
              <span className="channel-duration">{project.backing ? formatDuration(project.backing.durationSeconds) : '00:00'}</span>
            <input className="visually-hidden" id="backing-file" type="file" accept="audio/*"
              disabled={disabled} aria-label="Add backing track"
              onChange={(event) => chosenFile(event, onBacking)} />
              <label className="text-button" aria-disabled={disabled} htmlFor="backing-file">
                {project.backing ? 'Replace' : '+ Add track'}
            </label>
            {project.backing && <button className="icon-button" type="button" disabled={disabled}
              aria-label="Remove backing track" onClick={onRemoveBacking}>×</button>}
          </div>
          </header>
          <div className="channel-waveform">{project.backing ? <Waveform peaks={project.backing.peaks} /> : <EmptyTrack />}</div>
        </article>

        <article className="waveform-channel vocal-lane">
          <header className="channel-header">
            <div className="channel-identity"><span className="track-icon vocal-icon" aria-hidden="true">●</span><div><h3>Lead vocal</h3><p>{selectedTake?.name ?? 'Live take or dry import'}</p></div></div>
            <div className="channel-actions">
              <span className="channel-duration">{selectedTake ? formatDuration(selectedTake.durationSeconds) : '00:00'}</span>
            <input className="visually-hidden" id="vocal-file" type="file" accept="audio/*"
              disabled={disabled} aria-label="Import vocal"
              onChange={(event) => chosenFile(event, onVocal)} />
              <label className="text-button" aria-disabled={disabled} htmlFor="vocal-file">Import</label>
          </div>
          </header>
          <div className="channel-waveform">{selectedTake ? <Waveform peaks={selectedTake.peaks} active /> : <EmptyTrack active />}</div>
        </article>
        <span className="playhead" aria-hidden="true"><i /></span>
      </div>

      <div className="mixer-stage">
        <label className="channel-strip backing-strip">
          <span className="strip-label">Backing</span>
          <span className="strip-controls"><Meter /><input className="vertical-fader" aria-label="Backing level" type="range" min="0" max="1" step="0.01" value={project.backingVolume}
            disabled={disabled} onChange={(event) => onLevel('backingVolume', Number(event.target.value))} /></span>
          <output>{Math.round(project.backingVolume * 100)}%</output>
        </label>
        {transport}
        <div className="vocal-strip-wrap">
          <label className="channel-strip vocal-strip">
            <span className="strip-label">Lead vocal</span>
            <span className="strip-controls"><Meter /><input className="vertical-fader" aria-label="Vocal level" type="range" min="0" max="1" step="0.01" value={project.vocalVolume}
              disabled={disabled} onChange={(event) => onLevel('vocalVolume', Number(event.target.value))} /></span>
            <output>{Math.round(project.vocalVolume * 100)}%</output>
          </label>
          <label className="monitor-toggle">
            <input type="checkbox" checked={project.monitorEnabled} disabled={disabled}
              onChange={(event) => onMonitoring(event.target.checked)} />
            Live effects <small>Headphones</small>
          </label>
        </div>
      </div>

      <div className="takes-deck">
        <div className="takes-heading"><h3>Takes</h3><span>{project.takes.length} saved locally</span></div>
        {project.takes.length === 0 ? <div className="new-take-card"><span>+</span><strong>New take</strong><small>Press record to begin</small></div> : (
          <ol className="take-list">
            {project.takes.map((take) => (
              <li key={take.id} data-selected={take.id === project.selectedTakeId}>
                <button className="take-choice" type="button" disabled={disabled}
                  aria-pressed={take.id === project.selectedTakeId} onClick={() => onChooseTake(take.id)}>
                  <span className="take-meta"><strong>{take.name}</strong><small>{formatDuration(take.durationSeconds)}</small></span>
                  <Waveform peaks={take.peaks} active={take.id === project.selectedTakeId} />
                </button>
                <button className="icon-button" type="button" disabled={disabled}
                  aria-label={`Delete ${take.name}`} onClick={() => onRemoveTake(take.id)}>×</button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
