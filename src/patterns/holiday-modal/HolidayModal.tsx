import * as React from 'react';
import { Input } from '../../atoms/input';
import { Toggle } from '../../atoms/toggle';
import { DateField } from '../../components/date-field';
import { Field } from '../../components/field';
import { HOLIDAY_TYPES, holidayTypeLabel, type HolidayType } from '../../components/holiday-type-tag';
import { InfoHint } from '../../components/info-hint';
import { Modal, ModalConfirm } from '../../components/modal';
import { SearchSelect, type SearchSelectOption } from '../../components/search-select';

/**
 * HolidayModal — adding a holiday to the registry, or changing one: **Holiday Name**, **Recurring Yearly** (a switch, with an ⓘ that says what it does), the **Date** (a period, picked on
 * a two-month calendar and applied), **All Day** (a switch; off, it asks **From** and **To**), the **Holiday Type** and, for a team or an individual holiday, who it **Applies to**, then **Add** (or **Save**). Built to Figma's `Holiday_Registry_Modal` (`6169:75761`) and the Admin Actions frames — adding,
 * editing, the tooltip with the date picker, and the version with errors.
 *
 * - **Add or edit is whether you pass `holiday`.** Without it the dialog is "Add Holiday", starts empty (Recurring Yearly on, as Figma draws it) and its button says **Add**; with it,
 *   "Edit Holiday", filled, **Save**.
 * - **Checked when Add or Save is pressed**, with each message under its field in red and the field's edge turning red: "Enter the holiday's name", "Select a date", "Select a holiday
 *   type". The first one that fails takes focus. A message clears when its field changes.
 * - **A single day is a period of one**: pick the same day twice, or one day and Apply.
 * - **It owns the draft** and reports it once through `onSubmit`; what saving does, and closing afterwards, is the page's. Everything resets each time it opens.
 * - **While saving, nothing closes it**: the answer is `ModalConfirm`, so Escape, ✕ and the backdrop stand down until `loading` ends (`Modal`'s `busy`).
 * - **All Day** is a switch after the Date, on to start (it sets what the table's All Day column shows; it is not in the Figma frame). Off, **From** and **To** appear and both are required
 *   ("Enter a start time", "Enter an end time"); for a one-day holiday To must be after From ("End time must be after the start time"). Turning it back on drops the times.
 * - **Applies to follows the type** (it sets the table's Applies to column; not in the Figma frame either). A **Team** holiday picks teams (`teams`), an **Individual** one picks people
 *   (`people`), several of either, and it is required ("Select who it applies to"). A **Public** holiday is everyone's: no field, and `appliesTo` is `[]`. Changing the type clears what was picked.
 * - **A failed Add or Save looks in the order the fields are drawn**: name, date, From, To, type, Applies to. The first that failed takes focus.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface HolidayDraft {
  name: string;
  /** Repeats every year (true) or happens once. */
  recurring: boolean;
  /** ISO start. */
  start: string;
  /** ISO end — the same as `start` for one day. */
  end: string;
  type: HolidayType;
  /** Who it applies to: the `value`s picked from `teams` (a Team holiday) or from `people` (an Individual one). `[]` for a Public holiday, which is everyone's. */
  appliesTo: string[];
  /** The whole day (true), or part of it: then `from` and `to` say which part. */
  allDay: boolean;
  /** When `allDay` is off: the start time, 24-hour "HH:mm". Absent when it is on. */
  from?: string;
  /** When `allDay` is off: the end time, 24-hour "HH:mm". Absent when it is on. */
  to?: string;
}

export interface HolidayModalProps {
  open: boolean;
  onClose: () => void;
  /** The holiday being changed. Omit it to add one. */
  holiday?: HolidayDraft;
  onSubmit: (draft: HolidayDraft) => void;
  /** The teams a **Team** holiday can apply to. */
  teams?: readonly SearchSelectOption[];
  /** The people an **Individual** holiday can apply to (a `src` on one is its photo). */
  people?: readonly SearchSelectOption[];
  /** Saving is in flight: the button spins and nothing closes the dialog (Escape, ✕ and the backdrop stand down) until it is done. */
  loading?: boolean;
}

