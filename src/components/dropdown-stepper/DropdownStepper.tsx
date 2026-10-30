import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Menu } from '../menu';

/**
 * DropdownStepper — one choice from an ordered list, reachable two ways:
 * step to the neighbour with the arrows either side, or jump anywhere from the
 * dropdown in the middle. Years, quarters, cycles, pages of a report: lists
 * whose neighbours matter, and where "next" is the common move.
 *
 * It is a control, not a navigation: the arrows change the *value*, they do
 * not go anywhere. For a number nudged by `step`, use `Stepper`; for a list
 * with no order, `Select`.
 *
 * The middle is a `Menu` — the same list the rest of VCP opens, with the
 * current option marked `selected` (`menuitemradio` + a check), so the choice
 * is never colour alone. The arrows disable at the ends unless `wrap` is set.
 * Every change, from either gesture, is announced through a polite live
 * region, because after a click on an arrow the focus stays on the arrow and
 * the visible value changing is otherwise silent.
 *
 * `invalid` draws the critical border and `error` adds a caption below it
 * (announced, and tied to the dropdown with `aria-describedby`); `Field`'s own
 * `error` does the same job when the control sits inside one.
 *
 * The shell is the `Input` family's: `stroke.strong` border, `surface.elevated`,
 * 32/40 tall. It does not clip, because the Menu panel hangs off it; the
 * buttons round their own outer corners instead.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const shell = cva(
  [
    'relative inline-flex items-stretch',
    'rounded-md border bg-surface-elevated font-sans',
  ],
  {
    variants: {
      size: {
        /* 32 tall — dense toolbars only. ds-lint-ignore */
        sm: 'h-8',
        /* 40 tall — the default, meets the minimum target size. ds-lint-ignore */
        md: 'h-10',
      },
      invalid: {
        /* accent.critical.outline — the same critical border `Input` draws. */
        true: 'border-accent-critical-outline-border-default',
        false: 'border-stroke-strong',
      },
      fullWidth: { true: 'flex w-full', false: '' },
    },
    defaultVariants: { size: 'md', invalid: false, fullWidth: false },
  },
);

/* neutral.outline — the grey ghost the Figma hover/pressed states paint. The
   focus ring draws inward so the shell's corners never clip it. */
const part = [
  'grid shrink-0 place-items-center transition-colors',
  'text-neutral-outline-content-default',
  'hover:bg-neutral-outline-surface-hover hover:text-neutral-outline-content-hover',
  'active:bg-neutral-outline-surface-pressed active:text-neutral-outline-content-pressed',
  'disabled:pointer-events-none disabled:text-text-disabled',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
];

export interface DropdownStepperOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownStepperProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    VariantProps<typeof shell> {
  /** Strings are shorthand for `{ value, label }`. Order is the stepping order. */
  options: ReadonlyArray<string | DropdownStepperOption>;
  /** The chosen `value`. Pair with `onChange`, or use `defaultValue`. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /**
   * What is being chosen — "Year", "Quarter". The accessible name: the arrows
   * read "Previous Year" / "Next Year" and the dropdown "Year: 2026".
   */
  label: string;
  /** Critical border. Implied by `error`. Pair with a visible message. */
  invalid?: boolean;
  /**
   * An optional caption under the control saying what is wrong — "Q1 is
   * closed". Setting it marks the control invalid, announces it, and ties it to
   * the dropdown with `aria-describedby`. Inside a `Field`, let the `Field`'s
   * `error` do this instead.
   */
  error?: React.ReactNode;
  /** Step past the last option back to the first, and the reverse. */
  wrap?: boolean;
  disabled?: boolean;
}

const normalize = (o: string | DropdownStepperOption): DropdownStepperOption =>
  typeof o === 'string' ? { value: o, label: o } : o;

export const DropdownStepper = React.forwardRef<HTMLDivElement, DropdownStepperProps>(
  (
    {
      className,
      size,
      fullWidth,
      options,
      value,
      defaultValue,
      onChange,
      label,
      wrap,
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
    const list = options.map(normalize);
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? list[0]?.value);
    const current = value ?? uncontrolled;
    const index = Math.max(
      0,
      list.findIndex((o) => o.value === current),
    );
    const chosen = list[index];

    const choose = (next: string) => {
      if (value === undefined) setUncontrolled(next);
      onChange?.(next);
    };

    /* The nearest enabled neighbour in `dir`, wrapping when asked. */
    const neighbour = (dir: -1 | 1) => {
      for (let step = 1; step <= list.length; step++) {
        const at = index + dir * step;
        if (!wrap && (at < 0 || at >= list.length)) return undefined;
        const option = list[((at % list.length) + list.length) % list.length];
        if (!option.disabled && option.value !== chosen?.value) return option;
      }
      return undefined;
    };

    const arrow = (dir: -1 | 1) => {
      const target = neighbour(dir);
      return (
        <button
          type="button"
          aria-label={`${dir < 0 ? 'Previous' : 'Next'} ${label}`}
          disabled={disabled || !target}
          onClick={() => target && choose(target.value)}
          className={cn(
            part,
            size === 'sm' ? 'w-8' : 'w-10',
            dir < 0 ? 'rounded-l-sm' : 'rounded-r-sm',
          )}
        >
          <Icon name={dir < 0 ? 'caret-left' : 'caret-right'} size="sm" />
        </button>
      );
    };

    return (
      <div
        ref={ref}
        className={cn('inline-flex flex-col gap-1.5', fullWidth && 'w-full', className)}
        {...props}
      >
        <div className={shell({ size, fullWidth, invalid: isInvalid })}>
        {arrow(-1)}
        <Menu
          className="min-w-0 flex-1"
          panelClassName="min-w-full"
          items={list.map((o) => ({
            key: o.value,
            label: o.label,
            disabled: o.disabled,
            selected: o.value === chosen?.value,
          }))}
          onSelect={(key) => key !== undefined && choose(key)}
          trigger={
            <button
              type="button"
              disabled={disabled}
              aria-label={`${label}: ${chosen?.label ?? ''}`}
              aria-describedby={hasError ? errorId : undefined}
              className={cn(
                part,
                'h-full w-full min-w-0 grid-flow-col justify-center gap-1 px-2',
                'text-body-sm-medium text-text-primary',
              )}
            >
              <span className="truncate">{chosen?.label}</span>
              <Icon
                name="caret-down-fill"
                size={12}
                className="shrink-0 text-neutral-outline-content-default"
              />
            </button>
          }
        />
        {arrow(1)}
        <span aria-live="polite" className="sr-only">
          {chosen?.label}
        </span>
        </div>
        {hasError && (
          <span
            id={errorId}
            role="alert"
            className="text-caption-md-medium text-accent-critical-outline-content-default"
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);
DropdownStepper.displayName = 'DropdownStepper';
