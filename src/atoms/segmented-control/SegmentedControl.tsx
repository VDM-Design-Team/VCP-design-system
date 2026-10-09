import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';
import type { SavingStatus } from '../../lib/saving';

/**
 * SegmentedControl — a small set of mutually exclusive options, all visible at once.
 *
 * Use it to switch a view between two to five known modes (List / Board / Calendar).
 * It is a radio group, not a tab list: it changes how the same content is shown,
 * it does not swap one panel of content for another. Reach for Tabs when the
 * options lead to different content.
 *
 * **Saving a change.** When choosing a segment persists something, the parent
 * drives `status` through `pending → success | error` and the control shows
 * it: a spinner in the selected segment while pending (and no further
 * selection until it settles), a check on success, a critical stroke on
 * error. The control stays presentational — it never times anything and it
 * never reverts anything. The parent returns `success` to `idle` after about
 * 1.5 s, and on `error` the parent simply keeps the previous `value`, which
 * is why async use is controlled-only. The error *message* belongs to `Field`,
 * which wires it to the group through `aria-describedby`.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const track = cva(
  [
    /* The track has a fixed height and 4 of padding, so the segments simply fill
       what is left — the track less 8 — as Figma draws it. No gap between
       segments: Figma's item spacing is 0. */
    'inline-flex items-stretch p-1',
    'bg-surface-neutral-subtle rounded-sm',
    /* The stroke is an inset ring, so it is drawn inside the box and takes no
       room — the padding stays exactly 4 and the error stroke shifts nothing. */
    'ring-1 ring-inset ring-stroke-default transition-colors',
  ],
  {
    variants: {
      fullWidth: { true: 'flex w-full', false: '' },
      size: { xs: 'h-7', sm: 'h-8', md: 'h-9', lg: 'h-10', xl: 'h-12' },
      status: {
        idle: '',
        pending: '',
        success: '',
        /* The same stroke `Input` draws when invalid — one error, one look. */
        error: 'ring-accent-critical-outline-border-default',
      },
    },
    defaultVariants: { fullWidth: false, size: 'xl', status: 'idle' },
  },
);

const segment = cva(
  [
    'inline-flex items-center justify-center gap-1.5 min-w-0',
    'font-sans whitespace-nowrap rounded-xs cursor-pointer',
    'text-text-tertiary transition-colors',
    'hover:text-text-primary',
    'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-stroke-focused',
    'disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:text-text-disabled',
    /* Selected: lifts onto its own surface, with a 1 stroke and the lightest
       shadow, and the label darkens. The lift is the non-colour half of the
       cue; the label's colour change is the half that carries real contrast.
       The stroke is an inset ring, so selecting changes no size or padding. */
    'aria-checked:ring-1 aria-checked:ring-inset aria-checked:ring-stroke-default aria-checked:bg-surface-elevated aria-checked:text-text-primary aria-checked:shadow-card',
  ],
  {
    variants: {
      /* No height of its own: the track's padding sets it. Side padding 6 / 8 / 12
         / 12 / 16; the type is the ramp's 12 / 14 / 14 / 14 / 16 medium. */
      size: {
        xs: 'px-1.5 text-caption-md-medium',
        sm: 'px-2 text-label-sm-medium',
        md: 'px-3 text-label-sm-medium',
        lg: 'px-3 text-label-sm-medium',
        xl: 'px-4 text-label-md-medium',
      },
      fullWidth: { true: 'flex-1', false: '' },
      /* Pending mutes the selected label back to the unselected colour and
         holds the others where they are — nothing is clickable until the
         save settles, so nothing should invite a click. */
      pending: {
        true: 'aria-checked:text-text-tertiary cursor-progress hover:text-text-tertiary',
        false: '',
      },
    },
    defaultVariants: { size: 'xl', fullWidth: false, pending: false },
  },
);

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
  /** Screen-reader label. Required when `label` is an icon or otherwise not text. */
  'aria-label'?: string;
  disabled?: boolean;
}

