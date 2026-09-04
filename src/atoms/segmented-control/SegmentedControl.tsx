import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * SegmentedControl — a small set of mutually exclusive options, all visible at once.
 *
 * Use it to switch a view between two to five known modes (List / Board / Calendar).
 * It is a radio group, not a tab list: it changes how the same content is shown,
 * it does not swap one panel of content for another. Reach for Tabs when the
 * options lead to different content.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const track = cva(
  ['inline-flex items-center gap-0.5 p-0.5', 'bg-surface-neutral-subtle rounded-sm'],
  {
    variants: { fullWidth: { true: 'flex w-full', false: '' } },
    defaultVariants: { fullWidth: false },
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
    /* Selected: lifts onto its own surface and the label darkens. The lift — a
       raised surface plus a shadow — is the non-colour half of the cue; the
       label's colour change is the half that carries real contrast. */
    'aria-checked:bg-surface-elevated aria-checked:text-text-primary aria-checked:shadow-card',
  ],
  {
    variants: {
      size: { sm: 'h-8 px-3 text-label-md', md: 'h-10 px-4 text-label-lg' },
      fullWidth: { true: 'flex-1', false: '' },
    },
    defaultVariants: { size: 'md', fullWidth: false },
  },
);

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
  /** Screen-reader label. Required when `label` is an icon or otherwise not text. */
  'aria-label'?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    VariantProps<typeof segment> {
  options: Array<string | SegmentedControlOption>;
  /** Controlled selection. */
  value?: string;
  /** Uncontrolled starting selection. Defaults to the first enabled option. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Labels the group for screen readers. Use this or `aria-labelledby`. */
  'aria-label'?: string;
}

const normalise = (o: string | SegmentedControlOption): SegmentedControlOption =>
  typeof o === 'string' ? { value: o, label: o } : o;

export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ className, options, value, defaultValue, onChange, size, fullWidth, ...props }, ref) => {
    const items = React.useMemo(() => options.map(normalise), [options]);
    const firstEnabled = items.find((o) => !o.disabled)?.value;

    const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? firstEnabled);
    const selected = value !== undefined ? value : uncontrolled;

    const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

    const select = (next: string) => {
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
      <div ref={ref} role="radiogroup" className={cn(track({ fullWidth }), className)} {...props}>
        {items.map((option, i) => (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={option.value === selected}
            aria-label={option['aria-label']}
            disabled={option.disabled}
            tabIndex={i === rovingIndex ? 0 : -1}
            onClick={() => select(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={segment({ size, fullWidth })}
          >
            <span className="truncate">{option.label}</span>
          </button>
        ))}
      </div>
    );
  },
);
SegmentedControl.displayName = 'SegmentedControl';
