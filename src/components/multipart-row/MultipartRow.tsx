import * as React from 'react';
import { cn } from '../../lib/cn';
import { useDateFormat } from '../../lib/format-date';
import { Avatar } from '../../atoms/avatar';
import { Badge } from '../../atoms/badge';
import { IconButton } from '../../atoms/icon-button';
import { DueDateTag, type DueDateProximity } from '../due-date-tag';
import { StatusTag, type AVStatus } from '../status-tag';
import { TruncatedText, useIsTruncated } from '../truncated-text';
import { Tooltip } from '../../atoms/tooltip';

/**
 * MultipartRow — one part of a multipart Added Value: its number, its title, who it is assigned to, its capacity points, its due date and its
 * status. Built to Figma's `Multipart_Section` rows (`_Multipart_Row_*`).
 *
 * Left to right: **the number** (a grey disc; **green when the part is completed**), **the title** (cut with "…" when long, and the whole of it on hover and focus when it has been cut; the button
 * that opens the part when `onOpen` is given), **the assignee's avatar**, **capacity points** ("10 CP"), **"Due Date:"**, **the date**, a rule,
 * and **the status**. A part with no points or date yet reads "- CP" and "-" (Figma's empty child).
 *
 * **Rows line up with each other because they share one grid.** A row is a *subgrid* of its `MultipartRowGroup`: every column (number, title,
 * avatar, points, "Due Date:", date, rule, status) is as wide as its widest cell across *all* the rows, so the points, the dates and the status
 * tags sit in straight columns, and the status column is only as wide as the widest tag. The title takes the spare room and is cut with "…".
 * **Below a container width of 48rem the rows stack** (the number and title on top, the rest beneath, left-aligned) and the grid goes away.
 * A row must be inside a `MultipartRowGroup`; `MultipartSection` does that for you.
 *
 * - **Status** is a spine status (`status`, "Completed") or a domain step's own words (`customStatus`, "Ready for Deploy"); `StatusTag` owns
 *   the colour either way.
 * - **Hovering the row shows an edit button after the title** (Figma's `_Edit_Child_Part_Title_IconButton`): a 24 tonal disc with a pencil. It also shows
 *   when something in the row has *keyboard* focus (a mouse click does not hold it open), and always on a touch screen, where there is no hover. `onEditTitle` only asks: the page opens `ChildPartModal`
 *   in `edit` mode. Leave it out and there is no button.
 * - **The date is ISO** ("2025-10-01") and is shown the system's way: dd/mm/yyyy, or the person's locale (`useDateFormat`).
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
  /** The due date, ISO ("2025-10-01"): shown dd/mm/yyyy, or the person's locale. Left out reads "-". */
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
  /** The edit button (shown on hover or focus) was pressed. The page asks for the new title (`ChildPartModal`, `edit`). */
  onEditTitle?: () => void;
}

/** A part is done when it says so (`completed`), or when its status is Completed. One place, so the row and the section's count cannot drift. */
export const isPartCompleted = (part: { completed?: boolean; status?: AVStatus }): boolean => part.completed ?? part.status === 'Completed';

/**
 * MultipartRowGroup — the list the rows live in, and the grid their columns are shared on: number, title (the spare room), avatar, points,
 * "Due Date:", date, rule, status. Wider than 48rem (its own width, not the viewport's) it is that grid; narrower, a plain column of stacked rows.
 */
