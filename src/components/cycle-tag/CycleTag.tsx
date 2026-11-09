import * as React from 'react';
import { cn } from '../../lib/cn';
import { formatDateRange, useDateFormat } from '../../lib/format-date';
import { Tag, type TagProps } from '../../atoms/tag';

/**
 * CycleTag — the cycle an Added Value belongs to: its code and the dates it
 * runs, "C18 (20/09/2025 - 02/10/2026)". A component: it is a `Tag` plus
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
 * dates read dd/mm/yyyy like every date in the system (decided 6 November
 * 2026; they were "Sep 20, 2025"), or the person's locale under
 * `DateFormatProvider`, and never pass through the machine's time zone, so a
 * cycle never shows the day before in a western time zone.
 * `formatCycleRange` is exported so any piece that lists cycles writes them
 * the same way.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
/** "20/09/2025 - 02/10/2026" — how VCP writes the dates a cycle runs. Pass a locale to follow it; inside a component, `useDateFormat().range` does that for you. */
export const formatCycleRange = (start: string, end: string, locale?: string) => formatDateRange(start, end, locale);

export interface CycleTagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** "C18". */
  code: string;
  /** ISO `yyyy-mm-dd`. */
  start: string;
  /** ISO `yyyy-mm-dd`. */
  end: string;
  /** The tag's size. Default `md`. */
  size?: TagProps['size'];
}

export const CycleTag = React.forwardRef<HTMLSpanElement, CycleTagProps>(
  ({ className, code, start, end, ...props }, ref) => {
    const { range } = useDateFormat();
    return (
      <Tag
        ref={ref}
        variant="outline"
        tone="neutral"
        className={cn('border-stroke-default', className)}
        {...props}
      >
        {`${code} (${range(start, end)})`}
      </Tag>
    );
  },
);
CycleTag.displayName = 'CycleTag';
