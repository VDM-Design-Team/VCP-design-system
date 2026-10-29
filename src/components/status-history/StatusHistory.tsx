import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';

/**
 * StatusHistory — the collapsible bar on an Added Value that holds its status
 * log: a clock, "Status History (1)", and a caret that says which way it opens.
 * Read off the Figma `Status_History` set (Closed and Open). The Figma set draws
 * only the bar; what lies under it when it is open is the caller's (the task log
 * trail), passed as `children`.
 *
 * It is a disclosure, so it is wired as one: the title is a real heading, the bar is
 * the `<button>` inside it with `aria-expanded` and `aria-controls`, and the open
 * panel is a labelled `region`. State works both ways, as on `Accordion`: pass `open`
 * (+ `onOpenChange`) to control it, or leave it and `defaultOpen` seeds it.
 *
 * It is not an `Accordion` item because the Figma bar is a different shape: the
 * clock leads, the caret trails and swaps glyph, and it stands alone on the page
 * as a white card, not as one of a stack.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface StatusHistoryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** The bar's title. Defaults to "Status History". */
  title?: React.ReactNode;
  /** How many entries are in the log; shown as "(3)" after the title. Omit for none. */
  count?: number;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled: whether it starts open. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Heading level of the title. Default `3`. */
  headingLevel?: 2 | 3 | 4;
  /** What shows while it is open — the status log. Only mounted while open. */
  children?: React.ReactNode;
}

export const StatusHistory = React.forwardRef<HTMLDivElement, StatusHistoryProps>(
  (
    {
      className,
      title = 'Status History',
      count,
      open,
      defaultOpen = false,
      onOpenChange,
      headingLevel = 3,
      children,
      ...props
    },
    ref,
  ) => {
    const idBase = React.useId();
    const [inner, setInner] = React.useState(defaultOpen);
    const controlled = open !== undefined;
    const isOpen = controlled ? open : inner;
    const Heading = `h${headingLevel}` as const;
    const headerId = `${idBase}-h`;
    const panelId = `${idBase}-p`;

    const toggle = () => {
      if (!controlled) setInner(!isOpen);
      onOpenChange?.(!isOpen);
    };

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden rounded-md bg-surface-elevated font-sans', className)}
        {...props}
      >
        <Heading className="m-0">
          <button
            type="button"
            id={headerId}
            aria-expanded={isOpen}
            aria-controls={isOpen ? panelId : undefined}
            onClick={toggle}
            className={cn(
              'flex w-full items-center justify-between gap-4 p-4 text-left',
              /* The card clips, so the ring draws inward. */
              'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <Icon name="clock-fill" size={20} className="shrink-0 text-text-tertiary" />
              <span className="min-w-0 truncate text-title-sm-semibold text-text-primary">
                {title}
                {count != null && ` (${count})`}
              </span>
            </span>
            <Icon
              name={isOpen ? 'caret-up' : 'caret-down'}
              size={20}
              className="shrink-0 text-text-tertiary"
            />
          </button>
        </Heading>
        {isOpen && (
          <div
            role="region"
            id={panelId}
            aria-labelledby={headerId}
            className="px-4 pb-4 text-body-sm-regular text-text-secondary"
          >
            {children}
          </div>
        )}
      </div>
    );
  },
);
StatusHistory.displayName = 'StatusHistory';
