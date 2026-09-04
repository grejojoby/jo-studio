import { useState, type CSSProperties, type ComponentType } from 'react';
import { EFFECT_RANGES, PRESETS } from '../audio/presets';
import type { EffectSettings, MacroSettings, PresetId } from '../audio/types';
import type { StudioProject } from '../studio-model';
import { ChevronIcon, ClarityIcon, CloseIcon, DelayIcon, ReverbIcon, SmoothnessIcon, WarmthIcon } from './Icons';

interface EffectControlsProps {
  project: StudioProject;
  disabled: boolean;
  onPreset: (id: PresetId) => void;
  onMacro: (name: keyof MacroSettings, value: number) => void;
  onEffect: (name: keyof EffectSettings, value: number) => void;
}

const macros: Array<{ key: keyof MacroSettings; label: string; Icon: ComponentType }> = [
  { key: 'clarity', label: 'Clarity', Icon: ClarityIcon },
  { key: 'warmth', label: 'Warmth', Icon: WarmthIcon },
  { key: 'smoothness', label: 'Smoothness', Icon: SmoothnessIcon },
  { key: 'reverb', label: 'Reverb', Icon: ReverbIcon },
  { key: 'delay', label: 'Delay', Icon: DelayIcon },
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
    <section className="effects-panel sound-rack" aria-labelledby="sound-heading">
      <h2 id="sound-heading">Sound</h2>

      <div className="preset-group" role="group" aria-label="Vocal presets">
        {PRESETS.map((preset) => (
          <button
            className="preset-button"
            data-active={project.presetId === preset.id}
            type="button"
            key={preset.id}
            disabled={disabled}
            aria-pressed={project.presetId === preset.id}
            title={preset.description}
            onClick={() => onPreset(preset.id)}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="macro-list">
        {macros.map(({ key, label, Icon }) => (
          <label className="macro-control" key={key}
            style={{ '--dial-value': project.macros[key] } as DialStyle}>
            <span className="control-icon" aria-hidden="true"><Icon /></span>
            <span className="control-copy">{label}</span>
            <span className="macro-dial">
              <svg className="dial-ticks" viewBox="0 0 100 100" aria-hidden="true">
                <path d="M 17.5 82.5 A 46 46 0 1 1 82.5 82.5" pathLength="270" fill="none" strokeDasharray="1.4 8.6" strokeDashoffset="0.7" />
              </svg>
              <span className="dial-face" aria-hidden="true"><span className="dial-pointer" /></span>
              <input className="dial-input" type="range" min="0" max="100" value={project.macros[key]} disabled={disabled}
                aria-label={label} onChange={(event) => onMacro(key, Number(event.target.value))} />
            </span>
            <output>{Math.round(project.macros[key])}%</output>
          </label>
        ))}
      </div>

      <button className="advanced-toggle" type="button" aria-expanded={advancedOpen}
        aria-controls="advanced-controls" onClick={() => setAdvancedOpen((open) => !open)}>
        Advanced controls <ChevronIcon />
      </button>

      <div id="advanced-controls" className="advanced-surface" hidden={!advancedOpen}>
        <div className="advanced-heading">
          <h3>Advanced</h3>
          <button className="icon-button" type="button" onClick={() => setAdvancedOpen(false)}
            aria-label="Close fine controls"><CloseIcon /></button>
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
