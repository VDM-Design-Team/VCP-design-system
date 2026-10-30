import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
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
 * can say it is invalid (the critical border) with a message under it (`error`), and
 * can offer a remove button inside the card's right edge (`onRemove`), which appears when
 * the card is hovered or has focus in it, and stays while you are typing. The number block
 * and its colour are the same in both.
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

/* What an empty field says, by type. */
const TYPE_PLACEHOLDER: Record<DescriptionCardType, string> = {
  problem: 'Describe the problem that needs to be solved.',
  solution: 'Explain how the problem can be solved or improved.',
  deliverable: 'List the deliverables or conditions that define completion.',
  'desired-outcome': 'Describe the expected result of improvement after completion.',
};

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
  /** Editing, while empty. Defaults to the type's own prompt ("Describe the problem that needs to be solved."). */
  placeholder?: string;
  /** Editing: the critical border and `aria-invalid`. Pair with a message of your own. */
  invalid?: boolean;
  /** Editing: the field's accessible name. Defaults to "Problem 1", "Solution 2" and so on. */
  label?: string;
  /**
   * Editing: a message under the card, in the critical colour. Implies `invalid`, and the
   * field is described by it.
   */
  error?: React.ReactNode;
  /**
   * Editing: shows a remove button inside the card's right edge. It appears on hover and
   * while the card has focus (so while typing), and always on a touch screen, which has no
   * hover. It only reports; the list is yours.
   */
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
      error,
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
    const errorId = React.useId();
    const isInvalid = !!invalid || !!error;

    /* Whether another card's field has focus. While one does, hovering this card does not
       reveal its remove button: the one being written in is the only one that offers it. */
    const root = React.useRef<HTMLDivElement | null>(null);
    const [otherFocused, setOtherFocused] = React.useState(false);
    React.useEffect(() => {
      if (!editing || !onRemove) return;
      const update = () => {
        const active = document.activeElement;
        setOtherFocused(
          !!active &&
            active.tagName === 'TEXTAREA' &&
            !!active.closest('[data-description-card]') &&
            !root.current?.contains(active),
        );
      };
      document.addEventListener('focusin', update);
      document.addEventListener('focusout', update);
      update();
      return () => {
        document.removeEventListener('focusin', update);
        document.removeEventListener('focusout', update);
      };
    }, [editing, onRemove]);

    /* One row to begin with, growing to fit what is typed. */
    React.useLayoutEffect(() => {
      const el = field.current;
      if (!editing || !el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, [editing, text]);

    return (
      <div
        ref={(node) => {
          root.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-description-card=""
        className={cn('font-sans', className)}
        {...props}
      >
        <div
          className={cn(
            'group/card relative flex min-w-0 items-stretch rounded-sm',
            /* One focus ring around the whole row, the number block and the field together, so it
               never lands on the block's edge. The field's own ring is turned off below. */
            'has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-stroke-focused',
          )}
        >
          {/* The number is a visual marker; a list of these is numbered by its own `ol` when it matters. */}
          <span aria-hidden="true" className={number({ type })}>
            {position}
          </span>
          {editing ? (
            <Textarea
              ref={field}
              rows={1}
              value={text}
              placeholder={placeholder ?? TYPE_PLACEHOLDER[type]}
              invalid={isInvalid}
              aria-label={label ?? `${TYPE_NAME[type]} ${position}`}
              aria-describedby={error ? errorId : undefined}
              onChange={(e) => {
                if (value === undefined) setInner(e.target.value);
                onChange?.(e.target.value);
              }}
              className={cn(
                'min-h-12 min-w-0 flex-1 resize-none overflow-hidden rounded-l-none rounded-r-sm border-l-0 p-3',
                /* The ring is the row's (above). The border does not change on hover, and turns
                   the focused blue while editing; an error keeps its critical border. */
                'focus-visible:outline-none',
                !isInvalid && 'border-stroke-strong enabled:hover:border-stroke-strong focus:border-stroke-focused enabled:hover:focus:border-stroke-focused',
                /* Room for the remove button, so the text never runs under it. */
                onRemove && 'pr-12',
              )}
            />
          ) : (
            <div className="flex min-h-12 min-w-0 flex-1 flex-col justify-center rounded-r-sm border border-stroke-subtle bg-surface-neutral-subtle p-3 text-body-sm-regular text-text-primary">
              {children}
            </div>
          )}
          {editing && onRemove && (
            /* Always in the page and the tab order, only unseen: hover and focus in the card
               reveal it, so a keyboard can reach it and typing keeps it on screen. A touch
               screen has no hover, so there it is always shown. The `before` is the 40 target. */
            <button
              type="button"
              aria-label={removeLabel}
              onClick={onRemove}
              className={cn(
                'absolute top-3 right-3 grid size-6 place-items-center rounded-full',
                /* Just the glyph, changing colour through its states (`accent.critical.outline.content`). */
                'text-accent-critical-outline-content-default outline-none',
                'hover:text-accent-critical-outline-content-hover active:text-accent-critical-outline-content-pressed',
                'before:absolute before:-inset-2',
                'opacity-0 transition-[opacity,color] duration-150 motion-reduce:transition-none',
                !otherFocused && 'group-hover/card:opacity-100',
                'group-focus-within/card:opacity-100 pointer-coarse:opacity-100',
                'focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
              )}
            >
              <Icon name="x-circle" size="md" aria-hidden="true" />
            </button>
          )}
        </div>
        {editing && error && (
          <p id={errorId} role="alert" className="mt-1.5 text-caption-md-medium text-accent-critical-outline-content-default">
            {error}
          </p>
        )}
      </div>
    );
  },
);
DescriptionCard.displayName = 'DescriptionCard';
