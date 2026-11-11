# HolidayModal *(pattern)*

Adding a holiday to the registry, or changing one: **Holiday Name**, **Recurring Yearly** (a switch with an ⓘ), the **Date** (a period, picked on a two-month calendar and applied), **All Day** (a switch; off, it asks **From** and **To**), the **Holiday Type** and, for a team or an individual holiday, who it **Applies to**, then **Add** (or **Save**).
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
| `onSubmit` | `(draft) => void` | required | Once, with `{ name, recurring, start, end, type }` (ISO dates; a single day has `end === start`), plus `appliesTo`, `allDay` and, for a partial day, `from` and `to` (see `HolidayDraft` below) |
| `teams` | `SearchSelectOption[]` | — | What a **Team** holiday can apply to. Needed for Team holidays: Applies to is required |
| `people` | `SearchSelectOption[]` | — | Who an **Individual** holiday can apply to (a `src` on one is its photo). Needed for Individual holidays |
| `loading` | `boolean` | `false` | Add / Save spins, and **nothing closes the dialog until it is done**: Escape, ✕ and the backdrop stand down (`Modal`'s `busy`) |

### `HolidayDraft`

What `onSubmit` reports, and what `holiday` takes to edit one.

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | Trimmed |
| `recurring` | `boolean` | Yearly, or one-time |
| `start` / `end` | `string` | ISO `yyyy-mm-dd`. A single day has `end === start` |
| `type` | `'public' \| 'team' \| 'individual'` | |
| `appliesTo` | `string[]` | The `value`s picked: from `teams` for a Team holiday, from `people` for an Individual one. `[]` for a Public holiday, which is everyone's |
| `allDay` | `boolean` | The whole day, or part of it |
| `from` / `to` | `string` | Only when `allDay` is `false`: 24-hour "HH:mm" ("09:00", "17:30"). Absent when it is `true` |

## Behaviour

- **Checked on Add or Save**: "Enter the holiday’s name", "Select a date", "Select a holiday type", each under its field in red with the edge turning red. The first to fail takes focus; a message clears when its field changes.
- **The Date is a range**: two clicks, then **Apply** (one day and Apply is a period of one); **Clear** empties it.
- It resets each time it opens, and does nothing itself — saving and closing are the page's.
- **All Day** is a switch after the Date, on to start. Off, **From** and **To** appear side by side and both are required ("Enter a start time", "Enter an end time"). For a one-day holiday To must be after From ("End time must be after the start time"); over several days the end may be earlier in the day than the start. Turning All Day back on drops the times.
- **Applies to follows the type**, after Holiday Type. **Team** picks teams, **Individual** picks people (with their avatars), several of either, and it is required ("Select who it applies to"). **Public** is everyone's: no field. Changing the type clears what was picked.
- **A failed Add or Save looks in the order the fields are drawn**: Holiday Name, Date, From, To, Holiday Type, Applies to. The first that failed takes focus.
- **Applying a date only applies it.** Apply and Clear in the calendar never submit the form, so a date applied after "Select a date" clears the message and the red edge, and focus returns to the Date field.
- **Editing fills everything**: pass `holiday` with its `appliesTo`, `allDay` and (for a partial day) `from` and `to`.

All Day and Applies to are not in the Figma frame: they were added so the dialog can set what the table's All Day and Applies to columns show. Times are 24-hour in the draft ("14:30"); the time fields are the browser's own (`Input type="time"`), so how they are *shown* while being typed follows the person's system.

## Tokens

`Modal` (`md`) with its ✕; the answer is `ModalConfirm` (40 high; the form's id is `useId`, so two dialogs never share one); the ⓘ is `InfoHint`, the system's 16 info icon (a 40 press area). No new tokens.

## Accessibility

- A form in a dialog; the switch is named by its visible label ("Recurring Yearly") and the ⓘ is a real button ("About Recurring Yearly", `InfoHint`) whose tooltip also opens on focus.
- Errors are announced with their field and not by colour alone.
- Every field is named by its visible label: the Date field is "Date" (never its placeholder, "Select period"), the All Day switch is "All Day", and From and To each have their own label.

## Don't

- **Don't validate on blur or as it is typed** — the design checks when Add or Save is pressed.
- **Don't close it yourself on a failed save**; keep it open with the draft.
- **Don't ask who a Public holiday applies to**: it is everyone's, and `appliesTo` is `[]`.
- **Don't keep the times of an all-day holiday**: `from` and `to` exist only when `allDay` is `false`.
- **Don't offer a Team or an Individual holiday without `teams` or `people`**: Applies to is required, so there would be nothing to pick.
