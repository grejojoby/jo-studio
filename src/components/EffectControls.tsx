import { useRef, useState } from 'react';
import { EFFECT_RANGES, getPreset, PRESETS } from '../audio/presets';
import type { EffectSettings, MacroSettings, PresetId } from '../audio/types';
import type { StudioProject } from '../studio-model';
import { ChevronIcon } from './Icons';

interface EffectControlsProps {
  project: StudioProject;
  disabled: boolean;
  onPreset: (id: PresetId) => void;
  onMacro: (name: keyof MacroSettings, value: number) => void;
  onEffect: (name: keyof EffectSettings, value: number) => void;
}

const macros: Array<{ key: keyof MacroSettings; label: string; description: string; low: string; high: string }> = [
  { key: 'clarity', label: 'Clarity', description: 'Bring your voice forward.', low: 'Soft', high: 'Crisp' },
  { key: 'warmth', label: 'Warmth', description: 'Give your voice a fuller body.', low: 'Light', high: 'Full' },
  { key: 'smoothness', label: 'Smoothness', description: 'Even out loud notes and sharp edges.', low: 'Natural', high: 'Polished' },
  { key: 'reverb', label: 'Room', description: 'Add a little space around your voice.', low: 'Intimate', high: 'Spacious' },
  { key: 'delay', label: 'Echo', description: 'Add soft repeats behind your voice.', low: 'Subtle', high: 'Distinct' },
];

interface FineControl {
  key: keyof EffectSettings;
  label: string;
  description: string;
  step: number;
  unit: string;
  words?: [string, string, string];
  reverse?: boolean;
}

const groups: Array<{ name: string; controls: FineControl[] }> = [
  { name: 'Tone', controls: [
    { key: 'highPassHz', label: 'Reduce rumble', description: 'Remove low rumbles from your recording.', step: 1, unit: ' Hz', words: ['Gentle', 'Balanced', 'Strong'] },
    { key: 'warmthDb', label: 'Vocal body', description: 'Make your voice lighter or fuller.', step: 0.1, unit: ' dB', words: ['Light', 'Balanced', 'Full'] },
    { key: 'presenceDb', label: 'Vocal detail', description: 'Bring out words and texture.', step: 0.1, unit: ' dB', words: ['Soft', 'Clear', 'Crisp'] },
  ] },
  { name: 'Smoothness', controls: [
    { key: 'compressorThresholdDb', label: 'Even out volume', description: 'Choose how often loud notes are softened.', step: 0.5, unit: ' dB', words: ['Occasional', 'Balanced', 'Frequent'], reverse: true },
    { key: 'compressorRatio', label: 'Soften loud notes', description: 'Control how firmly loud notes are held back.', step: 0.1, unit: ':1', words: ['Gentle', 'Medium', 'Firm'] },
    { key: 'deEsserDb', label: 'Soften sharp S sounds', description: 'Turn down the brightest, hissy edges.', step: 0.1, unit: ' dB', words: ['Gentle', 'Medium', 'Strong'] },
    { key: 'limiterThresholdDb', label: 'Peak protection', description: 'Leave extra room for the loudest peaks.', step: 0.1, unit: ' dB', words: ['Light', 'Balanced', 'Extra'], reverse: true },
  ] },
  { name: 'Room & echo', controls: [
    { key: 'reverbSeconds', label: 'Room size', description: 'From a small room to a longer, airy space.', step: 0.05, unit: ' s', words: ['Small', 'Medium', 'Large'] },
    { key: 'reverbMix', label: 'Room amount', description: 'How much room sound sits behind your voice.', step: 0.01, unit: '%' },
    { key: 'delayMs', label: 'Echo spacing', description: 'The pause between your voice and its echo.', step: 5, unit: ' ms', words: ['Close', 'Relaxed', 'Wide'] },
    { key: 'delayFeedback', label: 'Echo repeats', description: 'How much of each echo carries into the next.', step: 0.01, unit: '%' },
    { key: 'delayMix', label: 'Echo amount', description: 'How loud the echoes are behind your voice.', step: 0.01, unit: '%' },
  ] },
];

