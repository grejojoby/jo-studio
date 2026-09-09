import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultProject } from '../studio-model';
import { EffectControls } from './EffectControls';

describe('EffectControls', () => {
  it('keeps the default surface to five plain-language controls', () => {
    const project = createDefaultProject();
    const { container } = render(<EffectControls project={project} disabled={false} onPreset={vi.fn()} onMacro={vi.fn()} onEffect={vi.fn()} />);

    expect(screen.getAllByRole('slider')).toHaveLength(5);
    expect(container.querySelectorAll('.macro-dial')).toHaveLength(0);
    expect(screen.getByRole('slider', { name: 'Clarity' })).toHaveAccessibleDescription('Bring your voice forward.');
    expect(screen.getByRole('button', { name: /advanced controls/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('reveals detailed studio parameters on request', () => {
    const project = createDefaultProject();
    render(<EffectControls project={project} disabled={false} onPreset={vi.fn()} onMacro={vi.fn()} onEffect={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /advanced controls/i }));

    expect(screen.getByRole('slider', { name: /reduce rumble/i })).toBeVisible();
    expect(screen.getByRole('slider', { name: /soften sharp s sounds/i })).toBeVisible();
    expect(screen.getByRole('slider', { name: /peak protection/i })).toBeVisible();
  });

  it('shows human values by default and reveals exact values on request', () => {
    const project = createDefaultProject();
    const onEffect = vi.fn();
    render(<EffectControls project={project} disabled={false} onPreset={vi.fn()} onMacro={vi.fn()} onEffect={onEffect} />);
    fireEvent.click(screen.getByRole('button', { name: /advanced controls/i }));
    const rumble = screen.getByRole('slider', { name: 'Reduce rumble' });
    expect(rumble).toHaveAttribute('aria-valuetext', 'Gentle');
    expect(screen.getByRole('slider', { name: 'Room amount' })).toHaveAttribute('aria-valuetext', '4.9%');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show exact values' }));
    expect(rumble).toHaveAttribute('aria-valuetext', '75 Hz');
    expect(onEffect).not.toHaveBeenCalled();
    fireEvent.change(rumble, { target: { value: '90' } });
    expect(onEffect).toHaveBeenCalledWith('highPassHz', 90);
    fireEvent.keyDown(rumble, { key: 'Escape' });
    expect(screen.getByRole('button', { name: /advanced controls/i })).toHaveFocus();
  });

  it('closes the detailed controls without changing the main sound desk', () => {
    const project = createDefaultProject();
    render(<EffectControls project={project} disabled={false} onPreset={vi.fn()} onMacro={vi.fn()} onEffect={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /advanced controls/i }));
    fireEvent.click(screen.getByRole('button', { name: /back to simple controls/i }));

    expect(screen.getByRole('button', { name: /advanced controls/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('slider', { name: /reduce rumble/i })).not.toBeInTheDocument();
  });
});
