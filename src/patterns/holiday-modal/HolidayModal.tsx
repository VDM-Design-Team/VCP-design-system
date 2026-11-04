import * as React from 'react';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Toggle } from '../../atoms/toggle';
import { Tooltip } from '../../atoms/tooltip';
import { DateField } from '../../components/date-field';
import { Field } from '../../components/field';
import { HOLIDAY_TYPES, holidayTypeLabel, type HolidayType } from '../../components/holiday-type-tag';
import { Modal } from '../../components/modal';
import { SearchSelect } from '../../components/search-select';
import { formatDayMonthYear } from '../../lib/format-date';

/**
 * HolidayModal — adding a holiday to the registry, or changing one: **Holiday Name**, **Recurring Yearly** (a switch, with an ⓘ that says what it does), the **Date** (a period, picked on
 * a two-month calendar and applied) and the **Holiday Type**, then **Add** (or **Save**). Built to Figma's `Holiday_Registry_Modal` (`6169:75761`) and the Admin Actions frames — adding,
 * editing, the tooltip with the date picker, and the version with errors.
 *
 * - **Add or edit is whether you pass `holiday`.** Without it the dialog is "Add Holiday", starts empty (Recurring Yearly on, as Figma draws it) and its button says **Add**; with it,
 *   "Edit Holiday", filled, **Save**.
 * - **Checked when Add or Save is pressed**, with each message under its field in red and the field's edge turning red: "Enter the holiday's name", "Select a date", "Select a holiday
 *   type". The first one that fails takes focus. A message clears when its field changes.
 * - **A single day is a period of one**: pick the same day twice, or one day and Apply.
 * - **It owns the draft** and reports it once through `onSubmit`; what saving does, and closing afterwards, is the page's. Everything resets each time it opens.
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
}

export interface HolidayModalProps {
  open: boolean;
  onClose: () => void;
  /** The holiday being changed. Omit it to add one. */
  holiday?: HolidayDraft;
  onSubmit: (draft: HolidayDraft) => void;
  /** Saving is in flight: the button spins and Close locks. */
  loading?: boolean;
}

const NAME_ERROR = 'Enter the holiday’s name';
const DATE_ERROR = 'Select a date';
const TYPE_ERROR = 'Select a holiday type';

const EMPTY = { name: '', recurring: true, start: '', end: '', type: '' as HolidayType | '' };

export function HolidayModal({ open, onClose, holiday, onSubmit, loading }: HolidayModalProps) {
  const editing = Boolean(holiday);
  const [draft, setDraft] = React.useState(EMPTY);
  const [errors, setErrors] = React.useState<{ name?: string; date?: string; type?: string }>({});
  const nameRef = React.useRef<HTMLInputElement>(null);
  const dateRef = React.useRef<HTMLInputElement>(null);
  const typeRef = React.useRef<HTMLDivElement>(null);
  const recurringLabel = React.useId();

  /* Each time it opens: the holiday being changed, or an empty one. */
  React.useEffect(() => {
    if (!open) return;
    setDraft(holiday ? { name: holiday.name, recurring: holiday.recurring, start: holiday.start, end: holiday.end, type: holiday.type } : EMPTY);
    setErrors({});
    /* On open only. */
  }, [open]); // eslint-disable-line

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = {
      name: draft.name.trim() ? undefined : NAME_ERROR,
      date: draft.start && draft.end ? undefined : DATE_ERROR,
      type: draft.type ? undefined : TYPE_ERROR,
    };
    setErrors(next);
    if (next.name) return nameRef.current?.focus();
    if (next.date) return dateRef.current?.focus();
    if (next.type) return typeRef.current?.querySelector('button')?.focus();
    onSubmit({ name: draft.name.trim(), recurring: draft.recurring, start: draft.start, end: draft.end, type: draft.type as HolidayType });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Holiday' : 'Add Holiday'}
      size="md"
      footer={
        <Button type="submit" form="holiday-modal-form" size="sm" loading={loading}>
          {editing ? 'Save' : 'Add'}
        </Button>
      }
    >
      <form id="holiday-modal-form" noValidate className="flex flex-col gap-6" onSubmit={submit}>
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
            <Tooltip content="Repeat this holiday every year, or keep it as a one-time event." placement="bottom">
              <button
                type="button"
                aria-label="About Recurring Yearly"
                className="grid size-4 place-items-center rounded-sm text-text-tertiary hover:text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
              >
                <Icon name="info" size="sm" aria-hidden="true" />
              </button>
            </Tooltip>
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
              formatDate={formatDayMonthYear}
              onRangeChange={(start, end) => {
                setDraft({ ...draft, start, end: end ?? '' });
                setErrors({ ...errors, date: undefined });
              }}
            />
          )}
        </Field>

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
              setDraft({ ...draft, type: type as HolidayType });
              setErrors({ ...errors, type: undefined });
            }}
          />
        </Field>
      </form>
    </Modal>
  );
}
