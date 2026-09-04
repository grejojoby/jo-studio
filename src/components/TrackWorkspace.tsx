import type { ChangeEvent } from 'react';
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

function EmptyTrack({ message, active = false }: { message: string; active?: boolean }) {
  return (
    <div className="empty-lane">
      <Waveform peaks={active ? idleVocalPeaks : idleBackingPeaks} active={active} />
      <p>{message}</p>
    </div>
  );
}

export function TrackWorkspace({ project, selectedTake, disabled, onBacking, onVocal,
  onRemoveBacking, onChooseTake, onRemoveTake, onLevel, onMonitoring }: TrackWorkspaceProps) {
  return (
    <section className="track-workspace" aria-labelledby="tracks-heading">
      <div className="section-heading-row">
        <div>
          <p className="section-number">01 / arrangement</p>
          <h2 id="tracks-heading">Two tracks. One take.</h2>
        </div>
        <span className="subtle-label">dry masters kept</span>
      </div>

      <article className="track-lane backing-lane">
        <header className="lane-header">
          <div><span className="track-index">B</span><div><h3>Backing</h3><p>Karaoke · accompaniment</p></div></div>
          <div className="lane-actions">
            <input className="visually-hidden" id="backing-file" type="file" accept="audio/*"
              disabled={disabled} aria-label="Add backing track"
              onChange={(event) => chosenFile(event, onBacking)} />
            <label className="text-button" aria-disabled={disabled} htmlFor="backing-file">
              {project.backing ? 'Replace' : 'Add audio'}
            </label>
            {project.backing && <button className="icon-button" type="button" disabled={disabled}
              aria-label="Remove backing track" onClick={onRemoveBacking}>×</button>}
          </div>
        </header>
        {project.backing ? (
          <div className="waveform-row">
            <div className="asset-meta"><strong>{project.backing.name}</strong><span>{formatDuration(project.backing.durationSeconds)}</span></div>
            <Waveform peaks={project.backing.peaks} />
          </div>
        ) : <EmptyTrack message="Add a backing track to sing along." />}
        <label className="track-volume">
          <span>Backing level</span>
          <input type="range" min="0" max="1" step="0.01" value={project.backingVolume}
            disabled={disabled} onChange={(event) => onLevel('backingVolume', Number(event.target.value))} />
          <output>{Math.round(project.backingVolume * 100)}%</output>
        </label>
      </article>

      <article className="track-lane vocal-lane">
        <header className="lane-header">
          <div><span className="track-index vocal-index">V</span><div><h3>Lead vocal</h3><p>Live take · dry import</p></div></div>
          <div className="lane-actions">
            <input className="visually-hidden" id="vocal-file" type="file" accept="audio/*"
              disabled={disabled} aria-label="Import vocal"
              onChange={(event) => chosenFile(event, onVocal)} />
            <label className="text-button" aria-disabled={disabled} htmlFor="vocal-file">Import vocal</label>
          </div>
        </header>
        {selectedTake ? (
          <div className="waveform-row">
            <div className="asset-meta"><strong>{selectedTake.name}</strong><span>{formatDuration(selectedTake.durationSeconds)}</span></div>
            <Waveform peaks={selectedTake.peaks} active />
          </div>
        ) : <EmptyTrack message="Record or import your lead vocal." active />}
        <div className="vocal-settings">
          <label className="track-volume">
            <span>Vocal level</span>
            <input type="range" min="0" max="1" step="0.01" value={project.vocalVolume}
              disabled={disabled} onChange={(event) => onLevel('vocalVolume', Number(event.target.value))} />
            <output>{Math.round(project.vocalVolume * 100)}%</output>
          </label>
          <label className="monitor-toggle">
            <input type="checkbox" checked={project.monitorEnabled} disabled={disabled}
              onChange={(event) => onMonitoring(event.target.checked)} />
            Hear effects while recording <small>headphones required</small>
          </label>
        </div>
      </article>

      <div className="takes-block">
        <div className="takes-heading"><h3>Takes</h3><span>{project.takes.length} saved locally</span></div>
        {project.takes.length === 0 ? <p className="empty-takes">Record a few full takes, then keep the one that feels right.</p> : (
          <ol className="take-list">
            {project.takes.map((take) => (
              <li key={take.id} data-selected={take.id === project.selectedTakeId}>
                <button className="take-choice" type="button" disabled={disabled}
                  aria-pressed={take.id === project.selectedTakeId} onClick={() => onChooseTake(take.id)}>
                  <span>{take.name}</span><small>{formatDuration(take.durationSeconds)}</small>
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
