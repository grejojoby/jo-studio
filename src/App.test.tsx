import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('presents the complete workflow inside a single studio console', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.studio-console')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /vocal study/i })).toBeInTheDocument();
    expect(screen.getByText(/local & private/i)).toBeInTheDocument();
    expect(container.querySelector('.waveform-stage')).toBeInTheDocument();
    expect(container.querySelector('.mixer-stage')).toBeInTheDocument();
    expect(container.querySelector('.takes-deck')).toBeInTheDocument();
    expect(container.querySelector('.sound-rack')).toBeInTheDocument();
    expect(container.querySelector('.console-footer')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /record a take/i })).toBeEnabled();
    expect(screen.getByLabelText(/import vocal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/add backing track/i)).toBeInTheDocument();
    expect(screen.getAllByRole('slider')).toHaveLength(7);
    expect(screen.getByRole('button', { name: /export audio/i })).toBeDisabled();
  });
});
