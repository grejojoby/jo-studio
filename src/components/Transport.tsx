import { formatDuration } from '../audio/waveform';
import { PlayIcon, StopIcon } from './Icons';

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
      <span className="transport-state" data-live={recording || playing}>
        {recording ? 'Recording' : playing ? 'Playing your mix' : disabled ? 'Please wait…' : 'Ready to record'}
      </span>
      <div className="transport-actions">
        <div className="preview-control">
          <button className="play-button" type="button" disabled={!canPlay || disabled}
            aria-pressed={playing} onClick={onPlay}>
            {playing ? <StopIcon /> : <PlayIcon />}
            <span>{playing ? 'Stop playback' : 'Play'}</span>
          </button>
        </div>
        <button className="record-button" type="button" disabled={disabled && !recording}
          aria-pressed={recording} onClick={onRecord}>
          <span className="record-core" aria-hidden="true"><span className="record-dot" /></span>
          <span>{recording ? 'Stop & keep take' : 'Record a take'}</span>
        </button>
      </div>
    </div>
  );
}
