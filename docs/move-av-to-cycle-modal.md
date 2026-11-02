# MoveAVToCycleModal

> **Also known as** `AddRequiredDetailsModal` — its first name, taken from Figma's `Add_Required_Details_Planning_List` and the title
> on screen ("Add Required Details"). Renamed to match the other dialogs (`HandoffAVModal`, `AcceptPendingAVModal`: the action, then the
> Added Value); search for either name.

The dialog a Backlog row opens when it is dropped on a Cycle without what the Cycle needs: an assignee, a due date, capacity
points. Built to Figma's `Add_Required_Details_Planning_List` (`6585:120063`) and the Assignee Availability flows.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `IconButton` | atom |
| `Select` | atom |
| `AssigneeSelectionDropdown` | component |
| `DateField` | component |
| `Field` | component |
| `Modal` | component |
| `SearchSelect` | component |
| `CycleTag` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MoveAVToCycleModal` | The step between a drop on a Cycle (`PlanningTable`'s `onMoveRow`) and the move happening |
| `ConfirmDeleteAVModal` / `Modal` | Other dialogs |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | | required | You own `open` |
| `onConfirm` | `(details) => void` | required | `{ assignees: [{ person, role, points }], start?, due?, cycle?, points }` — only when complete and no assignee is unavailable |
| `onInvalid` | `(reason) => void` | — | `'missing-details'` or `'unavailable-assignee'`: Confirm did not go through. Where the product's "Unavailable Assignee" toast belongs |
| `people` | `AssigneeOption[] \| (draft) => AssigneeOption[]` | required | A function gets the draft, so availability can follow the dates |
| `cycles` | `{ value, code, start, end }[]` | required | Dates ISO. Picked in a `SearchSelect`. A cycle reads "C36 (Mar 02, 2026 - Mar 23, 2026)" — `CycleTag`'s own form, from `formatCycleRange` — in the field and in the rows, where the code is bold |
| `roles` | `string[]` | `Assignee, QA, Design` | |
| `pointOptions` | `number[]` | `0, 1, 2, 3, 5, 8, 13` | The capacity scale, for an assignee's points and the AV's |
| `initial` | `{ start?, due?, cycle?, points? }` | — | What is known on open, e.g. a Backlog row's own dates. `start` / `due` are `{ value, estimated? }` |
| `estimate` | `(draft) => { start?, due? }` | — | Calculates the dates a person has not set — see below |
| `loading` | `boolean` | `false` | Spins Confirm |

## The flow

1. **Missing everything** — an estimated Start Date, a blank Due Date, no assignee, no points.
2. **The user fills in an assignee (with a role and points)** — `estimate` runs, and the Due Date appears "(est.)".
3. **The user edits the estimated Start Date by hand** — it becomes theirs (no "(est.)"); nothing else changes yet.
4. **The user adds another assignee** — `estimate` runs again and the still-estimated Due Date is recalculated. A date a person
   set is never overwritten.

`estimate` is called on every change to the assignees, points or cycle; return the ISO dates you can work out. The calculation
is the caller's — this dialog only shows it and keeps it out of dates a person owns.

## Availability

Until Start and Due Date are both set the assignee dropdown is in its *unknown* state (anyone can be picked). Once they are, each
person is Available, Busy or Unavailable for them (`docs/assignee-selection-dropdown.md`): unavailable people cannot be picked, and
if the dates move under a person already picked, the field warns (busy) or errors (unavailable). **Confirm will not go through with
an unavailable assignee** — it says so under the field and calls `onInvalid('unavailable-assignee')`.

## Accessibility

- A `Modal` (focus trap, Escape, focus returns to where it opened). Every control is named: "Assignee 1", "Role for assignee 1",
  "Capacity points for assignee 1", the date fields by their labels.
- The "+" beside Assignee is "Add assignee"; each extra row has "Remove assignee N" (the first row cannot be removed).
- Errors appear under their field and are announced with it.

## Don't

- **Don't calculate dates here.** Pass `estimate`; the working-days-plus-buffer rule is the product's.
- **Don't close the dialog yourself on `onInvalid`** — the user needs to fix it.
