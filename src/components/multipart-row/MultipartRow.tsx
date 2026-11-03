import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Badge } from '../../atoms/badge';
import { DueDateTag, type DueDateProximity } from '../due-date-tag';
import { StatusTag, type AVStatus } from '../status-tag';

/**
 * MultipartRow — one part of a multipart Added Value: its number, its title, who it is assigned to, its capacity points, its due date and its
 * status. Built to Figma's `Multipart_Section` rows (`_Multipart_Row_*`).
 *
 * Left to right: **the number** (a grey disc; **green when the part is completed**), **the title** (cut with "…" when long, and the button
 * that opens the part when `onOpen` is given), **the assignee's avatar**, **capacity points** ("10 CP"), **"Due Date:"** with the date, a
 * rule, and **the status**. A part with no points or date yet reads "- CP" and "-" (Figma's empty child).
 *
 * - **Status** is a spine status (`status`, "Completed") or a domain step's own words (`customStatus`, "Ready for Deploy"); `StatusTag` owns
 *   the colour either way.
 * - **Nothing is formatted here**: the date is already words ("October 1, 2025").
 * - **It does nothing itself.** `onOpen` only asks; the page opens the part.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface MultipartRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The part's place in the sequence: 1, 2, 3. */
  number: number;
  title: string;
  /** The assigned person. Without one the avatar's place stays empty. */
  assignee?: { name: string; src?: string };
  /** Capacity points. `null` or left out reads "- CP". */
  capacityPoints?: number | null;
  /** The due date, already formatted. Left out reads "-". */
  dueDate?: string;
  dueProximity?: DueDateProximity;
  /** A spine status. Use `customStatus` for a domain step's words. */
  status?: AVStatus;
  /** A domain step's own words: "Ready for Deploy". */
  customStatus?: string;
  /** Marks the part done: the number turns green. Defaults to `status === 'Completed'`. */
  completed?: boolean;
  /** The title was pressed. The page opens the part. */
  onOpen?: () => void;
}

export const MultipartRow = React.forwardRef<HTMLDivElement, MultipartRowProps>(
  (
    {
      className,
      number,
      title,
      assignee,
      capacityPoints,
      dueDate,
      dueProximity,
      status,
      customStatus,
      completed,
      onOpen,
      ...props
    },
    ref,
  ) => {
    const done = completed ?? status === 'Completed';
    return (
      <div
        ref={ref}
        className={cn(
          'flex min-w-160 items-center gap-4 rounded-sm border border-stroke-default bg-surface-elevated px-4 py-3 font-sans',
          'transition-colors hover:bg-surface-brand-base',
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-full text-caption-md-medium',
            done
              ? 'bg-accent-success-filled-surface-default text-accent-success-filled-content-default'
              : 'bg-surface-neutral-subtle text-text-secondary',
          )}
        >
          {number}
        </span>
        {onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            className={cn(
              'min-w-0 flex-1 truncate rounded-sm text-left text-body-sm-medium text-text-primary',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            <span className="sr-only">Part {number}: </span>
            {title}
          </button>
        ) : (
          <span className="min-w-0 flex-1 truncate text-body-sm-medium text-text-primary">
            <span className="sr-only">Part {number}: </span>
            {title}
          </span>
        )}
        {assignee ? (
          /* The name is read out here for a screen reader; the picture is decoration. */
          <span className="shrink-0">
            <Avatar size="md" name={assignee.name} src={assignee.src} standalone />
          </span>
        ) : (
          <span aria-hidden="true" className="size-8 shrink-0" />
        )}
        <Badge size="lg" className="shrink-0">
          {capacityPoints == null ? '-' : capacityPoints} CP
        </Badge>
        <span className="flex shrink-0 items-center gap-2 text-body-sm-regular text-text-tertiary">
          Due Date:
          <DueDateTag proximity={dueProximity}>{dueDate ?? '-'}</DueDateTag>
        </span>
        <span className="flex w-44 shrink-0 items-center justify-end self-stretch border-s border-stroke-default ps-4">
          {customStatus ? <StatusTag custom={customStatus} /> : status ? <StatusTag status={status} /> : null}
        </span>
      </div>
    );
  },
);
MultipartRow.displayName = 'MultipartRow';