/** Where a save of the current selection stands — the shared `SavingStatus`. */
export type SegmentedControlStatus = SavingStatus;

export interface SegmentedControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    Omit<VariantProps<typeof segment>, 'pending'> {
  options: Array<string | SegmentedControlOption>;
  /** Controlled selection. Required when `status` is used — see the docs. */
  value?: string;
  /** Uncontrolled starting selection. Defaults to the first enabled option. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /**
   * The save's progress, driven by the parent. `pending` shows a spinner in
   * the selected segment and ignores further selection; `success` shows a
   * check; `error` draws the critical stroke and sets `aria-invalid`. The
   * message for an error comes from the `Field` around it.
   */
  status?: SegmentedControlStatus;
  /** Labels the group for screen readers. Use this or `aria-labelledby`. */
  'aria-label'?: string;
}

const normalise = (o: string | SegmentedControlOption): SegmentedControlOption =>
  typeof o === 'string' ? { value: o, label: o } : o;

export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    { className, options, value, defaultValue, onChange, size, fullWidth, status = 'idle', ...props },
    ref,
  ) => {
    const items = React.useMemo(() => options.map(normalise), [options]);
    const firstEnabled = items.find((o) => !o.disabled)?.value;

    const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? firstEnabled);
    const selected = value !== undefined ? value : uncontrolled;
    const pending = status === 'pending';

    const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

    const select = (next: string) => {
      /* A save is in flight: the selection is spoken for until it settles. */
      if (pending) return;
      if (value === undefined) setUncontrolled(next);
      onChange?.(next);
    };

    /* Roving tabindex: the group is one tab stop. Arrow keys move between
       segments and select as they go, which is the expected radio-group
       behaviour. Home/End jump to the ends. */
    const move = (from: number, step: number) => {
      const n = items.length;
      for (let i = 1; i <= n; i++) {
        const next = (from + step * i + n * n) % n;
        if (!items[next].disabled) {
          refs.current[next]?.focus();
          select(items[next].value);
          return;
        }
      }
    };

    const onKeyDown = (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          move(index, 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          move(index, -1);
          break;
        case 'Home':
          e.preventDefault();
          move(-1, 1);
          break;
        case 'End':
          e.preventDefault();
          move(items.length, -1);
          break;
        default:
      }
    };

    /* Whichever segment is selected owns the tab stop. If nothing is selected,
       the first enabled one does, so the group is always reachable. */
    const tabStop = items.findIndex((o) => o.value === selected);
    const rovingIndex = tabStop >= 0 ? tabStop : items.findIndex((o) => !o.disabled);

    return (
      <div
        ref={ref}
        role="radiogroup"
        /* `aria-busy` while the save is in flight; `aria-invalid` when it
           failed. Both sit before the spread so a `Field` wiring its own
           `aria-invalid` onto the control wins. `data-status` is for styling
           hooks and tests — it is not an accessibility signal. */
        aria-busy={pending || undefined}
        aria-invalid={status === 'error' || undefined}
        data-status={status}
        className={cn(track({ fullWidth, size, status }), className)}
        {...props}
      >
        {items.map((option, i) => {
          const isSelected = option.value === selected;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={option['aria-label']}
              disabled={option.disabled}
              tabIndex={i === rovingIndex ? 0 : -1}
              onClick={() => select(option.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(segment({ size, fullWidth, pending }))}
            >
              {/* The save's state rides in the selected segment, decorative:
                  `aria-busy` on the group already says "pending", and success
                  is a moment, not information to announce. */}
              {isSelected && pending && (
                <Icon
                  name="circle-notch"
                  size="sm"
                  aria-hidden="true"
                  className="shrink-0 animate-spin motion-reduce:animate-pulse"
                />
              )}
              {isSelected && status === 'success' && (
                <Icon
                  name="check"
                  size="sm"
                  aria-hidden="true"
                  className="shrink-0 text-accent-success-tonal-content-default"
                />
              )}
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  },
);
SegmentedControl.displayName = 'SegmentedControl';
