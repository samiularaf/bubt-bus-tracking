import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders the label and associates it with the input', () => {
    render(<FormField label="Email" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    render(<FormField label="Email" value="" onChange={handleChange} />);
    await userEvent.type(screen.getByLabelText('Email'), 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows an error message when provided', () => {
    render(<FormField label="Password" value="" onChange={() => {}} error="Too short" />);
    expect(screen.getByText('Too short')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows a hint when no error is present', () => {
    render(
      <FormField label="Email" value="" onChange={() => {}} hint="Use your university email" />,
    );
    expect(screen.getByText('Use your university email')).toBeInTheDocument();
  });

  it('prefers showing the error over the hint when both are provided', () => {
    render(<FormField label="Email" value="" onChange={() => {}} hint="A hint" error="An error" />);
    expect(screen.getByText('An error')).toBeInTheDocument();
    expect(screen.queryByText('A hint')).not.toBeInTheDocument();
  });
});
