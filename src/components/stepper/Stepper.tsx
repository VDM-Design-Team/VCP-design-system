import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';

/**
 * Stepper — a small number chosen by nudging: capacity points, a quantity, a
 * retry count. Decrement, a typeable value, increment. For free-form numbers
 * with real range, use `Input` with `inputMode="numeric"` — a stepper's value
 * is one whose neighbours matter.
 *
 * The shell is the `Input` family's (same border, ring, disabled treatment,
 * `sm`/`md` = 32/40); the nudge buttons are minus/plus rather than the
 * export's left/right chevrons — nudging is arithmetic, not navigation.
 *
 * Typing is draft-based: while the field has focus you can pass through
 * empty and half-typed states ("", "-", "1" on the way to "15"); the value
 * commits — clamped to `min…max` and snapped to `step` — on blur or Enter.
 * The export clamped every keystroke, which made "15" untypeable when the
 * minimum was 10. Arrow Up/Down nudge from the keyboard; the buttons disable
 * at the ends.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const shell = cva(
  [
    'inline-flex items-stretch overflow-hidden',
    'rounded-md border bg-surface-elevated transition-colors',
    'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
    'has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-surface-neutral-subtle has-[:disabled]:border-stroke-subtle',
    'border-stroke-field focus-within:border-stroke-focused',
  ],
  {
    variants: {
      size: {
        /* 32 tall — dense tables only. ds-lint-ignore */
        sm: 'h-8',
        /* 40 tall — the default, meets the minimum target size. ds-lint-ignore */
        md: 'h-10',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface StepperProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof shell> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  /** Inline unit after the value — 'pts', 'days'. Decorative. */
  suffix?: React.ReactNode;
  /**
   * Accessible name for the field — "Capacity points". Required in practice
   * unless a `Field` label points here; the nudge buttons fold it into their
   * own names ("Decrease Capacity points").
   */
  label?: string;
  disabled?: boolean;
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      className,
      size,
      value,
      min = 0,
      max = 999,
      step = 1,
      onChange,
      suffix,
      label,
      disabled,
      ...props
    },
    ref,
  ) => {
    /* While focused, the field holds a draft string; the number commits on
       blur/Enter. null = not editing, render the real value. */
    const [draft, setDraft] = React.useState<string | null>(null);

    const clamp = (v: number) => Math.max(min, Math.min(max, v));
    const nudge = (dir: -1 | 1) => {
      setDraft(null);
      onChange?.(clamp(value + dir * step));
    };
    const commit = () => {
      if (draft !== null) {
        const n = Number(draft);
        if (draft.trim() !== '' && !Number.isNaN(n)) onChange?.(clamp(n));
        setDraft(null);
      }
    };

    const nudgeButton = (dir: -1 | 1) => {
      const dead = disabled || (dir < 0 ? value <= min : value >= max);
      const name = dir < 0 ? 'Decrease' : 'Increase';
      return (
        <button
          type="button"
          aria-label={label ? `${name} ${label}` : name}
          disabled={dead}
          onClick={() => nudge(dir)}
          className={cn(
            'grid w-8 shrink-0 place-items-center text-text-secondary transition-colors',
            'hover:bg-surface-neutral-faint hover:text-text-primary',
            'disabled:pointer-events-none disabled:text-text-disabled',
            /* The shell clips and carries the shared ring; this ring draws
               inward so it survives the clipping. */
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
          )}
        >
          <Icon name={dir < 0 ? 'minus' : 'plus'} size="sm" />
        </button>
      );
    };

    return (
      <div ref={ref} className={cn(shell({ size }), className)} {...props}>
        {nudgeButton(-1)}
        <input
          type="text"
          inputMode="numeric"
          aria-label={label}
          value={draft ?? String(value)}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'ArrowUp') { e.preventDefault(); nudge(1); }
            if (e.key === 'ArrowDown') { e.preventDefault(); nudge(-1); }
          }}
          /* font.family.numeric — this is a number, set as one. */
          className={cn(
            'w-14 min-w-0 border-0 bg-transparent text-center outline-none',
            'font-numeric text-caption-md text-text-primary',
            'disabled:cursor-not-allowed disabled:text-text-disabled',
          )}
        />
        {suffix && (
          <span aria-hidden="true" className="grid place-items-center pr-2 font-sans text-body-sm text-text-tertiary">
            {suffix}
          </span>
        )}
        {nudgeButton(1)}
      </div>
    );
  },
);
Stepper.displayName = 'Stepper';
