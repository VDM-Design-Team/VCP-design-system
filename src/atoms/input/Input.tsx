import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Input — VCP's single-line text field.
 *
 * The visual field is the wrapper; the real `<input>` is what takes focus, so the
 * ring is driven by `focus-within` and the shell reacts to the control's own
 * `:disabled` via `has-[:disabled]`.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const field = cva(
  [
    'inline-flex items-center gap-2',
    'rounded-md border bg-surface-elevated transition-colors',
    /* The ring is an offset outline — a shape change, not colour alone. */
    'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
    'has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-surface-neutral-subtle has-[:disabled]:border-stroke-subtle',
  ],
  {
    variants: {
      size: {
        /* 32 tall — dense tables and toolbars only. ds-lint-ignore */
        sm: 'h-8 px-3',
        /* 40 tall — the default, meets the minimum target size. ds-lint-ignore */
        md: 'h-10 px-3',
      },
      invalid: {
        /* accent.critical.outline — held through focus so the error stays legible. */
        true: 'border-accent-critical-outline-border-default',
        false: 'border-stroke-strong focus-within:border-stroke-focused',
      },
      fullWidth: { true: 'flex w-full', false: '' },
    },
    defaultVariants: { size: 'md', invalid: false, fullWidth: false },
  },
);

/** The control itself. UA styles don't inherit font, so the type ramp lives here. */
const control = cva(
  [
    'min-w-0 flex-1 font-sans',
    'border-0 bg-transparent outline-none',
    'text-text-primary placeholder:text-text-subtle',
    'disabled:cursor-not-allowed disabled:text-text-disabled disabled:placeholder:text-text-disabled',
  ],
  {
    variants: {
      size: { sm: '', md: '' },
      /* `medium` is a chosen value, as `Select` and `SearchSelect` set it; the placeholder is regular either way. */
      emphasis: { regular: '', medium: '' },
    },
    compoundVariants: [
      { size: 'sm', emphasis: 'regular', className: 'text-caption-md-regular' },
      { size: 'md', emphasis: 'regular', className: 'text-body-sm-regular' },
      { size: 'sm', emphasis: 'medium', className: 'text-caption-md-medium placeholder-shown:text-caption-md-regular' },
      { size: 'md', emphasis: 'medium', className: 'text-body-sm-medium placeholder-shown:text-body-sm-regular' },
    ],
    defaultVariants: { size: 'md', emphasis: 'regular' },
  },
);

export interface InputProps
  /* Native `size` is a character count — ours is the control's height, so it's replaced. */
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof field> {
  /** Decorative adornment before the value — 16 icons only. ds-lint-ignore */
  leadingIcon?: React.ReactNode;
  /** Decorative adornment after the value — 16 icons only. ds-lint-ignore */
  trailingIcon?: React.ReactNode;
  /**
   * A **control** at the field's end — a show/hide toggle, a clear button — where `trailingIcon` is only decoration. It is a real, focusable
   * element the caller names (an `IconButton` with a label), not hidden from assistive tech, and it keeps its own colours.
   */
  trailingAction?: React.ReactNode;
  /** Critical border + `aria-invalid`. Always pair with a visible error message. */
  invalid?: boolean;
  /**
   * The weight of the value: `regular` (the default) or `medium` — what a *chosen* value reads as in `Select`,
   * `SearchSelect` and `DateField`. The placeholder stays regular either way.
   */
  emphasis?: 'regular' | 'medium';
  /** Merged onto the field wrapper, not the inner `<input>`. */
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, invalid: invalidProp, emphasis, fullWidth, leadingIcon, trailingIcon, trailingAction, disabled, type = 'text', ...props }, ref) => {
    /* Invalid by the prop, or by the `aria-invalid` a `Field` with an `error` puts on its control: the error's red edge comes with the message. */
    const invalid = invalidProp || props['aria-invalid'] === true || props['aria-invalid'] === 'true';
    return (
      <div className={cn(field({ size, invalid, fullWidth }), className)}>
        {leadingIcon && <Adornment disabled={disabled}>{leadingIcon}</Adornment>}
        <input ref={ref} type={type} disabled={disabled} aria-invalid={invalid || undefined} className={control({ size, emphasis })} {...props} />
        {trailingIcon && <Adornment disabled={disabled}>{trailingIcon}</Adornment>}
        {trailingAction && <span className="-mr-1 flex shrink-0 items-center">{trailingAction}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';

/** Icons are decoration — the label and the value carry the meaning. */
function Adornment({ disabled, children }: { disabled?: boolean; children: React.ReactNode }) {
  return (
    <span aria-hidden="true" className={cn('grid shrink-0 place-items-center', disabled ? 'text-text-disabled' : 'text-text-subtle')}>
      {children}
    </span>
  );
}
