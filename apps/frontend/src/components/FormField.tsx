import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, id, className = '', ...rest }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-textPrimary">
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className={`h-12 rounded-card border px-4 text-sm text-textPrimary
            placeholder:text-textSecondary/60
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
            ${error ? 'border-danger' : 'border-border'} ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${fieldId}-error`} className="text-xs text-danger">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${fieldId}-hint`} className="text-xs text-textSecondary">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = 'FormField';
