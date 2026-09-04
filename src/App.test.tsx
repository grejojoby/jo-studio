import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('introduces the private vocal studio and its primary action', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /make room for your voice/i })).toBeInTheDocument();
    expect(screen.getByText(/audio stays in this browser/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /record a take/i })).toBeDisabled();
  });
});
