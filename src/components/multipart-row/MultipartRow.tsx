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
 * that opens the part when `onOpen` is given), **the assignee's avatar**, **capacity points** ("10 CP"), **"Due Date:"**, **the date**, a rule,
 * and **the status**. A part with no points or date yet reads "- CP" and "-" (Figma's empty child).
 *
 * **Rows line up with each other because they share one grid.** A row is a *subgrid* of its `MultipartRowGroup`: every column (number, title,
 * avatar, points, "Due Date:", date, rule, status) is as wide as its widest cell across *all* the rows, so the points, the dates and the status
 * tags sit in straight columns, and the status column is only as wide as the widest tag. The title takes the spare room and is cut with "…".
 * **Below a container width of 56rem the rows stack** (the number and title on top, the rest beneath, left-aligned) and the grid goes away.
 * A row must be inside a `MultipartRowGroup`; `MultipartSection` does that for you.
 *
 * - **Status** is a spine status (`status`, "Completed") or a domain step's own words (`customStatus`, "Ready for Deploy"); `StatusTag` owns
 *   the colour either way.
 * - **Nothing is formatted here**: the date is already words ("October 1, 2025").
 * - **It does nothing itself.** `onOpen` only asks; the page opens the part.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. The one arbitrary class is the group's column list
 * (a grid template has no token). ds-lint-ignore
 */
export interface MultipartRowProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> {
  /** The part's place in the sequence: 1, 2, 3. */
  number: number;
  title: string;
  /** The assigned person. Without one the avatar's column stays empty. */
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

/**
 * MultipartRowGroup — the list the rows live in, and the grid their columns are shared on: number, title (the spare room), avatar, points,
 * "Due Date:", date, rule, status. Wider than 56rem (its own width, not the viewport's) it is that grid; narrower, a plain column of stacked rows.
 */
export const MultipartRowGroup = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <div className="@container">
      <ul
        ref={ref}
        className={cn(
          'm-0 flex list-none flex-col gap-4 p-0',
          '@4xl:grid @4xl:grid-cols-[2rem_minmax(16rem,1fr)_2rem_max-content_max-content_max-content_1.5rem_max-content] @4xl:gap-y-5',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
MultipartRowGroup.displayName = 'MultipartRowGroup';

/* Stacked, a cell after the title sits under it in the second column; on the grid it is its own column. */
const STACKED = 'col-start-2 justify-self-start @4xl:col-auto';

export const MultipartRow = React.forwardRef<HTMLLIElement, MultipartRowProps>(
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
    const name = (
      <>
        <span className="sr-only">Part {number}: </span>
        {title}
      </>
    );
    return (
      <li
        ref={ref}
        className={cn(
          'grid list-none grid-cols-[2rem_1fr] items-center gap-x-4 gap-y-3 rounded-sm border border-stroke-default bg-surface-elevated p-4 font-sans',
          'transition-colors hover:bg-surface-brand-base',
          '@4xl:col-span-full @4xl:grid-cols-subgrid @4xl:gap-y-0 @4xl:px-4 @4xl:py-0 @4xl:min-h-20',
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid size-8 place-items-center rounded-full text-label-sm-medium',
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
              'min-w-0 truncate rounded-sm text-left text-body-md-semibold text-text-primary',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            {name}
          </button>
        ) : (
          <span className="min-w-0 truncate text-body-md-semibold text-text-primary">{name}</span>
        )}
        {assignee ? (
          /* The name is read out here for a screen reader; the picture is decoration. */
          <span className={cn('flex justify-center', STACKED)}>
            <Avatar size="md" name={assignee.name} src={assignee.src} standalone />
          </span>
        ) : (
          <span aria-hidden="true" className="hidden @4xl:block" />
        )}
        <Badge size="lg" className={STACKED}>
          {capacityPoints == null ? '-' : capacityPoints} CP
        </Badge>
        <span className={cn('whitespace-nowrap text-body-sm-regular text-text-tertiary', STACKED)}>Due Date:</span>
        <DueDateTag proximity={dueProximity} className={STACKED}>
          {dueDate ?? '-'}
        </DueDateTag>
        <span aria-hidden="true" className="hidden h-11 w-px justify-self-center bg-stroke-default @4xl:block" />
        <span className={cn('flex justify-end', STACKED)}>
          {customStatus ? <StatusTag custom={customStatus} /> : status ? <StatusTag status={status} /> : null}
        </span>
      </li>
    );
  },
);
MultipartRow.displayName = 'MultipartRow';
