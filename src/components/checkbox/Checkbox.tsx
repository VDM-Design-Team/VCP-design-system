import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Checkbox — a real `<input type="checkbox">` wearing a token-styled box.
 *
 * The input is visually hidden with `sr-only` (never `display:none`), so it stays
 * keyboard-focusable and screen-reader-native. The visible box is a *sibling* of
 * the input and every state — checked, mixed, hover, pressed, disabled, focus —
 * is driven from the input through `peer-*` / `group-*` selectors. That means the
 * browser, not React, owns the state, so uncontrolled usage and native form reset
 * both behave correctly.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const checkboxRoot = cva(
  [
    'group inline-flex items-start gap-2',
    /* p-3 (12) around a 16 box gives the 40 minimum touch target from CLAUDE.md */
    'p-3',
    'font-sans text-body-md',
    'cursor-pointer select-none',
    'has-disabled:cursor-not-allowed',
  ],
  {
    variants: {
      fullWidth: { true: 'flex w-full', false: '' },
    },
    defaultVariants: { fullWidth: false },
  },
);

const checkboxBox = cva(
  [
    'flex size-4 shrink-0 items-center justify-center',
    'rounded-sm border border-stroke-field',
    'bg-surface-base text-action-primary-content-default',
    'transition-colors',
    /* The focus ring lives here because the real input is visually hidden. */
    'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-stroke-focused',
    /* Selected and mixed share one fill — only the glyph differs. */
    'peer-checked:border-action-primary-surface-default peer-checked:bg-action-primary-surface-default',
    'peer-indeterminate:border-action-primary-surface-default peer-indeterminate:bg-action-primary-surface-default',
    /* Hover / pressed, only while the input is enabled. */
    'peer-enabled:group-hover:border-stroke-brand-strong',
    'peer-checked:peer-enabled:group-hover:border-action-primary-surface-hover peer-checked:peer-enabled:group-hover:bg-action-primary-surface-hover',
    'peer-indeterminate:peer-enabled:group-hover:border-action-primary-surface-hover peer-indeterminate:peer-enabled:group-hover:bg-action-primary-surface-hover',
    'peer-checked:peer-enabled:group-active:border-action-primary-surface-pressed peer-checked:peer-enabled:group-active:bg-action-primary-surface-pressed',
    'peer-indeterminate:peer-enabled:group-active:border-action-primary-surface-pressed peer-indeterminate:peer-enabled:group-active:bg-action-primary-surface-pressed',
    /* Disabled. The two-variant rules outrank the single-variant ones above. */
    'peer-disabled:border-stroke-subtle peer-disabled:bg-surface-neutral-faint',
    'peer-disabled:peer-checked:border-action-primary-surface-disabled peer-disabled:peer-checked:bg-action-primary-surface-disabled',
    'peer-disabled:peer-indeterminate:border-action-primary-surface-disabled peer-disabled:peer-indeterminate:bg-action-primary-surface-disabled',
  ],
  {
    variants: {
      /* Nudges the box onto the optical centre of the first line of `body-md`. */
      hasLabel: { true: 'mt-0.5', false: '' },
    },
    defaultVariants: { hasLabel: false },
  },
);

const checkboxLabel = cva(['text-text-secondary', 'peer-disabled:text-text-disabled']);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'>,
    VariantProps<typeof checkboxRoot> {
  /** Clickable text beside the box. Omit it only when you also pass `aria-label`. */
  label?: React.ReactNode;
  /**
   * Mixed state — the parent row of a partially selected group.
   * Set as a DOM property on the input and mirrored to `aria-checked="mixed"`.
   */
  indeterminate?: boolean;
  /** Fires with the new checked value. Omit for uncontrolled use. */
  onChange?: (checked: boolean) => void;
}

/** `indeterminate` must be written before paint, but must not warn during SSR. */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, indeterminate = false, fullWidth, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

    /* `indeterminate` is a DOM property, not an attribute — it can only be set here. */
    useIsomorphicLayoutEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate, props.checked, props.defaultChecked]);

    return (
      <label className={cn(checkboxRoot({ fullWidth }), className)}>
        <input
          ref={inputRef}
          type="checkbox"
          className="peer sr-only"
          aria-checked={indeterminate ? 'mixed' : undefined}
          onChange={(event) => onChange?.(event.target.checked)}
          {...props}
        />
        <span aria-hidden="true" className={checkboxBox({ hasLabel: label != null })}>
          {indeterminate ? <MixedGlyph /> : <CheckGlyph />}
        </span>
        {label != null && <span className={checkboxLabel()}>{label}</span>}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';

function CheckGlyph() {
  return (
    <svg
      className="hidden size-3 group-has-checked:block"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 6.25 4.75 8.5 9.5 3.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MixedGlyph() {
  return (
    <svg className="size-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
