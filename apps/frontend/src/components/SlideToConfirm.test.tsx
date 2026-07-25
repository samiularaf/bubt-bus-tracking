import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlideToConfirm } from './SlideToConfirm';

describe('SlideToConfirm', () => {
  it('renders the provided label', () => {
    render(<SlideToConfirm label="Slide to Start Trip" onConfirm={() => {}} />);
    expect(screen.getByText('Slide to Start Trip')).toBeInTheDocument();
  });

  it('confirms via keyboard (Enter) — the accessible fallback for drag-only interactions', async () => {
    const handleConfirm = vi.fn();
    render(<SlideToConfirm label="Slide to Start Trip" onConfirm={handleConfirm} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('{Enter}');

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('confirms via keyboard (Space) too', async () => {
    const handleConfirm = vi.fn();
    render(<SlideToConfirm label="Slide to Finish Trip" onConfirm={handleConfirm} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard(' ');

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not confirm via keyboard when disabled', async () => {
    const handleConfirm = vi.fn();
    render(<SlideToConfirm label="Slide to Start Trip" onConfirm={handleConfirm} disabled />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('{Enter}');

    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('is not keyboard-focusable when disabled', () => {
    render(<SlideToConfirm label="Slide to Start Trip" onConfirm={() => {}} disabled />);
    expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '-1');
  });
});
