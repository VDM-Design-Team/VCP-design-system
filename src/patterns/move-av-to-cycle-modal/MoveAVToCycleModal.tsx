import * as React from 'react';
import { Button } from '../../atoms/button';
import { IconButton } from '../../atoms/icon-button';
import { Select } from '../../atoms/select';
import {
  AssigneeSelectionDropdown,
  type AssigneeOption,
} from '../../components/assignee-selection-dropdown';
import { formatCycleRange } from '../../components/cycle-tag';
import { DateField } from '../../components/date-field';
import { Field } from '../../components/field';
import { Modal } from '../../components/modal';
import { SearchSelect } from '../../components/search-select';

/**
 * MoveAVToCycleModal — the dialog a Backlog row opens when it is dropped on a Cycle without what the Cycle
 * needs: an assignee, a due date, capacity points. Built to Figma's `Add_Required_Details_Planning_List`
 * (`6585:120063`) and the Assignee Availability flows (*Possible ways to fill in the modal*, *Drag and Drop
 * Opens Modal*).
 *
 * **Naming.** Named for what it does, like `HandoffAVModal` and `AcceptPendingAVModal`: moving an Added Value into a
 * Cycle. It was first `AddRequiredDetailsModal`, after Figma's component and the dialog's title — which is
 * still "Add Required Details" on screen. Search for either name to find it.
 *
 * - **Assignee** (repeatable, the "+" beside its label): a person from `AssigneeSelectionDropdown` — so their
 *   availability for the dates below is on every row — a role, and capacity points, with a ⊖ to remove the
 *   row.
 * - **Start Date, Due Date, Cycle, Capacity Points.**
 * - **Cancel** (secondary) and **Confirm** (primary).
 *
 * **Dates the system calculates.** Give it `estimate` and it fills Start and Due Date for you: whenever the
 * assignees, points or cycle change it asks `estimate(draft)` and writes the answer into any date a person
 * has not set — shown "(est.)". A date you pick yourself stops being estimated, and is never overwritten.
 * (The flow: filling the assignee estimates the due date; editing the estimated start date by hand changes
 * nothing yet; adding an assignee recalculates the due date.) The calculation itself is the caller's.
 *
 * **Availability follows the dates.** Until Start and Due Date are both set the dropdown is in its
 * *unknown* state; once they are, each person is Available, Busy or Unavailable for them (`people` can be a
 * function of the draft). **Unavailable people cannot be picked**, and if the dates move under a person
 * already picked, the field warns (busy) or errors (unavailable) — and **Confirm will not go through with an
 * unavailable assignee**: it says so under the field and tells you through `onInvalid`, which is where the
 * product's "Unavailable Assignee" toast belongs.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface MoveAVToCycleDate {
  /** ISO `yyyy-mm-dd`. */
  value: string;
  /** Calculated, not set by a person. */
  estimated?: boolean;
}

interface AssigneeRowDraft {
  id: string;
  person: string;
  role: string;
  points: string;
}

/** What is on screen — handed to `estimate`, and to `people` when that is a function. */
export interface MoveAVToCycleDraft {
  assignees: ReadonlyArray<{ person: string; role: string; points: number | undefined }>;
  start?: MoveAVToCycleDate;
  due?: MoveAVToCycleDate;
  cycle?: string;
  points?: number;
}

export interface MoveAVToCycleResult {
  assignees: Array<{ person: string; role: string; points: number | undefined }>;
  start?: MoveAVToCycleDate;
  due?: MoveAVToCycleDate;
  cycle?: string;
  points: number;
}

/** Why Confirm did not go through. */
export type MoveAVToCycleInvalid = 'unavailable-assignee' | 'missing-details';

