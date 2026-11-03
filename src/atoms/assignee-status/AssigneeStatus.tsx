import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * AssigneeStatus — the availability dot: green (available), amber (busy) or
 * red (unavailable). Built to Figma's `_Assignee_Status_Dev`, six types: three
 * statuses at the two sizes the design uses it at.
 *
 * - **`table`** (10) — on the corner of an assignee's avatar in the Planning
 *   table.
 * - **`menu`** (12) — beside a group heading in the assignee dropdown.
 *
 * The dot is colour, so it never stands alone: decorative (`aria-hidden`) by
 * default, because the words ("Busy", "John Doe (Assignee, Busy)") sit right
 * beside it. Pass `label` where it is the only carrier and it becomes an
 * image with that name. The status → colour mapping is owned here:
 *
 * | Status | Token |
 * |---|---|
 * | `available` | `accent.success.outline.border` |
 * | `busy` | `accent.warning.outline.border` |
 * | `unavailable` | `accent.critical.outline.border` |
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type AssigneeAvailability = 'available' | 'busy' | 'unavailable';

/** The words for each status — for tooltips, group headings and announcements. */
export const ASSIGNEE_STATUS_LABEL: Record<AssigneeAvailability, string> = {
  available: 'Available',
  busy: 'Busy',
  unavailable: 'Unavailable',
};

const dot = cva('inline-block shrink-0 rounded-pill', {
  variants: {
    status: {
      available: 'bg-accent-success-outline-border-default',
      busy: 'bg-accent-warning-outline-border-default',
      unavailable: 'bg-accent-critical-outline-border-default',
    },
    size: {
      table: 'size-2.5',
      menu: 'size-3',
    },
  },
  defaultVariants: { size: 'menu' },
});

export interface AssigneeStatusProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    Omit<VariantProps<typeof dot>, 'status'> {
  status: AssigneeAvailability;
  /** Names the dot (as an image) when nothing beside it says the status. Left out, it is decorative. */
  label?: string;
}

export const AssigneeStatus = React.forwardRef<HTMLSpanElement, AssigneeStatusProps>(
  ({ className, status, size, label, ...props }, ref) => (
    <span
      ref={ref}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(dot({ status, size }), className)}
      {...props}
    />
  ),
);
AssigneeStatus.displayName = 'AssigneeStatus';
