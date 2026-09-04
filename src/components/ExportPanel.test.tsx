import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExportPanel } from './ExportPanel';

describe('ExportPanel', () => {
  it('defaults to vocal-only when there is no backing track', () => {
    render(<ExportPanel disabled={false} exporting={false} hasBacking={false} onExport={vi.fn()} />);

    expect(screen.getByLabelText('Include')).toHaveValue('vocal');
  });

  it('defaults to the complete mix when a backing track exists', () => {
    render(<ExportPanel disabled={false} exporting={false} hasBacking onExport={vi.fn()} />);

    expect(screen.getByLabelText('Include')).toHaveValue('mix');
  });
});
