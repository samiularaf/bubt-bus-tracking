import { useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
}

export function OTPInput({ length = 6, onComplete, error }: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function updateDigit(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== '')) {
      onComplete(next.join(''));
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pasted)) return;
    e.preventDefault();

    const next = pasted.slice(0, length).split('');
    while (next.length < length) next.push('');
    setDigits(next);

    if (next.every((d) => d !== '')) {
      onComplete(next.join(''));
    } else {
      inputRefs.current[next.findIndex((d) => d === '')]?.focus();
    }
  }

  return (
    <div>
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => updateDigit(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={`w-12 h-12 text-center text-lg font-semibold rounded-card border
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
              ${error ? 'border-danger' : 'border-border'}`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-danger text-center mt-2">{error}</p>}
    </div>
  );
}
