import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OTPInput } from './OTPInput';

describe('OTPInput', () => {
  it('renders 6 digit boxes by default', () => {
    render(<OTPInput onComplete={() => {}} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('renders a custom number of digit boxes', () => {
    render(<OTPInput length={4} onComplete={() => {}} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
  });

  it('calls onComplete with the full code once all digits are entered', async () => {
    const handleComplete = vi.fn();
    render(<OTPInput onComplete={handleComplete} />);
    const boxes = screen.getAllByRole('textbox');

    for (let i = 0; i < 6; i++) {
      await userEvent.type(boxes[i], String(i + 1));
    }

    expect(handleComplete).toHaveBeenCalledWith('123456');
  });

  it('does not call onComplete until every digit is filled', async () => {
    const handleComplete = vi.fn();
    render(<OTPInput onComplete={handleComplete} />);
    const boxes = screen.getAllByRole('textbox');

    await userEvent.type(boxes[0], '1');
    await userEvent.type(boxes[1], '2');

    expect(handleComplete).not.toHaveBeenCalled();
  });

  it('rejects non-numeric input', async () => {
    render(<OTPInput onComplete={() => {}} />);
    const firstBox = screen.getAllByRole('textbox')[0] as HTMLInputElement;
    await userEvent.type(firstBox, 'a');
    expect(firstBox.value).toBe('');
  });

  it('shows an error message when provided', () => {
    render(<OTPInput onComplete={() => {}} error="Incorrect code" />);
    expect(screen.getByText('Incorrect code')).toBeInTheDocument();
  });
});
