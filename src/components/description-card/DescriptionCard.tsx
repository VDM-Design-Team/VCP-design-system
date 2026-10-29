import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { IconButton } from '../../atoms/icon-button';
import { Textarea } from '../../atoms/textarea';

/**
 * DescriptionCard — one numbered entry in an Added Value's description: the
 * problem, the solution, the deliverable, the outcome the requester wants. A
 * coloured number block on the left, the paragraph beside it. Read off the Figma
 * `Description_Card` set (four types) and its base (the same row, and the error
 * state of its field).
 *
 * It has two modes. **Reading** shows the paragraph in a quiet panel. **Editing**
 * (`editing`) turns the panel into a text field that grows with what is typed,
 * can say it is invalid (the critical border), and can offer a remove button
 * beside the row (`onRemove`). The number block and its colour are the same in both.
 *
 * The colour is the type's, and the type is the whole of what it says: the number
 * block is a label, not a status. A card is one row; the list is the caller's (an
 * `ol` of these, or a column), as is the section's title, the add button and any
 * attachments.
 *
 * Three of the four colours are status tokens used as plain fills (`critical`,
 * `success`, `info`); the fourth is the strong neutral. The design's Deliverable
 * colour is a cyan that is on no ramp, so `info` stands in for it until design
 * picks one.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const number = cva(
  [
    'flex min-w-5 shrink-0 items-center justify-center rounded-l-sm px-1 py-2',
    'font-sans text-label-sm-bold text-text-inverted-primary',
  ],
  {
    variants: {
      type: {
        problem: 'bg-accent-critical-filled-surface-default',
        solution: 'bg-accent-success-filled-surface-default',
        /* The design's cyan is on no ramp; `info` until design picks a tone. */
        deliverable: 'bg-accent-info-filled-surface-default',
        'desired-outcome': 'bg-surface-neutral-stronger',
      },
    },
    defaultVariants: { type: 'problem' },
  },
);

export type DescriptionCardType = NonNullable<VariantProps<typeof number>['type']>;

const TYPE_NAME: Record<DescriptionCardType, string> = {
  problem: 'Problem',
  solution: 'Solution',
  deliverable: 'Deliverable',
  'desired-outcome': 'Desired outcome',
};

export interface DescriptionCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'defaultValue'> {
  /** What the entry is — decides the number block's colour. */
  type?: DescriptionCardType;
  /** Its place in the list. Defaults to 1. */
  position?: number;
  /** Reading: the paragraph. Text or light markup. Ignored while `editing`. */
  children?: React.ReactNode;
  /** Editing: the paragraph becomes a text field. */
  editing?: boolean;
  /** Editing, controlled: the text. Pair with `onChange`. */
  value?: string;
  /** Editing, uncontrolled: the starting text. */
  defaultValue?: string;
  /** Editing: fires with the new text on every change. */
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Editing: the critical border and `aria-invalid`. Pair with a message of your own. */
  invalid?: boolean;
  /** Editing: the field's accessible name. Defaults to "Problem 1", "Solution 2" and so on. */
  label?: string;
  /** Editing: shows a remove button beside the row. It only reports; the list is yours. */
  onRemove?: () => void;
  /** The remove button's accessible name. Default "Remove". Say which: "Remove problem 2". */
  removeLabel?: string;
}

export const DescriptionCard = React.forwardRef<HTMLDivElement, DescriptionCardProps>(
  (
    {
      className,
      type = 'problem',
      position = 1,
      children,
      editing,
      value,
      defaultValue = '',
      onChange,
      placeholder,
      invalid,
      label,
      onRemove,
      removeLabel = 'Remove',
      ...props
    },
    ref,
  ) => {
    const [inner, setInner] = React.useState(defaultValue);
    const text = value ?? inner;
    const field = React.useRef<HTMLTextAreaElement | null>(null);

    /* One row to begin with, growing to fit what is typed. */
    React.useLayoutEffect(() => {
      const el = field.current;
      if (!editing || !el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, [editing, text]);

    return (
      <div ref={ref} className={cn('flex items-stretch gap-2 font-sans', className)} {...props}>
        <div className="flex min-w-0 flex-1 items-stretch">
          {/* The number is a visual marker; a list of these is numbered by its own `ol` when it matters. */}
          <span aria-hidden="true" className={number({ type })}>
            {position}
          </span>
          {editing ? (
            <Textarea
              ref={field}
              rows={1}
              value={text}
              placeholder={placeholder}
              invalid={invalid}
              aria-label={label ?? `${TYPE_NAME[type]} ${position}`}
              onChange={(e) => {
                if (value === undefined) setInner(e.target.value);
                onChange?.(e.target.value);
              }}
              className="min-h-12 min-w-0 flex-1 resize-none overflow-hidden rounded-l-none rounded-r-sm border-l-0 p-3"
            />
          ) : (
            <div className="flex min-h-12 min-w-0 flex-1 flex-col justify-center rounded-r-sm border border-stroke-subtle bg-surface-neutral-subtle p-3 text-body-sm-regular text-text-primary">
              {children}
            </div>
          )}
        </div>
        {editing && onRemove && (
          <IconButton
            icon="x-circle"
            variant="danger"
            size="sm"
            shape="round"
            label={removeLabel}
            onClick={onRemove}
            className="self-center"
          />
        )}
      </div>
    );
  },
);
DescriptionCard.displayName = 'DescriptionCard';
