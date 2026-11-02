import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar, type AvatarProps } from '../../atoms/avatar';
import { AssigneeStatus, ASSIGNEE_STATUS_LABEL, type AssigneeAvailability } from '../../atoms/assignee-status';
import { Tooltip } from '../../atoms/tooltip';

/**
 * AssigneeWithStatus — an assignee's avatar with their availability dot on its
 * bottom-right corner, and a tooltip that says it in words. Built to Figma's
 * `_Assignee_with_Status_Dev` (three statuses × tooltip yes/no).
 *
 * The tooltip reads "John Doe (Assignee, Busy)": the name, the role and the
 * status. The dot alone would be colour only, so the words are the avatar's
 * accessible name too — a screen reader hears the same sentence a pointer user
 * sees, without hovering.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface AssigneeWithStatusProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    Pick<AvatarProps, 'src' | 'size'> {
  name: string;
  status: AssigneeAvailability;
  /** The role in the sentence: "Assignee", "Initiator". */
  role?: string;
  /** Show the tooltip on hover and focus. On by default; off where the name is already beside it. */
  tooltip?: boolean;
}

export const AssigneeWithStatus = React.forwardRef<HTMLSpanElement, AssigneeWithStatusProps>(
  ({ className, name, status, role = 'Assignee', src, size = 'md', tooltip = true, ...props }, ref) => {
    const sentence = `${name} (${role}, ${ASSIGNEE_STATUS_LABEL[status]})`;
    const body = (
      <span
        ref={ref}
        role="img"
        aria-label={sentence}
        tabIndex={tooltip ? 0 : undefined}
        className={cn(
          'relative inline-flex shrink-0 rounded-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
          className,
        )}
        {...props}
      >
        <Avatar name={name} src={src} size={size} aria-hidden="true" />
        <AssigneeStatus
          status={status}
          size="table"
          className="absolute right-0 bottom-0 ring-2 ring-surface-elevated"
        />
      </span>
    );
    return tooltip ? <Tooltip content={sentence}>{body}</Tooltip> : body;
  },
);
AssigneeWithStatus.displayName = 'AssigneeWithStatus';
