import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * RadioGroup — a set of mutually exclusive options.
 *
 * Built on real `<input type="radio">` elements sharing a `name`, so the browser
 * supplies arrow-key navigation, the roving tab stop, and the checked state for
 * free. The group is wrapped in a `<fieldset>` + `<legend>` so it is labelled
 * without ARIA and so `disabled` cascades natively.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const group = cva('flex', {
  variants: {
    orientation: {
      vertical: 'flex-col gap-1',
      horizontal: 'flex-row flex-wrap gap-x-4 gap-y-1',
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

/** The clickable row. `min-h-10` + `py-2` guarantees the 40 unit minimum target. */
const optionRow = cva(
  ['group/radio flex min-h-10 items-start gap-2.5 py-2', 'font-sans text-body-md'],
  {
    variants: {
      disabled: {
        true: 'cursor-not-allowed text-text-disabled',
        false: 'cursor-pointer text-text-primary',
      },
    },
    defaultVariants: { disabled: false },
  },
);

/** The visual control *is* the input — no hand-rolled proxy, so focus/checked stay native. */
const control = cva(
  [
    'size-4 shrink-0 appearance-none rounded-pill border transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
  ],
  {
    variants: {
      state: {
        /* 3:1 ring against surface in both themes — see docs/radio-group.md */
        unchecked: 'border-stroke-stronger bg-surface-elevated group-hover/radio:border-stroke-brand-strong',
        checked:
          'border-action-primary-surface-default bg-surface-elevated group-hover/radio:border-action-primary-surface-hover',
        disabled: 'border-stroke-subtle bg-surface-neutral-faint',
      },
    },
    defaultVariants: { state: 'unchecked' },
  },
);

const dot = cva('pointer-events-none absolute left-1 size-2 -translate-y-1/2 rounded-pill top-1/2', {
  variants: {
    disabled: {
      true: 'bg-action-primary-surface-disabled',
      false: 'bg-action-primary-surface-default',
    },
  },
  defaultVariants: { disabled: false },
});

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  /** Secondary description under the label, wired up with `aria-describedby`. */
  hint?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends Omit<
      React.ComponentPropsWithoutRef<'fieldset'>,
      'onChange' | 'defaultValue' | 'children'
    >,
    VariantProps<typeof group> {
  /** A plain string is shorthand for `{ value: s, label: s }`. */
  options?: Array<string | RadioOption>;
  /** Controlled selection. Omit to run uncontrolled. */
  value?: string;
  /** Initial selection when uncontrolled. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Shared radio `name`. Generated from `useId` when omitted. */
  name?: string;
  /** Group label, rendered as the `<legend>`. */
  label?: React.ReactNode;
  /** Keeps the legend for screen readers but hides it visually. */
  hideLabel?: boolean;
  /** Disables every option in the group. */
  disabled?: boolean;
}

const normalize = (option: string | RadioOption): RadioOption =>
  typeof option === 'string' ? { value: option, label: option } : option;

export const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      className,
      options = [],
      value,
      defaultValue,
      onChange,
      name,
      label,
      hideLabel,
      orientation,
      disabled,
      ...props
    },
    ref,
  ) => {
    const uid = React.useId();
    const groupName = name ?? uid;

    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const selected = isControlled ? value : internalValue;

    const handleChange = (next: string) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    };

    return (
      <fieldset
        ref={ref}
        disabled={disabled}
        className={cn('m-0 min-w-0 border-0 p-0', className)}
        {...props}
      >
        {label ? (
          <legend className={cn('mb-2 p-0 font-sans text-label-md text-text-primary', hideLabel && 'sr-only')}>
            {label}
          </legend>
        ) : null}

        <div className={cn(group({ orientation }))}>
          {options.map((option, index) => {
            const { value: optionValue, label: optionLabel, hint, disabled: optionDisabled } =
              normalize(option);
            const isDisabled = Boolean(disabled || optionDisabled);
            const isChecked = selected === optionValue;
            const hintId = hint ? `${uid}-${index}-hint` : undefined;

            return (
              <label key={optionValue} className={cn(optionRow({ disabled: isDisabled }))}>
                {/* Fixed 20-unit box == body-md line-height, so the control stays
                    aligned with the first line of a wrapping label. */}
                <span className="relative flex h-5 shrink-0 items-center">
                  <input
                    type="radio"
                    name={groupName}
                    value={optionValue}
                    checked={isChecked}
                    disabled={isDisabled}
                    aria-describedby={hintId}
                    onChange={() => handleChange(optionValue)}
                    className={cn(
                      control({
                        state: isDisabled ? 'disabled' : isChecked ? 'checked' : 'unchecked',
                      }),
                      isDisabled && 'cursor-not-allowed',
                    )}
                  />
                  {isChecked ? (
                    <span aria-hidden="true" className={cn(dot({ disabled: isDisabled }))} />
                  ) : null}
                </span>

                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-body-md">{optionLabel}</span>
                  {hint ? (
                    <span
                      id={hintId}
                      className={cn(
                        'text-caption-md',
                        isDisabled ? 'text-text-disabled' : 'text-text-tertiary',
                      )}
                    >
                      {hint}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';
