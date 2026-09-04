interface WaveformProps {
  peaks: number[];
  active?: boolean;
  bars?: number;
}

/** Resample peaks to a dense bar count so short peak arrays still read as audio. */
function densify(peaks: number[], bars: number): number[] {
  if (peaks.length === 0) return Array.from({ length: bars }, () => 0);
  if (peaks.length >= bars) return peaks;
  return Array.from({ length: bars }, (_, index) => {
    const position = (index / bars) * peaks.length;
    const left = Math.floor(position);
    const right = Math.min(peaks.length - 1, left + 1);
    const mix = position - left;
    const base = peaks[left] * (1 - mix) + peaks[right] * mix;
    const texture = 0.72 + 0.28 * Math.abs(Math.sin(index * 12.9898 + left * 78.233));
    return base * texture;
  });
}

export function Waveform({ peaks, active = false, bars = 440 }: WaveformProps) {
  const width = 1000;
  const height = 100;
  const data = densify(peaks, bars);
  const barWidth = width / data.length;

  return (
    <svg className="waveform" data-active={active} viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none" aria-hidden="true">
      {data.map((peak, index) => {
        const barHeight = Math.max(1.5, Math.min(1, peak) * (height - 6));
        return <rect key={index} x={index * barWidth + barWidth * 0.2} y={(height - barHeight) / 2}
          width={barWidth * 0.6} height={barHeight} />;
      })}
    </svg>
  );
}
