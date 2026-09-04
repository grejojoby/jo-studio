import { formatDuration } from '../audio/waveform';

interface TransportProps {
  canPlay: boolean;
  disabled: boolean;
  recording: boolean;
  playing: boolean;
  positionSeconds: number;
  onRecord: () => void;
  onPlay: () => void;
}

export function Transport({ canPlay, disabled, recording, playing, positionSeconds, onRecord, onPlay }: TransportProps) {
  return (
    <div className="transport" aria-label="Studio transport">
      <output className="transport-time" aria-label="Playback position">{formatDuration(positionSeconds)}</output>
      <span className="transport-state">{recording ? 'Recording' : playing ? 'Playing' : 'Ready'}</span>
      <div className="transport-actions">
        <button className="play-button" type="button" disabled={!canPlay || disabled}
          aria-pressed={playing} onClick={onPlay}>
          <span className="play-icon" aria-hidden="true">{playing ? '■' : '▶'}</span>
          <span className="visually-hidden">{playing ? 'Stop preview' : 'Preview'}</span>
        </button>
      <button className="record-button" type="button" disabled={disabled && !recording}
        aria-pressed={recording} onClick={onRecord}>
        <span className="record-core" aria-hidden="true"><span className="record-dot" /></span>
        <span className="visually-hidden">{recording ? 'Stop & keep take' : 'Record a take'}</span>
      </button>
      </div>
      <p><span aria-hidden="true">⌁</span> Headphones recommended</p>
    </div>
  );
}
