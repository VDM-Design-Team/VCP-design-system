import * as React from 'react';
import { cn } from '../../lib/cn';
import { Tag } from '../../atoms/tag';

/**
 * CycleTag — the cycle an Added Value belongs to: its code and the dates it
 * runs, "C18 (Sep 20, 2025 - Oct 02, 2026)". A component: it is a `Tag` plus
 * the one way VCP writes a cycle.
 *
 * Read off the Figma `Cycle_Tag` (`8562:11083`, Tags page): outlined, no fill,
 * 14 medium in `neutral.outline.content.default`. That is `Tag`'s `outline` /
 * `neutral` look at its `md` size (28 tall, `radius.sm`) with one difference,
 * the design's: the border is `stroke.default`, the everyday decorative
 * border, not `neutral.outline.border.default`, which is a step darker. The
 * border is decoration here — the words say everything — so the lighter
 * stroke is fine; see docs/cycle-tag.md.
 *
 * The Figma frame is 32 tall, but that is the Figma `Tag`'s extra-large size
 * left on by mistake: the Tag scale is 20 / 24 / 28 / 32, 28 is the large
 * size every other tag here uses, and `SourceTag` beside it is 28.
 *
 * Cycles are data: pass `code`, `start` and `end` (ISO `yyyy-mm-dd`). The
 * dates are formatted by splitting the string, with no `Date` and no time
 * zone, so a cycle never shows the day before in a western time zone.
 * `formatCycleRange` is exported so any piece that lists cycles writes them
 * the same way.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** ISO `yyyy-mm-dd` → "Sep 20, 2025". An unparseable value is returned as given. */
const longDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  const month = MONTHS[Number(m) - 1];
  if (!y || !month || !d) return iso;
  return `${month} ${String(Number(d)).padStart(2, '0')}, ${y}`;
};

/** "Sep 20, 2025 - Oct 02, 2026" — how VCP writes the dates a cycle runs. */
export const formatCycleRange = (start: string, end: string) =>
  `${longDate(start)} - ${longDate(end)}`;

export interface CycleTagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** "C18". */
  code: string;
  /** ISO `yyyy-mm-dd`. */
  start: string;
  /** ISO `yyyy-mm-dd`. */
  end: string;
}

export const CycleTag = React.forwardRef<HTMLSpanElement, CycleTagProps>(
  ({ className, code, start, end, ...props }, ref) => (
    <Tag
      ref={ref}
      variant="outline"
      tone="neutral"
      className={cn('border-stroke-default', className)}
      {...props}
    >
      {`${code} (${formatCycleRange(start, end)})`}
    </Tag>
  ),
);
CycleTag.displayName = 'CycleTag';
