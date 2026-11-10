# HolidayModal *(pattern)*

Adding a holiday to the registry, or changing one: **Holiday Name**, **Recurring Yearly** (a switch with an ⓘ), the **Date** (a period, picked on a two-month calendar and applied) and the **Holiday Type**, then **Add** (or **Save**).
Built to Figma's `Holiday_Registry_Modal` (`6169:75761`) and the Admin Actions frames: adding, editing, the tooltip with the date picker, and the version with errors.

## Composed of

| Piece | Tier |
|---|---|
| `Input` | atom |
| `Toggle` | atom |
| `DateField` | component |
| `Field` | component |
| `HolidayTypeTag` | component |
| `InfoHint` | component |
| `Modal` | component |
| `SearchSelect` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `HolidayModal` | Adding or editing one registry entry |
| `ConfirmDeleteModal` | Removing one. The design draws "Remove Manual Holiday Entry?" as a "(Future)" popup, so until it is designed the page confirms with `ConfirmDeleteModal` (the `OnThePage` story does) |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | |
| `holiday` | `HolidayDraft` | — | Pass it to **edit**: "Edit Holiday", filled, **Save**. Omit to add: "Add Holiday", empty, Recurring Yearly on, **Add** |
| `onSubmit` | `(draft) => void` | required | Once, with `{ name, recurring, start, end, type }` (ISO dates; a single day has `end === start`) |
| `loading` | `boolean` | `false` | Add / Save spins, and **nothing closes the dialog until it is done**: Escape, ✕ and the backdrop stand down (`Modal`'s `busy`) |

## Behaviour

- **Checked on Add or Save**: "Enter the holiday’s name", "Select a date", "Select a holiday type", each under its field in red with the edge turning red. The first to fail takes focus; a message clears when its field changes.
- **The Date is a range**: two clicks, then **Apply** (one day and Apply is a period of one); **Clear** empties it.
- It resets each time it opens, and does nothing itself — saving and closing are the page's.

## Tokens

`Modal` (`md`) with its ✕; the answer is `ModalConfirm` (40 high; the form's id is `useId`, so two dialogs never share one); the ⓘ is `InfoHint`, the system's 16 info icon (a 40 press area). No new tokens.

## Accessibility

- A form in a dialog; the switch is named by its visible label ("Recurring Yearly") and the ⓘ is a real button ("About Recurring Yearly", `InfoHint`) whose tooltip also opens on focus.
- Errors are announced with their field and not by colour alone.

## Don't

- **Don't validate on blur or as it is typed** — the design checks when Add or Save is pressed.
- **Don't close it yourself on a failed save**; keep it open with the draft.
