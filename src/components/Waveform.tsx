interface WaveformProps {
  peaks: number[];
  active?: boolean;
}

export function Waveform({ peaks, active = false }: WaveformProps) {
  const width = 640;
  const height = 72;
  const gap = 2;
  const barWidth = width / Math.max(1, peaks.length);

  return (
    <svg className="waveform" data-active={active} viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none" aria-hidden="true">
      {peaks.map((peak, index) => {
        const barHeight = Math.max(2, peak * (height - 8));
        return <rect key={index} x={index * barWidth} y={(height - barHeight) / 2}
          width={Math.max(1, barWidth - gap)} height={barHeight} rx="1" />;
      })}
    </svg>
  );
}
