export function extractPeaks(samples: Float32Array, bucketCount: number): number[] {
  const count = Math.max(1, Math.floor(bucketCount));

  if (samples.length === 0) {
    return Array.from({ length: count }, () => 0);
  }

  return Array.from({ length: count }, (_, bucket) => {
    const start = Math.floor((bucket * samples.length) / count);
    const end = Math.max(start + 1, Math.floor(((bucket + 1) * samples.length) / count));
    let peak = 0;

    for (let index = start; index < Math.min(end, samples.length); index += 1) {
      peak = Math.max(peak, Math.abs(samples[index] ?? 0));
    }

    return Number(peak.toFixed(4));
  });
}

export function formatDuration(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`;
}
