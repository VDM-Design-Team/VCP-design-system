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
 * `variant="up-down"` is the number-input layout from Figma
 * (`_Number_Input_Step`): the value sits left-aligned like any `Input`, and
 * one up/down caret pair is stacked at the end — the browser's spin buttons,
 * drawn in the system. Same behaviour, same props; only the buttons move. The
 * carets are a pointer affordance (28 wide, half the field tall each), so they
 * leave the tab order — Arrow Up/Down in the field is the keyboard path.
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
    /* Scoped to the <input>: a nudge button disabling at min/max must not grey
       the whole field — only a disabled Stepper (which disables the input) does. */
    'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-surface-neutral-subtle has-[input:disabled]:border-stroke-subtle',
  ],
  {
    variants: {
      size: {
        /* 32 tall — dense tables only. ds-lint-ignore */
        sm: 'h-8',
        /* 40 tall — the default, meets the minimum target size. ds-lint-ignore */
        md: 'h-10',
      },
      invalid: {
        /* accent.critical.outline — held through focus so the error stays legible. */
        true: 'border-accent-critical-outline-border-default',
        false: 'border-stroke-strong focus-within:border-stroke-focused',
      },
      /* Where the nudge buttons sit: `plus-minus` either side of the value, `up-down` as
         one caret pair at the end. The shell itself does not change. */
      variant: { 'plus-minus': '', 'up-down': '' },
    },
    defaultVariants: { size: 'md', variant: 'plus-minus', invalid: false },
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
  /** Critical border + `aria-invalid`. Implied by `error`. */
  invalid?: boolean;
  /**
   * An optional caption under the field saying what is wrong — "Max 40 points".
   * Setting it marks the field invalid, announces it, and ties it to the input
   * with `aria-describedby`. Inside a `Field`, let the `Field`'s `error` do this
   * instead.
   */
  error?: React.ReactNode;
  disabled?: boolean;
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      className,
      size,
      variant = 'plus-minus',
      value,
      min = 0,
      max = 999,
      step = 1,
      onChange,
      suffix,
      label,
      invalid,
      error,
      disabled,
      ...props
    },
    ref,
  ) => {
    const errorId = React.useId();
    const hasError = error !== undefined && error !== null && error !== false;
    const isInvalid = Boolean(invalid) || hasError;

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
      const upDown = variant === 'up-down';
      return (
        <button
          type="button"
          aria-label={label ? `${name} ${label}` : name}
          disabled={dead}
          tabIndex={upDown ? -1 : undefined}
          onClick={() => nudge(dir)}
          className={cn(
            'grid shrink-0 place-items-center transition-colors',
            'disabled:pointer-events-none',
            /* The shell clips and carries the shared ring; this ring draws
               inward so it survives the clipping. */
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
            upDown
              ? [
                  'w-full flex-1 text-neutral-textual-content-default',
                  'hover:bg-neutral-outline-surface-hover hover:text-neutral-textual-content-hover',
                  'disabled:text-text-disabled',
                ]
              : [
                  'w-8 text-text-secondary',
                  'hover:bg-surface-neutral-faint hover:text-text-primary',
                  'disabled:text-text-disabled',
                ],
          )}
        >
          {upDown ? (
            <Icon name={dir < 0 ? 'caret-down-fill' : 'caret-up-fill'} size={12} />
          ) : (
            <Icon name={dir < 0 ? 'minus' : 'plus'} size="sm" />
          )}
        </button>
      );
    };

    return (
      <div ref={ref} className={cn('inline-flex flex-col gap-1.5', className)} {...props}>
        <div className={shell({ size, variant, invalid: isInvalid })}>
        {variant === 'plus-minus' && nudgeButton(-1)}
        <input
          type="text"
          inputMode="numeric"
          aria-label={label}
          aria-invalid={isInvalid || undefined}
          aria-describedby={hasError ? errorId : undefined}
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
            variant === 'up-down' ? 'w-20 flex-1 px-3 text-left' : 'w-14 text-center',
            'min-w-0 border-0 bg-transparent outline-none',
            'font-numeric text-caption-md-medium text-text-primary',
            'disabled:cursor-not-allowed disabled:text-text-disabled',
          )}
        />
        {suffix && (
          <span aria-hidden="true" className="grid place-items-center pr-2 font-sans text-caption-md-regular text-text-tertiary">
            {suffix}
          </span>
        )}
        {variant === 'plus-minus' ? (
          nudgeButton(1)
        ) : (
          <div className="flex w-7 shrink-0 flex-col">
            {nudgeButton(1)}
            {nudgeButton(-1)}
          </div>
        )}
        </div>
        {hasError && (
          <span
            id={errorId}
            role="alert"
            className="font-sans text-caption-md-medium text-accent-critical-outline-content-default"
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);
Stepper.displayName = 'Stepper';
