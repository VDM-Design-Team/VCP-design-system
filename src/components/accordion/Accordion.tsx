import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';

/**
 * Accordion — stacked disclosure panels: FAQ entries, grouped settings, a
 * review checklist. Each header is a real `<button>` inside a real heading,
 * wired to its panel with `aria-expanded` / `aria-controls`, and each open
 * panel is a labelled `region` — the full APG disclosure pattern the export's
 * bare buttons implied but never wired.
 *
 * State works both ways: pass `openKeys` (+ `onToggle`) to control it, or
 * leave it uncontrolled — `defaultOpenKeys` seeds it, `multiple` decides
 * whether opening one closes the others. Controlled mode ignores `multiple`;
 * the caller owns the policy along with the state.
 *
 * The caret sits on the left and rotates in place — one glyph transformed, not
 * two glyphs swapped, so the motion reads as the panel's hinge. Content is
 * only mounted while open, exactly as the export did: what is closed does not
 * exist, which is the right default for panels holding heavy tables.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface AccordionItem {
  /** Identity across renders. Defaults to the index — fine for static lists. */
  key?: string;
  title: React.ReactNode;
  /** Right-aligned count or hint in the header — "4 open", "optional". */
  meta?: React.ReactNode;
  content?: React.ReactNode;
}

export interface AccordionProps
  /* `onToggle` shadows the native toggle-event handler — deliberately: the
     div fires no such event, and the accordion's vocabulary wins. */
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onToggle'> {
  items: readonly AccordionItem[];
  /** Controlled open keys. Providing this (even `[]`) makes it controlled. */
  openKeys?: readonly string[];
  /** Fires with the toggled key — required for controlled use. */
  onToggle?: (key: string) => void;
  /** Uncontrolled: which panels start open. */
  defaultOpenKeys?: readonly string[];
  /** Uncontrolled: allow several panels open at once. */
  multiple?: boolean;
  /** Heading level of the item titles. Default `3`. */
  headingLevel?: 2 | 3 | 4;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      className,
      items,
      openKeys,
      onToggle,
      defaultOpenKeys = [],
      multiple,
      headingLevel = 3,
      ...props
    },
    ref,
  ) => {
    const idBase = React.useId();
    const [inner, setInner] = React.useState<readonly string[]>(defaultOpenKeys);
    const controlled = openKeys !== undefined;
    const open = controlled ? openKeys : inner;
    const Heading = `h${headingLevel}` as const;

    const toggle = (key: string) => {
      if (!controlled) {
        setInner((cur) =>
          cur.includes(key)
            ? cur.filter((k) => k !== key)
            : multiple
              ? [...cur, key]
              : [key],
        );
      }
      onToggle?.(key);
    };

    return (
      <div ref={ref} className={cn('flex flex-col gap-2 font-sans', className)} {...props}>
        {items.map((item, i) => {
          const key = item.key ?? String(i);
          const on = open.includes(key);
          const headerId = `${idBase}-h-${key}`;
          const panelId = `${idBase}-p-${key}`;
          return (
            <div
              key={key}
              className="overflow-hidden rounded-md border border-stroke-subtle bg-surface-elevated"
            >
              <Heading className="m-0">
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={on}
                  aria-controls={on ? panelId : undefined}
                  onClick={() => toggle(key)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors',
                    on ? 'bg-surface-brand-base' : 'hover:bg-surface-neutral-faint',
                    /* The container clips, so the ring draws inward. */
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
                  )}
                >
                  <Icon
                    name="caret-right"
                    size="sm"
                    className={cn(
                      'shrink-0 text-text-tertiary transition-transform duration-200',
                      on && 'rotate-90',
                    )}
                  />
                  <span className="min-w-0 flex-1 text-label-lg text-text-primary">
                    {item.title}
                  </span>
                  {item.meta && (
                    <span className="shrink-0 text-body-sm text-text-tertiary">{item.meta}</span>
                  )}
                </button>
              </Heading>
              {on && (
                <div
                  role="region"
                  id={panelId}
                  aria-labelledby={headerId}
                  /* Left edge aligns the content under the title, past the caret. */
                  className="px-3.5 pb-3.5 pl-10 text-body-md text-text-secondary"
                >
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);
Accordion.displayName = 'Accordion';