export interface MoveAVToCycleModalProps {
  open: boolean;
  /** Asked to close: Escape, ✕, Cancel, a backdrop click. */
  onClose: () => void;
  /** The details, once, when they are complete and no assignee is unavailable. You own `open`. */
  onConfirm: (details: MoveAVToCycleResult) => void;
  /** Confirm was pressed and could not go through. Where the "Unavailable Assignee" toast belongs. */
  onInvalid?: (reason: MoveAVToCycleInvalid) => void;
  /** Who can be assigned. A function gets the draft, so availability can follow the dates. */
  people: ReadonlyArray<AssigneeOption> | ((draft: MoveAVToCycleDraft) => ReadonlyArray<AssigneeOption>);
  /**
   * The cycles on offer: `{ value, code, start, end }` (dates ISO). A cycle reads "C36 (Mar 02, 2026 - Mar 23, 2026)" —
   * `CycleTag`'s own form, from `formatCycleRange` — in the field and in the rows, where the code is bold.
   */
  cycles: ReadonlyArray<{ value: string; code: string; start: string; end: string }>;
  /** The roles an assignee can take. */
  roles?: readonly string[];
  /** The capacity scale for an assignee's points and the AV's. */
  pointOptions?: readonly number[];
  /** What is known when the dialog opens — a Backlog row's own dates, say. */
  initial?: { start?: MoveAVToCycleDate; due?: MoveAVToCycleDate; cycle?: string; points?: number };
  /**
   * Calculates the dates the user has not set. Called on every change to the assignees, points or cycle; return
   * the ISO dates you can work out. Whatever it returns is shown "(est.)" in a date a person has not touched.
   */
  estimate?: (draft: MoveAVToCycleDraft) => { start?: string; due?: string };
  /** Spins Confirm while the move is in flight. */
  loading?: boolean;
}

const DEFAULT_ROLES = ['Assignee', 'QA', 'Design'] as const;
const DEFAULT_POINTS = [0, 1, 2, 3, 5, 8, 13] as const;

let rowCounter = 0;
const newRow = (role: string): AssigneeRowDraft => ({ id: `row-${(rowCounter += 1)}`, person: '', role, points: '' });
const asNumber = (v: string) => (v === '' ? undefined : Number(v));

