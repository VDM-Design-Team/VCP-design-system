import * as React from 'react';
import { cn } from '../../lib/cn';
import { InfoHint } from '../info-hint';

/**
 * CardHeader — the head of a dashboard card: its **title** (the card's `h2`), an optional **info icon** that explains it (`InfoHint`), and an optional slot for **controls** on the right (a filter,
 * a period picker). The cards had each drawn this by hand, with slightly different gaps, truncation and heading wiring; this is the one version, so they read the same.
 *
 * - **The title is the card's heading.** Give it an `id` and point the card's `aria-labelledby` at it, so the card is a region named by what it says.
 * - **The hint sits 4 from the title**, a 16 `InfoHint` (the system's one info icon), named "About {title}".
 * - **The controls are a slot** (`actions`): a row of selects or buttons, right-aligned. When the card is narrow the row wraps and the controls drop under the title instead of squeezing it.
 * - **Spacing under it is the card's**: pass a `className` (`mb-3`, or the card's own `gap`), since each card spaces its parts differently.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The card's title: its `h2`. */
  title: React.ReactNode;
  /** The `id` of the `h2`, for the card's `aria-labelledby`. */
  headingId?: string;
  /** A ref to the `h2`, for a card that moves focus to its heading (give `headingTabIndex` too). */
  headingRef?: React.Ref<HTMLHeadingElement>;
  /** `-1` makes the heading something code can focus without making it a tab stop. */
  headingTabIndex?: number;
  /** What the info icon explains. Omit it and there is no icon. */
  hint?: string;
  /** What the info icon is named "About ...": the title, when it is plain text. Say it when the title is not. */
  hintLabel?: string;
  /** Controls on the right of the title: a filter, a period picker. */
  actions?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLElement, CardHeaderProps>(
  ({ className, title, headingId, headingRef, headingTabIndex, hint, hintLabel, actions, ...props }, ref) => (
    <header ref={ref} className={cn('flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 font-sans', className)} {...props}>
      <div className="flex min-w-0 max-w-full items-center gap-1">
        <h2
          ref={headingRef}
          id={headingId}
          tabIndex={headingTabIndex}
          className={cn('m-0 min-w-0 truncate text-title-sm-semibold text-text-primary', headingTabIndex !== undefined && 'focus:outline-none')}
        >
          {title}
        </h2>
        {hint && <InfoHint label={hintLabel ?? (typeof title === 'string' ? title : 'this section')} content={hint} />}
      </div>
      {actions && <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3">{actions}</div>}
    </header>
  ),
);
CardHeader.displayName = 'CardHeader';
