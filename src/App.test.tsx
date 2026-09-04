import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('introduces the private studio and exposes the complete simple workflow', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /make room for your voice/i })).toBeInTheDocument();
    expect(screen.getByText(/audio stays in this browser/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /record a take/i })).toBeEnabled();
    expect(screen.getByLabelText(/import vocal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/add backing track/i)).toBeInTheDocument();
    expect(screen.getAllByRole('slider')).toHaveLength(7);
    expect(screen.getByRole('button', { name: /export audio/i })).toBeDisabled();
  });
});
