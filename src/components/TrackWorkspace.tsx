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
  recording: boolean;
  playing: boolean;
  positionSeconds: number;
  livePeaks: number[];
}

function chosenFile(event: ChangeEvent<HTMLInputElement>, action: (file: File) => void) {
  const file = event.target.files?.[0];
  if (file) action(file);
  event.target.value = '';
}

const METER_SEGMENTS = 24;

function Meter({ level }: { level: number }) {
  const lit = Math.round(level * METER_SEGMENTS);
  return (
    <span className="meter-block" aria-hidden="true">
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
        disabled={disabled} aria-valuetext={`${Math.round(value * 100)}%`}
        onChange={(event) => onChange(Number(event.target.value))} />
    </span>
  );
}

export function TrackWorkspace({ project, selectedTake, disabled, onBacking, onVocal, onRemoveBacking,
  onChooseTake, onRemoveTake, onNewTake, levels, onLevel, onMonitoring, transport,
  recording, playing, positionSeconds, livePeaks }: TrackWorkspaceProps) {
  const takeLabel = (take: VocalTake) => take.name.split(' · ')[0];
  const duration = Math.max(project.backing?.durationSeconds ?? 0, selectedTake?.durationSeconds ?? 0, 1);
  const progress = Math.min(100, positionSeconds / duration * 100);

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
              {project.backing ? <div className="audio-region" style={{ width: `${project.backing.durationSeconds / duration * 100}%` }}><Waveform peaks={project.backing.peaks} /></div>
                : <div className="empty-track"><SpeakerIcon /><div><strong>Add your backing track</strong><p>Optional. You can record just your voice.</p></div></div>}
              {(playing || recording) && project.backing && <span className="playhead" style={{ left: `${progress}%` }} aria-hidden="true" />}
            </div>
          </article>

          <article className="waveform-channel vocal-lane">
            <header className="channel-header">
              <div className="channel-identity"><h3>{recording ? 'Recording vocal' : 'Your voice'}</h3>{!recording && selectedTake && <p>{selectedTake.name}</p>}</div>
              <div className="channel-actions">
                <input className="visually-hidden" id="vocal-file" type="file" accept="audio/*"
                  disabled={disabled} aria-label="Import vocal" onChange={(event) => chosenFile(event, onVocal)} />
                <label className="text-button" aria-disabled={disabled} htmlFor="vocal-file">Import</label>
                <span className="channel-duration">{recording ? formatDuration(positionSeconds) : selectedTake ? formatDuration(selectedTake.durationSeconds) : '--:--'}</span>
              </div>
            </header>
            <div className="channel-waveform">
              {recording ? <div className="live-input"><span>Live input · last 8 seconds</span><Waveform peaks={livePeaks} active bars={160} /></div>
                : selectedTake ? <div className="audio-region" style={{ width: `${selectedTake.durationSeconds / duration * 100}%` }}><Waveform peaks={selectedTake.peaks} active /></div>
                  : <div className="empty-track"><MicIcon /><div><strong>Ready for your first take</strong><p>Press Record, or import a vocal.</p></div></div>}
              {playing && selectedTake && <span className="playhead" style={{ left: `${progress}%` }} aria-hidden="true" />}
            </div>
          </article>
          <div className="timeline-ruler" aria-hidden="true"><span>00:00</span><span>{duration > 1 ? formatDuration(duration / 2) : ''}</span><span>{project.backing || selectedTake ? formatDuration(duration) : 'No audio yet'}</span></div>
        </div>

        <div className="mixer-stage">
          <div className="channel-strip backing-strip">
            <span className="strip-label">Backing</span>
            <div className="strip-controls">
              <Meter level={levels.backing} />
              <Fader label="Backing level" value={project.backingVolume} disabled={disabled}
                onChange={(value) => onLevel('backingVolume', value)} />
            </div>
            <output className="strip-readout" aria-label="Backing level"><span>{Math.round(project.backingVolume * 100)}%</span></output>
          </div>

          {transport}

          <div className="channel-strip vocal-strip">
            <span className="strip-label">Your voice</span>
            <div className="strip-controls">
              <Meter level={levels.vocal} />
              <Fader label="Vocal level" value={project.vocalVolume} disabled={disabled}
                onChange={(value) => onLevel('vocalVolume', value)} />
            </div>
            <output className="strip-readout" aria-label="Vocal level">{Math.round(project.vocalVolume * 100)}%</output>
          </div>
        </div>
      </div>

      <div className="monitor-settings">
        <label className="monitor-toggle" data-on={project.monitorEnabled}>
          <input type="checkbox" checked={project.monitorEnabled} disabled={disabled}
            aria-describedby="monitor-help" onChange={(event) => onMonitoring(event.target.checked)} />
          <HeadphonesIcon /><span>Hear myself</span>
        </label>
        <p id="monitor-help">{project.monitorEnabled ? 'Use wired headphones. Live tone & space; full polish on playback.' : 'Off for speakers. Use headphones to hear your voice as you record.'}</p>
      </div>

      <div className="takes-deck">
        <h3 className="takes-heading">Takes</h3>
        {project.takes.length === 0 && <p className="takes-empty">Your recordings will appear here. Keep a few and choose your favourite.</p>}
        <ol className="take-list">
          {[...project.takes].sort((a, b) => b.createdAt - a.createdAt).map((take) => {
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
