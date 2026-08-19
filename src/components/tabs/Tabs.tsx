import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Tabs — moves between sibling panels of content under one heading.
 *
 * Each tab owns a panel. If the options only change how the *same* content is
 * shown, use SegmentedControl instead.
 *
 * This component renders the tab bar only. The consumer renders the panels, and
 * wires them up with the ids documented in `docs/tabs.md`.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const tabList = cva(['flex items-end gap-1', 'border-b border-stroke-subtle'], {
  variants: { fullWidth: { true: 'w-full', false: '' } },
  defaultVariants: { fullWidth: false },
});

const tab = cva(
  [
    'group inline-flex items-center justify-center gap-2 -mb-px',
    'font-sans whitespace-nowrap cursor-pointer',
    'border-b-2 border-transparent',
    'text-text-tertiary transition-colors',
    'hover:text-text-primary',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    'disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:text-text-disabled',
    /* Selected: the label takes the brand colour and an underline anchors it to
       its panel. The underline is the state indicator; the colour reinforces it. */
    'aria-selected:text-action-secondary-content-default',
    'aria-selected:border-action-secondary-content-default',
  ],
  {
    variants: {
      size: { sm: 'h-8 px-3 text-label-md', md: 'h-10 px-4 text-label-lg' },
      fullWidth: { true: 'flex-1', false: '' },
    },
    defaultVariants: { size: 'md', fullWidth: false },
  },
);

const badge = cva(
  [
    'inline-flex items-center justify-center shrink-0',
    'h-4 px-1.5 rounded-pill',
    'font-numeric text-caption-sm',
    'bg-surface-neutral-subtle text-text-tertiary transition-colors',
    'group-aria-selected:bg-surface-brand-faint',
    'group-aria-selected:text-action-secondary-content-default',
  ],
);

export interface TabItem {
  key: string;
  label: React.ReactNode;
  /** A count shown as a pill after the label. `0` renders; `undefined` doesn't. */
  count?: number;
  /**
   * What the count means, for screen readers — "12 unread". Without it the bare
   * number is announced after the label ("Inbox 12"), which is usually enough.
   */
  countLabel?: string;
  disabled?: boolean;
}

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    VariantProps<typeof tab> {
  tabs: Array<string | TabItem>;
  /** Controlled selection. */
  value?: string;
  /** Uncontrolled starting selection. Defaults to the first enabled tab. */
  defaultValue?: string;
  onChange?: (key: string) => void;
  /**
   * Turns on `aria-controls`. Pass a prefix here and the same one to `tabId()` and
   * `tabPanelId()` when you render the panels, and each tab will point at its panel.
   * Omit it and the tabs carry no `aria-controls` — a reference to a panel that
   * doesn't exist is worse than no reference at all.
   */
  idPrefix?: string;
  /** Labels the tab list for screen readers. Use this or `aria-labelledby`. */
  'aria-label'?: string;
}

/** The `id` of a tab button. Use as the panel's `aria-labelledby`. */
export const tabId = (prefix: string, key: string) => `${prefix}-tab-${key}`;
/** The `id` the panel must carry, so the tab's `aria-controls` resolves. */
export const tabPanelId = (prefix: string, key: string) => `${prefix}-panel-${key}`;

const normalise = (t: string | TabItem): TabItem => (typeof t === 'string' ? { key: t, label: t } : t);

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    { className, tabs, value, defaultValue, onChange, size, fullWidth, idPrefix, ...props },
    ref,
  ) => {
    const items = React.useMemo(() => tabs.map(normalise), [tabs]);
    const firstEnabled = items.find((t) => !t.disabled)?.key;

    const generatedId = React.useId();
    const prefix = idPrefix ?? generatedId;

    const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? firstEnabled);
    const selected = value !== undefined ? value : uncontrolled;

    const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

    const select = (next: string) => {
      if (value === undefined) setUncontrolled(next);
      onChange?.(next);
    };

    /* Roving tabindex: the bar is one tab stop, arrow keys move within it.
       Activation follows focus — these panels are cheap to render. If a panel
       ever becomes expensive, switch to manual activation (Enter/Space). */
    const move = (from: number, step: number) => {
      const n = items.length;
      for (let i = 1; i <= n; i++) {
        const next = (from + step * i + n * n) % n;
        if (!items[next].disabled) {
          refs.current[next]?.focus();
          select(items[next].key);
          return;
        }
      }
    };

    const onKeyDown = (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          move(index, 1);
          break;
        case 'ArrowLeft':
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

    const selectedIndex = items.findIndex((t) => t.key === selected);
    const rovingIndex = selectedIndex >= 0 ? selectedIndex : items.findIndex((t) => !t.disabled);

    return (
      <div ref={ref} role="tablist" className={cn(tabList({ fullWidth }), className)} {...props}>
        {items.map((item, i) => (
          <button
            key={item.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(prefix, item.key)}
            aria-selected={item.key === selected}
            aria-controls={idPrefix ? tabPanelId(idPrefix, item.key) : undefined}
            disabled={item.disabled}
            tabIndex={i === rovingIndex ? 0 : -1}
            onClick={() => select(item.key)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={tab({ size, fullWidth })}
          >
            <span className="truncate">{item.label}</span>
            {item.count !== undefined && (
              <>
                <span className={badge()} aria-hidden={item.countLabel ? 'true' : undefined}>
                  {item.count}
                </span>
                {item.countLabel && <span className="sr-only">{item.countLabel}</span>}
              </>
            )}
          </button>
        ))}
      </div>
    );
  },
);
Tabs.displayName = 'Tabs';
