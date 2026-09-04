import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultProject } from '../studio-model';
import { EffectControls } from './EffectControls';

describe('EffectControls', () => {
  it('keeps the default surface to five plain-language controls', () => {
    const project = createDefaultProject();
    render(<EffectControls project={project} disabled={false} onPreset={vi.fn()} onMacro={vi.fn()} onEffect={vi.fn()} />);

    expect(screen.getAllByRole('slider')).toHaveLength(5);
    expect(screen.getByRole('button', { name: /advanced controls/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('reveals detailed studio parameters on request', () => {
    const project = createDefaultProject();
    render(<EffectControls project={project} disabled={false} onPreset={vi.fn()} onMacro={vi.fn()} onEffect={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /advanced controls/i }));

    expect(screen.getByRole('slider', { name: /high-pass filter/i })).toBeVisible();
    expect(screen.getByRole('slider', { name: /de-esser/i })).toBeVisible();
    expect(screen.getByRole('slider', { name: /limiter ceiling/i })).toBeVisible();
  });
});