export function MoveAVToCycleModal({
  open,
  onClose,
  onConfirm,
  onInvalid,
  people,
  cycles,
  roles = DEFAULT_ROLES,
  pointOptions = DEFAULT_POINTS,
  initial,
  estimate,
  loading,
}: MoveAVToCycleModalProps) {
  const [rows, setRows] = React.useState<AssigneeRowDraft[]>([]);
  const [start, setStart] = React.useState<MoveAVToCycleDate | undefined>(initial?.start);
  const [due, setDue] = React.useState<MoveAVToCycleDate | undefined>(initial?.due);
  const [cycle, setCycle] = React.useState(initial?.cycle ?? '');
  const [points, setPoints] = React.useState(initial?.points === undefined ? '' : String(initial.points));
  const [errors, setErrors] = React.useState<{ assignee?: string; due?: string; points?: string }>({});

  /* A fresh dialog every time it opens, from what is known. */
  React.useEffect(() => {
    if (!open) return;
    setRows([newRow(roles[0] ?? 'Assignee')]);
    setStart(initial?.start);
    setDue(initial?.due);
    setCycle(initial?.cycle ?? '');
    setPoints(initial?.points === undefined ? '' : String(initial.points));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const draft: MoveAVToCycleDraft = {
    assignees: rows.filter((r) => r.person).map((r) => ({ person: r.person, role: r.role, points: asNumber(r.points) })),
    start,
    due,
    cycle: cycle || undefined,
    points: asNumber(points),
  };

  /* The dates the system works out, into any date a person has not set. A date they pick is theirs. */
  const draftKey = JSON.stringify([draft.assignees, draft.cycle, draft.points]);
  React.useEffect(() => {
    if (!open || !estimate) return;
    const next = estimate(draft);
    if (next.start && (!start || start.estimated) && start?.value !== next.start) {
      setStart({ value: next.start, estimated: true });
    }
    if (next.due && (!due || due.estimated) && due?.value !== next.due) {
      setDue({ value: next.due, estimated: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draftKey, start, due]);

  const everyone = typeof people === 'function' ? people(draft) : people;
  const availabilityKnown = !!(start && due);
  const byValue = new Map(everyone.map((p) => [p.value, p]));

  const patchRow = (id: string, change: Partial<AssigneeRowDraft>) =>
    setRows((now) => now.map((r) => (r.id === id ? { ...r, ...change } : r)));

  const submit = () => {
    const chosen = rows.filter((r) => r.person);
    const next: typeof errors = {};
    if (chosen.length === 0) next.assignee = 'Add at least one assignee.';
    if (!due) next.due = 'Add a due date.';
    if (points === '') next.points = 'Add capacity points.';
    const unavailable =
      availabilityKnown && chosen.some((r) => byValue.get(r.person)?.availability === 'unavailable');
    if (unavailable) next.assignee = 'A selected assignee is unavailable during these dates. Change the dates or remove them.';
    setErrors(next);
    if (unavailable) return onInvalid?.('unavailable-assignee');
    if (Object.keys(next).length) return onInvalid?.('missing-details');
    onConfirm({
      assignees: [...draft.assignees],
      start,
      due,
      cycle: cycle || undefined,
      points: Number(points),
    });
  };

  const pointChoices = pointOptions.map(String);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Required Details"
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="button" loading={loading} onClick={submit}>
            Confirm
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <Field
          label="Assignee"
          onAdd={() => setRows((now) => [...now, newRow(roles[0] ?? 'Assignee')])}
          addLabel="Add assignee"
          error={errors.assignee}
        >
          {() => (
            <div className="flex flex-col gap-3">
              {rows.map((row, i) => (
                <div key={row.id} className="flex items-start gap-2">
                  <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                    <AssigneeSelectionDropdown
                      fullWidth
                      people={everyone}
                      availabilityKnown={availabilityKnown}
                      value={row.person}
                      onChange={(person) => patchRow(row.id, { person })}
                      aria-label={`Assignee ${i + 1}`}
                      placeholder="Select an assignee"
                    />
                    <Select
                      aria-label={`Role for assignee ${i + 1}`}
                      value={row.role}
                      options={[...roles]}
                      onChange={(role) => patchRow(row.id, { role })}
                    />
                    <Select
                      className="col-span-2"
                      aria-label={`Capacity points for assignee ${i + 1}`}
                      placeholder="-"
                      value={row.points}
                      options={pointChoices}
                      onChange={(p) => patchRow(row.id, { points: p })}
                    />
                  </div>
                  {rows.length > 1 && (
                    <IconButton
                      icon="minus-circle"
                      label={`Remove assignee ${i + 1}`}
                      onClick={() => setRows((now) => now.filter((r) => r.id !== row.id))}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </Field>

        <Field label="Start Date">
          {(c) => (
            <DateField
              {...c}
              value={start?.value}
              estimated={start?.estimated}
              onChange={(iso) => setStart({ value: iso })}
            />
          )}
        </Field>

        <Field label="Due Date" error={errors.due}>
          {(c) => (
            <DateField
              {...c}
              value={due?.value}
              estimated={due?.estimated}
              onChange={(iso) => setDue({ value: iso })}
            />
          )}
        </Field>

        <Field label="Cycle">
          <SearchSelect
            fullWidth
            aria-label="Cycle"
            placeholder="Select a cycle"
            searchPlaceholder="Search cycles"
            value={cycle}
            options={cycles.map((c) => ({
              value: c.value,
              label: `${c.code} (${formatCycleRange(c.start, c.end)})`,
            }))}
            renderOption={(option) => {
              const c = cycles.find((x) => x.value === option.value);
              return c ? (
                <span className="truncate">
                  <strong className="text-label-sm-semibold">{c.code}</strong> ({formatCycleRange(c.start, c.end)})
                </span>
              ) : (
                option.label
              );
            }}
            onChange={setCycle}
          />
        </Field>

        <Field label="Capacity Points" error={errors.points}>
          <Select fullWidth placeholder="-" value={points} options={pointChoices} onChange={setPoints} />
        </Field>
      </div>
    </Modal>
  );
}
MoveAVToCycleModal.displayName = 'MoveAVToCycleModal';
