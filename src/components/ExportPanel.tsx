import { useEffect, useState } from 'react';
import type { ExportFormat, ExportTarget } from '../hooks/useStudio';
import { UploadIcon } from './Icons';

interface ExportPanelProps {
  disabled: boolean;
  exporting: boolean;
  hasBacking: boolean;
  onExport: (format: ExportFormat, target: ExportTarget) => void;
}

export function ExportPanel({ disabled, exporting, hasBacking, onExport }: ExportPanelProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('wav');
  const [target, setTarget] = useState<ExportTarget>(() => hasBacking ? 'mix' : 'vocal');

  useEffect(() => {
    if (!hasBacking && target === 'mix') setTarget('vocal');
  }, [hasBacking, target]);

  return (
    <div className="export-panel">
      <button className="export-trigger" type="button" disabled={disabled || exporting}
        aria-expanded={open} aria-controls="export-options" aria-label="Export audio"
        onClick={() => setOpen((visible) => !visible)}>
        <UploadIcon />{exporting ? 'Rendering…' : 'Export'}
      </button>
      {open && <div className="export-options" id="export-options" role="group" aria-label="Export options">
        <div className="export-popover-heading"><strong>Export master</strong><span>Rendered on this device</span></div>
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
          onClick={() => { onExport(format, target); setOpen(false); }}>
          {exporting ? 'Rendering…' : `Render ${format.toUpperCase()}`} <span aria-hidden="true">↗</span>
        </button>
      </div>}
    </div>
  );
}