function displayValue(control: FineControl, value: number, exact: boolean): string {
  if (control.unit === '%') return `${Number((value * 100).toFixed(1))}%`;
  if (exact) return `${Number(value.toFixed(2))}${control.unit}`;
  if (control.key === 'deEsserDb' && value === 0) return 'Off';
  const range = EFFECT_RANGES[control.key];
  const position = (value - range.min) / (range.max - range.min);
  const strength = control.reverse ? 1 - position : position;
  return control.words![Math.min(2, Math.floor(strength * 3))];
}

export function EffectControls({ project, disabled, onPreset, onMacro, onEffect }: EffectControlsProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showExact, setShowExact] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const preset = getPreset(project.presetId);

  return (
    <section className="effects-panel sound-rack" aria-labelledby="sound-heading"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && advancedOpen) { setAdvancedOpen(false); toggleRef.current?.focus(); }
      }}>
      <div className="sound-heading">
        <div><span className="eyebrow">Make it yours</span><h2 id="sound-heading">Your sound</h2></div>
        <button type="button" className="text-button" disabled={disabled} onClick={() => onPreset(project.presetId)}>Reset sound</button>
      </div>
      <div className="simple-sound" hidden={advancedOpen}>
        <div className="preset-group" role="group" aria-label="Vocal presets">
          {PRESETS.map((item) => (
            <button className="preset-button" data-active={project.presetId === item.id} type="button" key={item.id}
              disabled={disabled} aria-pressed={project.presetId === item.id} title={item.description}
              onClick={() => onPreset(item.id)}>{item.name}</button>
          ))}
        </div>
        <p className="preset-description">{preset.description}</p>
        <div className="macro-list">
          {macros.map(({ key, label, description, low, high }) => (
            <label className="macro-control" htmlFor={`macro-${key}`} key={key}>
              <span className="control-heading"><span>{label}</span><output>{Math.round(project.macros[key])}%</output></span>
              <span className="control-description" id={`macro-${key}-help`}>{description}</span>
              <input id={`macro-${key}`} type="range" min="0" max="100" value={project.macros[key]} disabled={disabled}
                aria-label={label} aria-describedby={`macro-${key}-help`} aria-valuetext={`${Math.round(project.macros[key])}%`}
                onChange={(event) => onMacro(key, Number(event.target.value))} />
              <span className="range-endpoints" aria-hidden="true"><span>{low}</span><span>{high}</span></span>
            </label>
          ))}
        </div>
      </div>
      <div id="advanced-controls" className="advanced-surface" hidden={!advancedOpen}>
        <div className="advanced-heading"><h3>Fine tune</h3>
          <label className="exact-toggle"><input type="checkbox" checked={showExact}
            onChange={(event) => setShowExact(event.target.checked)} />Show exact values</label>
        </div>
        <div className="advanced-grid">
          {groups.map((group) => (
            <fieldset key={group.name}><legend>{group.name}</legend>
              {group.controls.map((control) => {
                const { key, label, description, step } = control;
                const range = EFFECT_RANGES[key];
                const value = displayValue(control, project.effects[key], showExact);
                return (
                  <label className="fine-control" htmlFor={`fine-${key}`} key={key}>
                    <span className="control-heading"><span>{label}</span><output>{value}</output></span>
                    <span className="control-description" id={`fine-${key}-help`}>{description}</span>
                    <input id={`fine-${key}`} type="range" min={range.min} max={range.max} step={step}
                      value={control.reverse ? range.min + range.max - project.effects[key] : project.effects[key]}
                      disabled={disabled} aria-label={label} aria-describedby={`fine-${key}-help`} aria-valuetext={value}
                      onChange={(event) => onEffect(key, control.reverse
                        ? range.min + range.max - Number(event.target.value) : Number(event.target.value))} />
                  </label>
                );
              })}
            </fieldset>
          ))}
        </div>
      </div>
      <button ref={toggleRef} className="advanced-toggle" type="button" aria-expanded={advancedOpen}
        aria-controls="advanced-controls" onClick={() => setAdvancedOpen((open) => !open)}>
        {advancedOpen ? 'Back to simple controls' : 'Advanced controls'}<ChevronIcon />
      </button>
    </section>
  );
}
