import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';

/**
 * Select — a choice from a fixed list, on the native `<select>`. Native on
 * purpose: the popup, keyboard model, type-ahead, and mobile pickers come from
 * the platform, correct on every device, for free. When the list needs search,
 * that is `SearchSelect`, which pays the custom-listbox tax.
 *
 * The shell is `Input`'s, class for class: the same `stroke.strong` border,
 * `focus-within` ring, `invalid` treatment, disabled surface, and the same
 * `sm`/`md` = 32/40 heights. Sits beside an Input in a form and nothing
 * betrays which is which until it opens. The export's `small`/`large` size
 * names became `sm`/`md` to match every other component.
 *
 * The field reads like `SearchSelect`'s: the placeholder is `text.subtle` in regular
 * weight, and a chosen value is `text.primary` in medium. A native select shows its
 * placeholder as the selected option, so the grey is `:has(option[value=""]:checked)`
 * on the select itself — pure CSS, no props. The open list is the platform's and
 * stays that way (see docs/select.md); only the option colours are set, so the
 * popup follows the theme where the browser lets it.
 *
 * `error` puts a message under the select in the critical colour, as
 * `SearchSelect` does. Inside a `Field`, let the `Field` carry the message.
 *
 * The caret is the system's own glyph, not the export's data-URI SVG — a
 * pointer-events-none sibling, so clicks land on the control beneath it.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const shell = cva(
  [
    'relative inline-flex items-center',
    'rounded-md border bg-surface-elevated transition-colors',
    'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
    /* Scoped to the <select>, not `has-[:disabled]` — a disabled placeholder
       <option> would match the bare form and grey the whole shell. */
    'has-[select:disabled]:cursor-not-allowed has-[select:disabled]:bg-surface-neutral-subtle has-[select:disabled]:border-stroke-subtle',
  ],
  {
    variants: {
      size: {
        /* 32 tall — dense tables and toolbars only. ds-lint-ignore */
        sm: 'h-8',
        /* 40 tall — the default, meets the minimum target size. ds-lint-ignore */
        md: 'h-10',
      },
      invalid: {
        true: 'border-accent-critical-outline-border-default',
        false: 'border-stroke-strong focus-within:border-stroke-focused',
      },
      fullWidth: { true: 'flex w-full', false: '' },
    },
    defaultVariants: { size: 'md', invalid: false, fullWidth: false },
  },
);

const control = cva(
  [
    'min-w-0 flex-1 appearance-none font-sans',
    'border-0 bg-transparent outline-none',
    'cursor-pointer text-text-primary',
    /* Nothing chosen yet: the hidden placeholder option is the selected one, so it reads as
       a placeholder — subtle and regular, like SearchSelect's. */
    "has-[option[value='']:checked]:text-text-subtle",
    'disabled:cursor-not-allowed disabled:text-text-disabled',
    /* The popup is the platform's; where the browser honours it, give the options the tokens. */
    '[&_option]:bg-surface-elevated [&_option]:text-text-primary [&_optgroup]:text-text-tertiary',
    /* Room for the caret on the right. */
    'py-0 pl-3 pr-9',
  ],
  {
    variants: {
      /* A value is medium, the placeholder regular: SearchSelect's pairing. */
      size: {
        sm: "text-caption-md-medium has-[option[value='']:checked]:text-caption-md-regular",
        md: "text-body-sm-medium has-[option[value='']:checked]:text-body-sm-regular",
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'>,
    VariantProps<typeof shell> {
  /** Strings are shorthand for `{ value, label }`. Ignored when `children` given. */
  options?: ReadonlyArray<string | SelectOption>;
  /** Fires with the chosen value. */
  onChange?: (value: string) => void;
  /**
   * Shown while nothing is chosen — a disabled, hidden `<option value="">`,
   * so it cannot be re-picked once a real choice is made. For a genuine
   * "no selection" choice, add an explicit option ("All suppliers") instead.
   */
  placeholder?: string;
  /** Critical border + `aria-invalid`. Always pair with a visible error message (or use `error`). */
  invalid?: boolean;
  /**
   * An error message under the select, in the critical colour. Implies `invalid` and is
   * announced with the select (`aria-describedby`). Inside a `Field`, use the `Field`'s `error`
   * instead, not both.
   */
  error?: React.ReactNode;
  /** Escape hatch for `<optgroup>` — replaces `options` when given. */
  children?: React.ReactNode;
  /** Merged onto the shell, not the inner `<select>`. */
  className?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      size,
      invalid,
      error,
      fullWidth,
      options = [],
      onChange,
      placeholder,
      disabled,
      defaultValue,
      children,
      ...props
    },
    ref,
  ) => {
    const errorId = React.useId();
    const isInvalid = !!invalid || !!error;
    /* Keep a describedby a `Field` already set, and add the error's. */
    const describedBy =
      [props['aria-describedby'], error ? errorId : undefined].filter(Boolean).join(' ') || undefined;

    const field = (
      <div className={cn(shell({ size, invalid: isInvalid, fullWidth }), className)}>
        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          onChange={(e) => onChange?.(e.target.value)}
          /* An uncontrolled select with a placeholder starts on it. */
          defaultValue={
            defaultValue ?? (placeholder && props.value === undefined ? '' : undefined)
          }
          className={control({ size })}
          {...props}
          aria-describedby={describedBy}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children ??
            options.map((raw) => {
              const o = typeof raw === 'string' ? { value: raw, label: raw } : raw;
              return (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              );
            })}
        </select>
        {/* Decorative, and transparent to the pointer — clicks fall through to
            the select. text.tertiary matches Input's adornments. */}
        <Icon
          name="caret-down"
          size="sm"
          aria-hidden="true"
          className="pointer-events-none absolute right-3 text-text-tertiary"
        />
      </div>
    );

    /* The wrapper exists only when there is a message, so the DOM is unchanged otherwise. */
    if (!error) return field;
    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {field}
        <p id={errorId} className="mt-1.5 text-caption-md-medium text-accent-critical-outline-content-default">
          {error}
        </p>
      </div>
    );
  },
);
Select.displayName = 'Select';
