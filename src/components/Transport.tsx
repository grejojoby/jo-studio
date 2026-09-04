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
      <button className="record-button" type="button" disabled={disabled && !recording}
        aria-pressed={recording} onClick={onRecord}>
        <span className="record-dot" aria-hidden="true" />
        {recording ? 'Stop & keep take' : 'Record a take'}
      </button>
      <button className="play-button" type="button" disabled={!canPlay || disabled}
        aria-pressed={playing} onClick={onPlay}>
        <span aria-hidden="true">{playing ? '■' : '▶'}</span>
        {playing ? 'Stop preview' : 'Preview'}
      </button>
      <output className="transport-time" aria-label="Playback position">{formatDuration(positionSeconds)}</output>
      <p><span aria-hidden="true">⌁</span> Headphones make monitoring safer.</p>
    </div>
  );
}
