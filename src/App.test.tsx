import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('presents the complete workflow inside a single studio console', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.studio-console')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /voice in focus/i })).toBeInTheDocument();
    expect(screen.getByText(/audio stays in this browser/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /record a take/i })).toBeEnabled();
    expect(screen.getByLabelText(/import vocal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/add backing track/i)).toBeInTheDocument();
    expect(screen.getAllByRole('slider')).toHaveLength(7);
    expect(screen.getByRole('button', { name: /export audio/i })).toBeDisabled();
  });
});