export const MultipartRowGroup = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <div className="@container">
      <ul
        ref={ref}
        className={cn(
          'm-0 flex list-none flex-col gap-3 p-0',
          '@3xl:grid @3xl:grid-cols-[max-content_minmax(7.5rem,1fr)_2rem_max-content_max-content_max-content_1px_max-content] @3xl:gap-x-4 @3xl:gap-y-3',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
MultipartRowGroup.displayName = 'MultipartRowGroup';

/* The edit button's wrapper: no width at rest; 24 wide with a 4 gap once the row is hovered, something in it has keyboard focus (`:focus-visible` — a mouse click
   does not hold it open), or on a touch screen where there is no hover. */
const EDIT_CLOSED = 'w-0';
const EDIT_OPEN = [
  'group-hover/row:ms-1 group-hover/row:w-6 group-hover/row:overflow-visible group-hover/row:opacity-100',
  'group-has-focus-visible/row:ms-1 group-has-focus-visible/row:w-6 group-has-focus-visible/row:overflow-visible group-has-focus-visible/row:opacity-100',
  'pointer-coarse:ms-1 pointer-coarse:w-6 pointer-coarse:overflow-visible pointer-coarse:opacity-100',
].join(' ');

/* Stacked, a cell after the title sits under it in the second column, from the left; on the grid it is its own column. */
const STACKED = 'col-start-2 justify-self-start @3xl:col-auto';

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
      onEditTitle,
      ...props
    },
    ref,
  ) => {
    const done = isPartCompleted({ completed, status });
    const dates = useDateFormat();
    /* The button that opens the part holds the title, so it is the thing that is cut: measured here, with its own tooltip. */
    const openRef = React.useRef<HTMLButtonElement | null>(null);
    const openCut = useIsTruncated(openRef, [title]);
    return (
      <li
        ref={ref}
        className={cn(
          'group/row grid list-none grid-cols-[1.5rem_1fr] items-center gap-x-4 gap-y-3 rounded-sm border border-stroke-default bg-surface-elevated px-4 py-3 font-sans',
          'transition-colors hover:bg-surface-brand-base',
          '@3xl:col-span-full @3xl:grid-cols-subgrid @3xl:gap-y-0',
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid size-6 place-items-center rounded-full text-caption-md-semibold',
            done
              ? 'bg-accent-success-filled-surface-default text-accent-success-filled-content-default'
              : 'bg-neutral-tonal-surface-default text-neutral-tonal-content-default',
          )}
        >
          {number}
        </span>
        <div className="flex min-w-0 items-center @3xl:-ms-2">
          {onOpen ? (
            <Tooltip content={title} describe={false} disabled={!openCut} className="min-w-0 max-w-full">
              <button
                ref={openRef}
                type="button"
                onClick={onOpen}
                className={cn(
                  'min-w-0 truncate rounded-sm text-left text-body-sm-medium text-text-primary',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                )}
              >
                <span className="sr-only">Part {number}: </span>
                {title}
              </button>
            </Tooltip>
          ) : (
            <>
              <span className="sr-only">Part {number}: </span>
              <TruncatedText className="text-body-sm-medium text-text-primary">{title}</TruncatedText>
            </>
          )}
          {onEditTitle && (
            /* Takes no room until it shows: a zero-width wrapper, so the title runs to the end of its cell and is cut there; on hover, with
               keyboard focus, or on a touch screen it opens to 24 (+4 gap) and the title gives way. Always in the page, so the keyboard reaches it. */
            <span className={cn('flex shrink-0 overflow-hidden opacity-0 transition-opacity', EDIT_CLOSED, EDIT_OPEN)}>
              <IconButton
                type="button"
                variant="tonal"
                size="xs"
                icon="note-pencil"
                label={`Edit title of part ${number}`}
                onClick={onEditTitle}
              />
            </span>
          )}
        </div>
        {assignee ? (
          /* The name is read out here for a screen reader; the picture is decoration. */
          <span className={cn('flex justify-center', STACKED)}>
            <Avatar size="md" name={assignee.name} src={assignee.src} standalone />
          </span>
        ) : (
          <span aria-hidden="true" className="hidden @3xl:block" />
        )}
        <Badge size="lg" className={STACKED}>
          {capacityPoints == null ? '-' : capacityPoints} CP
        </Badge>
        <span className={cn('whitespace-nowrap text-label-sm-medium text-text-tertiary', STACKED)}>Due Date:</span>
        <DueDateTag size="md" proximity={dueProximity} className={STACKED}>
          {dueDate ? dates.format(dueDate) : '-'}
        </DueDateTag>
        <span aria-hidden="true" className="hidden w-px justify-self-center self-stretch bg-stroke-default @3xl:block" />
        <span className={cn('flex justify-end @3xl:justify-self-stretch', STACKED)}>
          {customStatus ? <StatusTag custom={customStatus} /> : status ? <StatusTag status={status} /> : null}
        </span>
      </li>
    );
  },
);
MultipartRow.displayName = 'MultipartRow';
