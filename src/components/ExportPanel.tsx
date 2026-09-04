import { useEffect, useState } from 'react';
import type { ExportFormat, ExportTarget } from '../hooks/useStudio';

interface ExportPanelProps {
  disabled: boolean;
  exporting: boolean;
  hasBacking: boolean;
  onExport: (format: ExportFormat, target: ExportTarget) => void;
}

export function ExportPanel({ disabled, exporting, hasBacking, onExport }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>('wav');
  const [target, setTarget] = useState<ExportTarget>(() => hasBacking ? 'mix' : 'vocal');

  useEffect(() => {
    if (!hasBacking && target === 'mix') setTarget('vocal');
  }, [hasBacking, target]);

  return (
    <section className="export-panel" aria-labelledby="export-heading">
      <div>
        <p className="section-number">03 / bounce</p>
        <h2 id="export-heading">Master out.</h2>
        <p>Rendered on this device.</p>
      </div>
      <div className="export-options">
        <label>Audio file
          <select value={format} disabled={exporting} onChange={(event) => setFormat(event.target.value as ExportFormat)}>
            <option value="wav">WAV · lossless</option>
            <option value="mp3">MP3 · 192 kbps</option>
          </select>
        </label>
        <label>Include
          <select value={target} disabled={exporting} onChange={(event) => setTarget(event.target.value as ExportTarget)}>
            <option value="mix" disabled={!hasBacking}>Vocal + backing</option>
            <option value="vocal">Processed vocal only</option>
          </select>
        </label>
        <button className="export-button" type="button" disabled={disabled || exporting}
          onClick={() => onExport(format, target)}>
          {exporting ? 'Rendering…' : 'Export audio'} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  );
}
