import * as React from 'react';
import { Badge, type BadgeProps } from '../../atoms/badge';

/**
 * StatusPill — an Added Value's status, worn as a pill: a `Badge` carrying
 * VCP's status vocabulary and the status → treatment mapping that
 * docs/badge.md promised would live in exactly one place — this one.
 *
 * **The vocabulary comes from Figma**, not from the Claude Design export.
 * The design audit (3 Sep 2026, docs/figma-audit.md) read the
 * `Status_Tag_General` set on the Tags page: eleven statuses, each with its
 * own fill. The export shipped a different seven (`Ready for review`,
 * `Ready for hand-off`, `Blocked`, `Archive` — none of which exist in the
 * design), and this component shipped with those until the audit.
 *
 * Every fill below is the Figma colour, matched to the token that already
 * carried it — `info` = blue-100/700, `warning` = yellow-100/700,
 * `danger` = red-100/800, all exact. `Review` is the one **filled** tag in
 * the design (blue-600 on white), which is why `Badge` gained a `variant`.
 *
 * There is no dot: the Figma tag is text on a fill, and text is what
 * distinguishes two statuses that share a colour (Accepted / In Progress).
 */
export type AVStatus =
  | 'Draft'
  | 'Initiated'
  | 'Pending'
  | 'In Progress'
  | 'Review'
  | 'Review No Action'
  | 'Accepted'
  | 'Completed'
  | 'Rejected'
  | 'Reopened'
  | 'Backlog';

/** Every status, in lifecycle order. For pickers, legends, and tests. */
export const AV_STATUSES: readonly AVStatus[] = [
  'Draft',
  'Initiated',
  'Pending',
  'In Progress',
  'Review',
  'Review No Action',
  'Accepted',
  'Completed',
  'Rejected',
  'Reopened',
  'Backlog',
];

type Treatment = {
  tone: NonNullable<BadgeProps['tone']>;
  variant?: NonNullable<BadgeProps['variant']>;
};

/* THE mapping — every row measured off the Figma `Status_Tag_General` set.
   If you are writing `tone={status === 'Rejected' ? …}` at a call site, the
   line you want is already here. */
const STATUS_TREATMENT: Record<AVStatus, Treatment> = {
  Draft: { tone: 'neutral' },
  Backlog: { tone: 'neutral' },
  Pending: { tone: 'warning' },
  Initiated: { tone: 'warning' },
  'In Progress': { tone: 'info' },
  Accepted: { tone: 'info' },
  Reopened: { tone: 'info' },
  'Review No Action': { tone: 'info' },
  Completed: { tone: 'success' },
  Rejected: { tone: 'danger' },
  /* The one solid tag in the design — the review that wants acting on. */
  Review: { tone: 'info', variant: 'filled' },
};

export interface StatusPillProps
  extends Omit<BadgeProps, 'tone' | 'variant' | 'icon' | 'trailingIcon' | 'children'> {
  status: AVStatus;
}

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ status, ...props }, ref) => {
    const { tone, variant } = STATUS_TREATMENT[status];
    return (
      <Badge ref={ref} tone={tone} variant={variant} {...props}>
        {status}
      </Badge>
    );
  },
);
StatusPill.displayName = 'StatusPill';
