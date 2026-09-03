import * as React from 'react';
import { Badge, type BadgeProps } from '../../components/badge';

/**
 * StatusPill — an Added Value's status, worn as a pill. **A pattern, not a
 * component**: it exists to own VCP's status vocabulary and the status → tone
 * mapping that docs/badge.md promised would live here. Visually it *is* a
 * `Badge` — same sizes, same tonal pairs, same contrast numbers — plus the
 * status dot.
 *
 * The mapping is the whole file:
 *
 * - Draft, Archive → `neutral` (both grey; the label carries the difference)
 * - In progress → `brand`
 * - Ready for review → `warning`
 * - Ready for hand-off → `info` — the export painted it the indigo that has
 *   **no ramp** (the same indigo `DomainLabel` is waiting on); until that
 *   token decision lands, hand-off borrows the info blue
 * - Completed → `success`
 * - Blocked → `danger`
 *
 * The export's `interactive`/`onClick` (a clickable span) is gone — Badge's
 * rule holds here too: a pill is not a control. Changing a status is the
 * options dropdown's job (`AV_Options_Dropdown` in the Figma annotations),
 * a pattern of its own.
 */
export type AVStatus =
  | 'Draft'
  | 'In progress'
  | 'Ready for review'
  | 'Ready for hand-off'
  | 'Completed'
  | 'Blocked'
  | 'Archive';

/** Every status, in lifecycle order. For pickers, legends, and tests. */
export const AV_STATUSES: readonly AVStatus[] = [
  'Draft',
  'In progress',
  'Ready for review',
  'Ready for hand-off',
  'Completed',
  'Blocked',
  'Archive',
];

/* THE mapping. If you are writing `tone={status === 'Blocked' ? …}` at a call
   site, the line you want is already here. */
const STATUS_TONE: Record<AVStatus, NonNullable<BadgeProps['tone']>> = {
  Draft: 'neutral',
  'In progress': 'brand',
  'Ready for review': 'warning',
  'Ready for hand-off': 'info',
  Completed: 'success',
  Blocked: 'danger',
  Archive: 'neutral',
};

export interface StatusPillProps
  extends Omit<BadgeProps, 'tone' | 'icon' | 'trailingIcon' | 'children'> {
  status: AVStatus;
}

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ status, ...props }, ref) => (
    <Badge
      ref={ref}
      tone={STATUS_TONE[status]}
      /* The export's dot, as Badge's icon slot: currentColor, so it always
         matches the tone's content colour. Decorative — the words are the
         status; a colour-blind reader loses nothing. */
      icon={<span className="size-2 rounded-full bg-current" />}
      {...props}
    >
      {status}
    </Badge>
  ),
);
StatusPill.displayName = 'StatusPill';
