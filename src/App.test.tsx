import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('presents the complete workflow inside a single studio console', async () => {
    const { container } = render(<App />);

    expect(container.querySelector('.studio-console')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /vocal study/i })).toBeInTheDocument();
    expect(screen.getByText(/local & private/i)).toBeInTheDocument();
    expect(container.querySelector('.waveform-stage')).toBeInTheDocument();
    expect(container.querySelector('.mixer-stage')).toBeInTheDocument();
    expect(container.querySelector('.takes-deck')).toBeInTheDocument();
    expect(container.querySelector('.sound-rack')).toBeInTheDocument();
    expect(container.querySelector('.console-footer')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /record a take/i })).toBeEnabled());
    expect(container.querySelector('.waveform')).not.toBeInTheDocument();
    expect(container.querySelector('.playhead')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Hear myself' })).not.toBeChecked();
    expect(screen.getByLabelText(/import vocal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/add backing track/i)).toBeInTheDocument();
    expect(screen.getAllByRole('slider')).toHaveLength(7);
    expect(screen.getByRole('button', { name: /export audio/i })).toBeDisabled();
  });
});