const NAME_ERROR = 'Enter the holiday’s name';
const DATE_ERROR = 'Select a date';
const TYPE_ERROR = 'Select a holiday type';
const FROM_ERROR = 'Enter a start time';
const TO_ERROR = 'Enter an end time';
const ORDER_ERROR = 'End time must be after the start time';
const APPLIES_TO_ERROR = 'Select who it applies to';

const EMPTY = { name: '', recurring: true, start: '', end: '', type: '' as HolidayType | '', appliesTo: [] as string[], allDay: true, from: '', to: '' };

export function HolidayModal({ open, onClose, holiday, onSubmit, teams, people, loading }: HolidayModalProps) {
  const editing = Boolean(holiday);
  const [draft, setDraft] = React.useState(EMPTY);
  const [errors, setErrors] = React.useState<{ name?: string; date?: string; from?: string; to?: string; type?: string; appliesTo?: string }>({});
  const nameRef = React.useRef<HTMLInputElement>(null);
  const dateRef = React.useRef<HTMLInputElement>(null);
  const fromRef = React.useRef<HTMLInputElement>(null);
  const toRef = React.useRef<HTMLInputElement>(null);
  const typeRef = React.useRef<HTMLDivElement>(null);
  const appliesToRef = React.useRef<HTMLDivElement>(null);
  const recurringLabel = React.useId();
  const allDayLabel = React.useId();
  const formId = React.useId();

  /* Public is everyone's; a team or an individual holiday says who. */
  const who =
    draft.type === 'team'
      ? { options: teams ?? [], placeholder: 'Select Teams', rows: 'text' as const }
      : draft.type === 'individual'
        ? { options: people ?? [], placeholder: 'Select People', rows: 'avatar' as const }
        : null;

  /* Each time it opens: the holiday being changed, or an empty one. */
  React.useEffect(() => {
    if (!open) return;
    setDraft(
      holiday
        ? {
            name: holiday.name,
            recurring: holiday.recurring,
            start: holiday.start,
            end: holiday.end,
            type: holiday.type,
            appliesTo: holiday.type === 'public' ? [] : [...holiday.appliesTo],
            allDay: holiday.allDay,
            /* An all-day holiday has no times. */
            from: holiday.allDay ? '' : (holiday.from ?? ''),
            to: holiday.allDay ? '' : (holiday.to ?? ''),
          }
        : EMPTY,
    );
    setErrors({});
    /* On open only. */
  }, [open]); // eslint-disable-line

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const oneDay = draft.start !== '' && draft.start === draft.end;
    const next = {
      name: draft.name.trim() ? undefined : NAME_ERROR,
      date: draft.start && draft.end ? undefined : DATE_ERROR,
      from: draft.allDay || draft.from ? undefined : FROM_ERROR,
      /* "HH:mm" compares as text. Over several days the end may be earlier in the day than the start. */
      to: draft.allDay ? undefined : !draft.to ? TO_ERROR : oneDay && draft.from && draft.to <= draft.from ? ORDER_ERROR : undefined,
      type: draft.type ? undefined : TYPE_ERROR,
      appliesTo: who && draft.appliesTo.length === 0 ? APPLIES_TO_ERROR : undefined,
    };
    setErrors(next);
    /* The first that failed takes focus, in the order they are drawn. */
    if (next.name) return nameRef.current?.focus();
    if (next.date) return dateRef.current?.focus();
    if (next.from) return fromRef.current?.focus();
    if (next.to) return toRef.current?.focus();
    if (next.type) return typeRef.current?.querySelector('button')?.focus();
    if (next.appliesTo) return appliesToRef.current?.querySelector('button')?.focus();
    onSubmit({
      name: draft.name.trim(),
      recurring: draft.recurring,
      start: draft.start,
      end: draft.end,
      type: draft.type as HolidayType,
      appliesTo: who ? draft.appliesTo : [],
      allDay: draft.allDay,
      ...(draft.allDay ? {} : { from: draft.from, to: draft.to }),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Holiday' : 'Add Holiday'}
      size="md"
      footer={
        <ModalConfirm type="submit" form={formId} loading={loading}>
          {editing ? 'Save' : 'Add'}
        </ModalConfirm>
      }
    >
      <form id={formId} noValidate className="flex flex-col gap-6" onSubmit={submit}>
        <Field label="Holiday Name" error={errors.name}>
          <Input
            ref={nameRef}
            fullWidth
            autoComplete="off"
            placeholder="Enter Holiday Name"
            value={draft.name}
            onChange={(event) => {
              setDraft({ ...draft, name: event.target.value });
              setErrors({ ...errors, name: undefined });
            }}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-label-sm-medium text-text-primary">
            <span id={recurringLabel}>Recurring Yearly</span>
            <InfoHint label="Recurring Yearly" content="Repeat this holiday every year, or keep it as a one-time event." />
          </span>
          <Toggle aria-labelledby={recurringLabel} checked={draft.recurring} onChange={(recurring) => setDraft({ ...draft, recurring })} />
        </div>

        <Field label="Date" error={errors.date}>
          {(c) => (
            <DateField
              {...c}
              ref={dateRef}
              mode="range"
              placeholder="Select period"
              value={draft.start || undefined}
              rangeEnd={draft.end || undefined}
              onRangeChange={(start, end) => {
                setDraft({ ...draft, start, end: end ?? '' });
                setErrors({ ...errors, date: undefined });
              }}
            />
          )}
        </Field>

        <div className="flex flex-col gap-2">
          <span id={allDayLabel} className="text-label-sm-medium text-text-primary">
            All Day
          </span>
          <Toggle
            aria-labelledby={allDayLabel}
            checked={draft.allDay}
            onChange={(allDay) => {
              /* Back on, the times are dropped: an all-day holiday has none. */
              setDraft(allDay ? { ...draft, allDay, from: '', to: '' } : { ...draft, allDay });
              setErrors({ ...errors, from: undefined, to: undefined });
            }}
          />
        </div>

        {!draft.allDay && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="From" error={errors.from}>
              <Input
                ref={fromRef}
                type="time"
                fullWidth
                value={draft.from}
                onChange={(event) => {
                  setDraft({ ...draft, from: event.target.value });
                  /* A new start may put right an end that was not after it, so that message goes too. */
                  setErrors({ ...errors, from: undefined, to: errors.to === ORDER_ERROR ? undefined : errors.to });
                }}
              />
            </Field>
            <Field label="To" error={errors.to}>
              <Input
                ref={toRef}
                type="time"
                fullWidth
                value={draft.to}
                onChange={(event) => {
                  setDraft({ ...draft, to: event.target.value });
                  setErrors({ ...errors, to: undefined });
                }}
              />
            </Field>
          </div>
        )}

        <Field label="Holiday Type" error={errors.type}>
          <SearchSelect
            ref={typeRef}
            fullWidth
            searchable={false}
            placeholder="Select Holiday Type"
            /* The list says "Public Holiday"; the field, once chosen, says "Public" (Figma's two states). */
            options={HOLIDAY_TYPES.map((type) => ({ value: type, label: `${holidayTypeLabel(type)} Holiday`, shortLabel: holidayTypeLabel(type) }))}
            value={draft.type}
            onChange={(type) => {
              /* Teams are not people: another type starts with nobody picked. */
              setDraft({ ...draft, type: type as HolidayType, appliesTo: type === draft.type ? draft.appliesTo : [] });
              setErrors({ ...errors, type: undefined, appliesTo: undefined });
            }}
          />
        </Field>

        {who && (
          <Field label="Applies to" error={errors.appliesTo}>
            <SearchSelect
              /* A fresh list, search and all, when the type changes. */
              key={draft.type}
              ref={appliesToRef}
              fullWidth
              multiple
              rows={who.rows}
              placeholder={who.placeholder}
              options={who.options}
              value={draft.appliesTo}
              onChange={(appliesTo) => {
                setDraft({ ...draft, appliesTo });
                setErrors({ ...errors, appliesTo: undefined });
              }}
            />
          </Field>
        )}
      </form>
    </Modal>
  );
}
