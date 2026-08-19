import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Field — the form-field wrapper.
 *
 * Owns the label (with optional required marker and an optional "add" affordance
 * for repeatable groups), the control itself, and the single message slot below
 * it: helper text, replaced by the error message when the field is invalid.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const field = cva(['font-sans'], {
  variants: {
    variant: {
      /* Label sits above the control — the default for most forms. */
      stacked: 'flex flex-col gap-1.5',
      /* Label sits beside the control — settings pages and dense edit views. */
      inline: 'flex flex-row items-start gap-4',
    },
    size: { sm: '', md: '', lg: '' },
    fullWidth: { true: 'w-full', false: '' },
  },
  defaultVariants: { variant: 'stacked', size: 'md', fullWidth: false },
});

const fieldLabel = cva(
  /* No row gap: the add button's own padding provides the visual gap. */
  ['flex items-center', 'text-text-primary'],
  {
    variants: {
      variant: { stacked: '', inline: 'w-40 shrink-0' },
      size: {
        sm: 'text-label-sm',
        md: 'text-label-md',
        lg: 'text-label-lg',
      },
    },
    compoundVariants: [
      /* Nudge the inline label down so it sits on the control's text baseline. */
      { variant: 'inline', size: 'sm', class: 'pt-2' },
      { variant: 'inline', size: 'md', class: 'pt-2.5' },
      { variant: 'inline', size: 'lg', class: 'pt-3.5' },
    ],
    defaultVariants: { variant: 'stacked', size: 'md' },
  },
);

const fieldControl = cva('flex flex-col gap-1.5', {
  variants: {
    variant: { stacked: '', inline: 'min-w-0 flex-1' },
  },
  defaultVariants: { variant: 'stacked' },
});

const fieldMessage = cva('', {
  variants: {
    size: {
      sm: 'text-caption-sm',
      md: 'text-caption-md',
      lg: 'text-body-md',
    },
    invalid: {
      true: 'text-accent-critical-tonal-content-default',
      false: 'text-text-tertiary',
    },
  },
  defaultVariants: { size: 'md', invalid: false },
});

/** Props the Field hands to its control so the pairing is announced correctly. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

export interface FieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof field> {
  /** Visible label. Omit only when the control carries its own accessible name. */
  label?: React.ReactNode;
  /** Shows the required marker and an "(required)" hint for screen readers. */
  required?: boolean;
  /** Renders the small round "+" affordance next to the label (repeatable groups). */
  onAdd?: () => void;
  /** Accessible name for the "+" affordance. Defaults to `Add <label>`. */
  addLabel?: string;
  /** Guidance shown under the control. Replaced by `error` when set. */
  helper?: React.ReactNode;
  /** Error message. Replaces `helper`, recolours it, and announces it. */
  error?: React.ReactNode;
  /** Marks the field busy and disables the "+" affordance. */
  loading?: boolean;
  /** Id of the control. Generated when omitted. */
  htmlFor?: string;
  /**
   * The control. Pass an element and Field wires `id`/`aria-describedby`/
   * `aria-invalid` onto it, or pass a function to wire them by hand.
   */
  children?: React.ReactNode | ((props: FieldControlProps) => React.ReactNode);
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      label,
      required,
      onAdd,
      addLabel,
      helper,
      error,
      loading,
      htmlFor,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const controlId = htmlFor ?? `${generatedId}-control`;
    const messageId = `${generatedId}-message`;

    const hasLabel = label !== undefined && label !== null && label !== false;
    const hasLabelRow = hasLabel || Boolean(onAdd);
    const invalid = Boolean(error);
    const message = error ?? helper;
    const hasMessage = message !== undefined && message !== null && message !== false;

    const controlProps: FieldControlProps = {
      id: controlId,
      'aria-describedby': hasMessage ? messageId : undefined,
      'aria-invalid': invalid || undefined,
    };

    let control: React.ReactNode;
    if (typeof children === 'function') {
      control = children(controlProps);
    } else if (React.isValidElement(children)) {
      const existing = children.props as Record<string, unknown>;
      control = React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: existing.id ?? controlProps.id,
        'aria-describedby': existing['aria-describedby'] ?? controlProps['aria-describedby'],
        'aria-invalid': existing['aria-invalid'] ?? controlProps['aria-invalid'],
      });
    } else {
      control = children;
    }

    return (
      <div
        ref={ref}
        className={cn(field({ variant, size, fullWidth }), className)}
        aria-busy={loading || undefined}
        {...props}
      >
        {hasLabelRow && (
          /* The "+" is interactive, so it sits beside the <label>, never inside it. */
          <div className={fieldLabel({ variant, size })}>
            {hasLabel && (
              <label htmlFor={controlId} className="flex items-center gap-1.5">
                <span>{label}</span>
                {required && (
                  <>
                    <span aria-hidden="true" className="text-accent-critical-tonal-content-default">
                      *
                    </span>
                    <span className="sr-only">(required)</span>
                  </>
                )}
              </label>
            )}
            {onAdd && (
              <AddAffordance
                size={size}
                disabled={loading}
                onAdd={onAdd}
                label={addLabel ?? (typeof label === 'string' ? `Add ${label}` : 'Add item')}
              />
            )}
          </div>
        )}

        <div className={fieldControl({ variant })}>
          {control}
          {hasMessage && (
            <span
              id={messageId}
              role={invalid ? 'alert' : undefined}
              className={fieldMessage({ size, invalid })}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    );
  },
);
Field.displayName = 'Field';

/**
 * Icon-only "+" for repeatable groups. The visible dot stays small, but the
 * button's padding is cancelled by a matching negative margin so the pointer /
 * touch target reaches the system minimum without disturbing the label row.
 */
function AddAffordance({
  size,
  disabled,
  onAdd,
  label,
}: {
  size: FieldProps['size'];
  disabled?: boolean;
  onAdd: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onAdd}
      className={cn(
        'group -my-2 -mr-2 inline-grid shrink-0 place-items-center rounded-full p-2',
        'transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
        'disabled:pointer-events-none',
      )}
    >
      <span
        className={cn(
          'grid place-items-center rounded-full',
          'bg-action-primary-surface-default text-action-primary-content-default',
          'group-hover:bg-action-primary-surface-hover',
          'group-active:bg-action-primary-surface-pressed',
          'group-disabled:bg-action-primary-surface-disabled',
          'group-disabled:text-action-primary-content-disabled',
          size === 'sm' ? 'size-5' : 'size-6',
        )}
      >
        <PlusIcon />
      </span>
    </button>
  );
}

function PlusIcon() {
  return (
    <svg className="size-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
