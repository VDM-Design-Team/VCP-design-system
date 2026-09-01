import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Toggle — an on/off switch that commits its change immediately.
 *
 * The real control is a visually hidden `<input type="checkbox" role="switch">`
 * wrapped in a `<label>`, so the browser gives us the label association, the
 * Space key, and the disabled semantics for free. The pill and the knob are
 * decoration driven off React state; `peer-focus-visible` moves the ring from
 * the hidden input onto the pill.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const root = cva(
  [
    'group inline-flex items-center gap-2 align-middle',
    /* Padding, not height: the pill is 24 tall but the target is 40. ds-lint-ignore */
    'p-2',
    'font-sans',
  ],
  {
    variants: {
      disabled: {
        true: 'cursor-not-allowed',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: { disabled: false },
  },
);

/** The pill. 40 x 24 with a 4 inset, so the knob travels exactly 16. ds-lint-ignore */
const track = cva(
  [
    'relative inline-flex h-6 w-10 shrink-0 items-center rounded-pill p-1',
    'transition-colors motion-reduce:transition-none',
    /* The ring is an offset outline — a shape change, not colour alone. */
    'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-stroke-focused',
  ],
  {
    variants: {
      checked: { true: '', false: '' },
      disabled: { true: '', false: '' },
    },
    compoundVariants: [
      /* On — action.primary, the same family as a primary Button. */
      {
        checked: true,
        disabled: false,
        class: 'bg-action-primary-surface-default group-hover:bg-action-primary-surface-hover',
      },
      /* Off — surface.neutral.strong is the lightest neutral that still clears
         3:1 against surface.base and surface.canvas in both themes. */
      {
        checked: false,
        disabled: false,
        class: 'bg-surface-neutral-strong group-hover:bg-surface-neutral-stronger',
      },
      { checked: true, disabled: true, class: 'bg-action-primary-surface-disabled' },
      { checked: false, disabled: true, class: 'bg-surface-neutral-medium' },
    ],
    defaultVariants: { checked: false, disabled: false },
  },
);

/** The knob. Its POSITION is the non-colour cue that carries the state. */
const knob = cva(
  [
    'pointer-events-none block size-4 rounded-pill bg-surface-elevated shadow-card',
    'transition-transform motion-reduce:transition-none',
  ],
  {
    variants: {
      checked: { true: 'translate-x-4', false: 'translate-x-0' },
    },
    defaultVariants: { checked: false },
  },
);

const labelText = cva(['select-none text-body-md'], {
  variants: {
    disabled: {
      true: 'text-text-disabled',
      false: 'text-text-secondary',
    },
  },
  defaultVariants: { disabled: false },
});

export interface ToggleProps
  /* `checked`/`onChange` are re-declared: ours hands back a boolean, not an event.
     `size` is a native character count and means nothing on a checkbox. */
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'checked' | 'defaultChecked' | 'type' | 'role' | 'size' | 'className' | 'style'
  > {
  /** Controlled state. Omit to let the Toggle own its own state. */
  checked?: boolean;
  /** Starting state when uncontrolled. */
  defaultChecked?: boolean;
  /** Fires on every commit — a Toggle takes effect immediately, there is no Save. */
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Visible label. Without one you **must** pass `aria-label` or `aria-labelledby`. */
  label?: React.ReactNode;
  /** Merged onto the `<label>` wrapper, not the hidden `<input>`. */
  className?: string;
  /** Applied to the `<label>` wrapper, matching `className`. */
  style?: React.CSSProperties;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    { checked, defaultChecked = false, onChange, disabled = false, label, className, style, ...props },
    ref,
  ) => {
    const [internal, setInternal] = React.useState(defaultChecked);
    const isControlled = checked !== undefined;
    const on = isControlled ? checked : internal;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.checked;
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    return (
      <label className={cn(root({ disabled }), className)} style={style}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={on}
          disabled={disabled}
          onChange={handleChange}
          {...props}
        />
        <span className={track({ checked: on, disabled })} aria-hidden="true">
          <span className={knob({ checked: on })} />
        </span>
        {label !== undefined && label !== null && (
          <span className={labelText({ disabled })}>{label}</span>
        )}
      </label>
    );
  },
);
Toggle.displayName = 'Toggle';
