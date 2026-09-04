import { useState, type CSSProperties } from 'react';
import { EFFECT_RANGES, PRESETS } from '../audio/presets';
import type { EffectSettings, MacroSettings, PresetId } from '../audio/types';
import type { StudioProject } from '../studio-model';

interface EffectControlsProps {
  project: StudioProject;
  disabled: boolean;
  onPreset: (id: PresetId) => void;
  onMacro: (name: keyof MacroSettings, value: number) => void;
  onEffect: (name: keyof EffectSettings, value: number) => void;
}

const macros: Array<{ key: keyof MacroSettings; label: string; hint: string }> = [
  { key: 'clarity', label: 'Clarity', hint: 'Bring words gently forward' },
  { key: 'warmth', label: 'Warmth', hint: 'Add a little body' },
  { key: 'smoothness', label: 'Smoothness', hint: 'Settle sharp edges' },
  { key: 'reverb', label: 'Reverb', hint: 'Place the voice in a room' },
  { key: 'delay', label: 'Delay', hint: 'Add a quiet echo' },
];

const advanced: Array<{
  key: keyof EffectSettings;
  label: string;
  step: number;
  suffix: string;
}> = [
  { key: 'highPassHz', label: 'High-pass filter', step: 1, suffix: ' Hz' },
  { key: 'warmthDb', label: 'Warm EQ', step: 0.1, suffix: ' dB' },
  { key: 'presenceDb', label: 'Presence EQ', step: 0.1, suffix: ' dB' },
  { key: 'compressorThresholdDb', label: 'Compression threshold', step: 0.5, suffix: ' dB' },
  { key: 'compressorRatio', label: 'Compression ratio', step: 0.1, suffix: ':1' },
  { key: 'deEsserDb', label: 'De-esser', step: 0.1, suffix: ' dB' },
  { key: 'limiterThresholdDb', label: 'Limiter ceiling', step: 0.1, suffix: ' dB' },
  { key: 'reverbSeconds', label: 'Room length', step: 0.05, suffix: ' s' },
  { key: 'reverbMix', label: 'Room mix', step: 0.01, suffix: '' },
  { key: 'delayMs', label: 'Delay time', step: 5, suffix: ' ms' },
  { key: 'delayFeedback', label: 'Delay repeats', step: 0.01, suffix: '' },
  { key: 'delayMix', label: 'Delay mix', step: 0.01, suffix: '' },
];

type DialStyle = CSSProperties & { '--dial-value': number };

export function EffectControls({ project, disabled, onPreset, onMacro, onEffect }: EffectControlsProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <section className="effects-panel" aria-labelledby="sound-heading">
      <div className="section-heading-row">
        <div>
          <p className="section-number">02 / tone desk</p>
          <h2 id="sound-heading">Shape the room.</h2>
        </div>
        <span className="subtle-label">live · non-destructive</span>
      </div>

      <div className="preset-group" role="group" aria-label="Vocal presets">
        {PRESETS.map((preset) => (
          <button
            className="preset-button"
            data-active={project.presetId === preset.id}
            type="button"
            key={preset.id}
            disabled={disabled}
            aria-pressed={project.presetId === preset.id}
            onClick={() => onPreset(preset.id)}
          >
            <span>{preset.name}</span>
            <small>{preset.voice}</small>
          </button>
        ))}
      </div>

      <div className="macro-list">
        {macros.map(({ key, label, hint }) => (
          <label className="macro-control" key={key}
            style={{ '--dial-value': project.macros[key] } as DialStyle}>
            <span className="control-copy"><strong>{label}</strong><small>{hint}</small></span>
            <span className="macro-dial">
              <span className="dial-face" aria-hidden="true"><span className="dial-pointer" /></span>
              <input className="dial-input" type="range" min="0" max="100" value={project.macros[key]} disabled={disabled}
                aria-label={label} onChange={(event) => onMacro(key, Number(event.target.value))} />
            </span>
            <output>{Math.round(project.macros[key])}<span>%</span></output>
          </label>
        ))}
      </div>

      <button className="advanced-toggle" type="button" aria-expanded={advancedOpen}
        aria-controls="advanced-controls" onClick={() => setAdvancedOpen((open) => !open)}>
        Advanced controls <span aria-hidden="true">{advancedOpen ? '−' : '+'}</span>
      </button>

      <div id="advanced-controls" className="advanced-surface" hidden={!advancedOpen}>
        <div className="advanced-heading">
          <div><p className="section-number">Fine controls</p><h3>Under the surface.</h3></div>
          <button className="icon-button" type="button" onClick={() => setAdvancedOpen(false)}
            aria-label="Close fine controls">×</button>
        </div>
        <div className="advanced-grid">
          {advanced.map(({ key, label, step, suffix }) => {
            const range = EFFECT_RANGES[key];
            return (
              <label key={key}>
                <span>{label}</span>
                <input type="range" min={range.min} max={range.max} step={step} value={project.effects[key]}
                  disabled={disabled} aria-label={label}
                  onChange={(event) => onEffect(key, Number(event.target.value))} />
                <output>{Number(project.effects[key].toFixed(2))}{suffix}</output>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
}
