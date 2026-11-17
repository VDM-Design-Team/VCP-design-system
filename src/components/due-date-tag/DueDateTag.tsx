import * as React from 'react';
import { Tag, type TagProps } from '../../atoms/tag';
import { useDateFormat } from '../../lib/format-date';

/**
 * DueDateTag — an Added Value's due date, worn as a tag that changes colour
 * as the date approaches. A `Tag` plus the owner of VCP's due-date → tone
 * mapping: this file is where that mapping lives, and nowhere else.
 *
 * Read off the Figma `Due_Date_Tag` set (`3429:11064`), audit batch 5,
 * 11 September 2026. The set draws three proximities — Default, Due Soon,
 * Overdue — in two styles and two sizes; this renders the tonal style, which
 * is the one every VCP screen uses.
 *
 * **It shows the date the system's one way.** Give it `date` (ISO `yyyy-mm-dd`) and it reads dd/mm/yyyy, or the
 * person's locale when the product sets one (`DateFormatProvider`), inside a `<time>` that carries the ISO date —
 * the same formatter every other date in the system goes through (decided with design, 6 Nov 2026), so a due date
 * never reads one way in a table and another on the page it opens. Do not hand it a date you formatted yourself.
 * `children` is still taken, for the rare text that is not a date ("-").
 *
 * **The threshold is the caller's, and deliberately so.** `dueDateTone`
 * below does the comparing, but it will not guess what "due soon" means:
 * `soonWithinDays` has no default. How many days ahead counts as soon is a
 * product rule that differs by domain, and a design system that invents one
 * has quietly made a product decision. Open question for design — see
 * docs/due-date-tag.md.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type DueDateProximity = 'default' | 'due-soon' | 'overdue';

/* THE mapping — the three rows of the Figma `Due_Date_Tag` set, tonal style.

   Figma's Default row is `neutral.tonal.*` (slate-200 on slate-700); `Tag`'s
   own neutral tonal is `surface.neutral.subtle` on `text.secondary` —
   slate-100 on slate-700. One step of slate apart on the fill, same text. The
   Tag tone is used rather than adding a near-duplicate token family, so
   every neutral tag in the system stays one colour. Noted in the doc. */
const PROXIMITY: Record<DueDateProximity, NonNullable<TagProps['tone']>> = {
  default: 'neutral',
  'due-soon': 'warning',
  overdue: 'critical',
};

export interface DueDateTagProps extends Omit<TagProps, 'tone' | 'variant' | 'children'> {
  /** How near the date is. Compute it with `dueDateTone` if you have a `Date`. */
  proximity?: DueDateProximity;
  /** The due date, ISO `yyyy-mm-dd`. Shown dd/mm/yyyy (or the person's locale) inside a `<time>`. */
  date?: string;
  /** Text in place of `date`, for what is not a date ("-"). A date belongs in `date`: do not format one yourself. */
  children?: React.ReactNode;
}

export const DueDateTag = React.forwardRef<HTMLSpanElement, DueDateTagProps>(
  ({ proximity = 'default', date, children, size = 'sm', ...props }, ref) => {
    /* dd/mm/yyyy, or the person's locale when the product sets one (`DateFormatProvider`). */
    const dates = useDateFormat();
    return (
      <Tag ref={ref} tone={PROXIMITY[proximity]} size={size} {...props}>
        {children ?? (date ? <time dateTime={date}>{dates.format(date)}</time> : null)}
      </Tag>
    );
  },
);
DueDateTag.displayName = 'DueDateTag';

/**
 * Which proximity a date falls in. The comparison lives here so that "is this
 * overdue?" is answered the same way everywhere.
 *
 * `soonWithinDays` is **required**: see the note above. Pass your domain's
 * rule; there is no house default to fall back on.
 *
 * Both dates are floored to local midnight before comparing, so a task due
 * today is never "overdue" at 4pm — whole days are the unit a due date is
 * expressed in.
 */
export function dueDateTone({
  due,
  soonWithinDays,
  now = new Date(),
}: {
  due: Date;
  soonWithinDays: number;
  now?: Date;
}): DueDateProximity {
  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(due) - midnight(now)) / 86_400_000);
  if (days < 0) return 'overdue';
  if (days <= soonWithinDays) return 'due-soon';
  return 'default';
}
