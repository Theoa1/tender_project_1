'use client';
import * as React from 'react';
import { Stack, TextField } from '@mui/material';

interface Props {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
}

export default function CodeInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
  ariaLabel = 'Verification code',
}: Props) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(() => {
    const arr = value.padEnd(length, ' ').split('').slice(0, length);
    return arr.map((c) => (c === ' ' ? '' : c));
  }, [value, length]);

  function setAt(i: number, d: string) {
    const arr = digits.slice();
    arr[i] = d;
    onChange(arr.join('').replace(/\s+/g, ''));
  }

  function handleChange(i: number, raw: string) {
    const clean = raw.replace(/\D/g, '');
    if (!clean) {
      setAt(i, '');
      return;
    }
    if (clean.length > 1) {
      // paste
      const next = (digits.join('').slice(0, i) + clean).slice(0, length).padEnd(length, '');
      onChange(next.replace(/\s+/g, ''));
      const focusIdx = Math.min(length - 1, i + clean.length);
      refs.current[focusIdx]?.focus();
      return;
    }
    setAt(i, clean);
    if (i < length - 1) refs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  return (
    <Stack direction="row" spacing={1} aria-label={ariaLabel}>
      {Array.from({ length }).map((_, i) => (
        <TextField
          key={i}
          inputRef={(el) => {
            refs.current[i] = el;
          }}
          value={digits[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 1,
            'aria-label': `${ariaLabel} digit ${i + 1}`,
            style: {
              textAlign: 'center',
              fontSize: 22,
              fontWeight: 700,
              padding: '12px 0',
              width: 44,
            },
          }}
          sx={{ width: 56 }}
        />
      ))}
    </Stack>
  );
}
