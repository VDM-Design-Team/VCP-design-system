import * as React from 'react';
import { Badge, type BadgeProps } from '../../atoms/badge';

/**
 * DueDatePill — an Added Value's due date, worn as a pill that changes colour
 * as the date approaches. A `Badge` plus the owner of VCP's due-date → tone
 * mapping: this file is where that mapping lives, and nowhere else.
 *
 * Read off the Figma `Due_Date_Tag` set (`3429:11064`), audit batch 5,
 * 11 September 2026. The set draws three proximities — Default, Due Soon,
 * Overdue — in two styles and two sizes; this renders the tonal style, which
 * is the one every VCP screen uses.
 *
 * **The date text is the caller's.** This takes an already-formatted string,
 * because how a date reads — "October 1, 2025", "1 Oct", "in 3 days" — is a
 * locale and product decision that a design-system pill has no business
 * making. What it owns is the colour.
 *
 * **The threshold is the caller's too, and deliberately so.** `dueDateTone`
 * below does the comparing, but it will not guess what "due soon" means:
 * `soonWithinDays` has no default. How many days ahead counts as soon is a
 * product rule that differs by domain, and a design system that invents one
 * has quietly made a product decision. Open question for design — see
 * docs/due-date-pill.md.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type DueDateProximity = 'default' | 'due-soon' | 'overdue';

/* THE mapping — the three rows of the Figma `Due_Date_Tag` set, tonal style.

   Figma's Default row is `neutral.tonal.*` (slate-200 on slate-700); `Badge`'s
   own neutral tonal is `surface.neutral.subtle` on `text.secondary` —
   slate-100 on slate-700. One step of slate apart on the fill, same text. The
   Badge tone is used rather than adding a near-duplicate token family, so
   every neutral pill in the system stays one colour. Noted in the doc. */
const PROXIMITY: Record<DueDateProximity, NonNullable<BadgeProps['tone']>> = {
  default: 'neutral',
  'due-soon': 'warning',
  overdue: 'danger',
};

export interface DueDatePillProps extends Omit<BadgeProps, 'tone' | 'variant' | 'children'> {
  /** How near the date is. Compute it with `dueDateTone` if you have a `Date`. */
  proximity?: DueDateProximity;
  /** The date, already formatted. "October 1, 2025". */
  children: React.ReactNode;
}

export const DueDatePill = React.forwardRef<HTMLSpanElement, DueDatePillProps>(
  ({ proximity = 'default', children, size = 'sm', ...props }, ref) => (
    <Badge ref={ref} tone={PROXIMITY[proximity]} size={size} {...props}>
      {children}
    </Badge>
  ),
);
DueDatePill.displayName = 'DueDatePill';

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
