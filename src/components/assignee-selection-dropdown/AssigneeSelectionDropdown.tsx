import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import {
  AssigneeStatus,
  ASSIGNEE_STATUS_LABEL,
  type AssigneeAvailability,
} from '../../atoms/assignee-status';
import { Badge } from '../../atoms/badge';
import { Icon } from '../../atoms/icon';
import { SearchSelect, type SearchSelectSingleProps } from '../search-select';

/**
 * AssigneeSelectionDropdown — picking an assignee when availability matters.
 * Built to Figma's `Dev_Assignee_Selection_Dropdown` (`6515:65065`, types
 * *Availabilities* and *Unknown Availabilities*) and the Assignee Availability
 * flow, on `SearchSelect` — the system's dropdown, not a second one.
 *
 * - **Availabilities known** (the dates are set): people sit under three
 *   collapsible headings — *Available*, *Busy*, *Unavailable* — each with its
 *   status dot, in that order. *Busy* and *Unavailable* rows carry a date `Badge`
 *   ("May 17": when they are free again). **Unavailable people cannot be
 *   picked**: their rows are greyed and skipped by the keyboard. The default
 *   view has *Unavailable* folded, so the list opens on the people who can
 *   take the work.
 * - **Availabilities unknown** (no start date, due date or cycle yet): one plain
 *   list under a notice — "Assignee availability is unknown. Select a start date
 *   or cycle first to view availability." — and anyone can be picked, because
 *   nothing says they can't.
 * - **After the pick, the dates can still change.** The field says so itself: a
 *   person who turns out to be busy gets a warning under the field (amber
 *   border: "…but can still be assigned"), one who turns out to be unavailable
 *   gets an error (red border: "…and cannot be assigned"). The form's submit
 *   guard for that case is the page's, not this component's.
 *
 * **No search box by default**, as in the design (the list is a team's, not a directory);
 * `searchable` turns it on for a longer one. The keyboard and the ARIA are `SearchSelect`'s. The status → colour
 * and the status words come from `AssigneeStatus`, once.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface AssigneeOption {
  value: string;
  /** The person's name. */
  label: string;
  /** Photo; without one the avatar shows initials. */
  src?: string;
  availability: AssigneeAvailability;
  /** Busy or unavailable: when they are free again, as the pill reads it — "May 17". */
  until?: string;
}

export interface AssigneeSelectionDropdownProps
  extends Omit<
    SearchSelectSingleProps,
    | 'options'
    | 'rows'
    | 'renderOption'
    | 'renderGroupHeading'
    | 'collapsibleGroups'
    | 'defaultCollapsedGroups'
    | 'panelNotice'
    | 'multiple'
    | 'display'
    | 'confirm'
    | 'applyLabel'
    | 'clearLabel'
  > {
  people: ReadonlyArray<AssigneeOption>;
  /**
   * Whether the dates (or cycle) the availability is computed for are set. `false` shows the
   * unknown state: a notice and a plain list. Defaults to `true`.
   */
  availabilityKnown?: boolean;
  /** The notice in the unknown state. */
  unknownText?: string;
  /** The warning under the field when the picked person is busy. */
  busyText?: string;
  /** The error under the field when the picked person is unavailable. */
  unavailableText?: string;
}

const ORDER: AssigneeAvailability[] = ['available', 'busy', 'unavailable'];

export const AssigneeSelectionDropdown = React.forwardRef<HTMLDivElement, AssigneeSelectionDropdownProps>(
  (
    {
      people,
      availabilityKnown = true,
      unknownText = 'Assignee availability is unknown. Select a start date or cycle first to view availability.',
      busyText = 'This assignee is busy during the selected dates, but can still be assigned.',
      unavailableText = 'This assignee is not available during the selected dates and cannot be assigned.',
      value,
      error,
      warning,
      placeholder = 'Select an assignee',
      searchable = false,
      ...props
    },
    ref,
  ) => {
    const byValue = new Map(people.map((p) => [p.value, p]));
    const picked = value ? byValue.get(value) : undefined;

    /* Headings are the status words; the group name is also how rows are found. */
    const groupOf = (status: AssigneeAvailability) => ASSIGNEE_STATUS_LABEL[status];
    const statusOfGroup = (name: string) => ORDER.find((s) => groupOf(s) === name);

    const options = people.map((p) => ({
      value: p.value,
      label: p.label,
      src: p.src,
      group: availabilityKnown ? groupOf(p.availability) : undefined,
      /* Only the dates being known makes anyone unpickable. */
      disabled: availabilityKnown && p.availability === 'unavailable',
    }));
    /* Groups draw in the order first seen: put the statuses in their own order. */
    const ordered = availabilityKnown
      ? ORDER.flatMap((s) => options.filter((o) => o.group === groupOf(s)))
      : options;

    return (
      <SearchSelect
        ref={ref}
        {...props}
        searchable={searchable}
        value={value}
        placeholder={placeholder}
        options={ordered}
        collapsibleGroups={availabilityKnown}
        defaultCollapsedGroups={availabilityKnown ? [groupOf('unavailable')] : undefined}
        panelNotice={
          availabilityKnown ? undefined : (
            <span className="flex items-start gap-2">
              <Icon
                name="warning-circle-fill"
                size="sm"
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-accent-warning-outline-content-default"
              />
              <span>{unknownText}</span>
            </span>
          )
        }
        renderGroupHeading={(name) => {
          const status = statusOfGroup(name);
          return (
            <>
              {name}
              {status && <AssigneeStatus status={status} />}
            </>
          );
        }}
        renderOption={(option) => {
          const person = byValue.get(option.value);
          if (!person) return option.label;
          const unavailable = availabilityKnown && person.availability === 'unavailable';
          return (
            <>
              <Avatar
                name={person.label}
                src={person.src}
                size="sm"
                aria-hidden="true"
                className={cn(unavailable && 'opacity-60')}
              />
              <span className="min-w-0 flex-1 truncate">{person.label}</span>
              {availabilityKnown && person.until && person.availability !== 'available' && (
                <Badge size="sm" tone="neutral">
                  {person.until}
                </Badge>
              )}
            </>
          );
        }}
        error={error ?? (availabilityKnown && picked?.availability === 'unavailable' ? unavailableText : undefined)}
        warning={warning ?? (availabilityKnown && picked?.availability === 'busy' ? busyText : undefined)}
      />
    );
  },
);
AssigneeSelectionDropdown.displayName = 'AssigneeSelectionDropdown';
