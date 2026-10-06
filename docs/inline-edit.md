# InlineEdit and InlineDateEdit

Two ways to change a value in place. **`InlineEdit`**: read it, press the pen, change it
with whatever control fits — typing or choosing — then confirm or cancel.
**`InlineDateEdit`**: read the date, press the calendar, pick a day. It is the cell-sized version of an edit page
— for the one field you want to fix without leaving the table.

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |
| `DatePicker` | component |
| `Popover` | component |
| `Tooltip` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `InlineEdit` | One field in a table or list that people correct often — an owner, a points value, a date |
| An edit page or modal | Several fields at once, or a change that needs a reason or a review step |
| A plain form field | The value is *always* editable, e.g. a settings form — there is nothing to read first |

## Three kinds, one frame

| Kind | Control | Ends with | Story |
|---|---|---|---|
| **Type** | `InlineEdit` + `Input` | confirm (Enter or the check) / cancel (Escape or the x) | Inline Editing → Owner |
| **Choose** | `InlineEdit` + `Select` | confirm / cancel | Inline Editing → Points |
| **Calendar** | `InlineDateEdit` | picking a day — **no confirm**; the picker's "Cancel" closes it | Inline Editing → Due date |

The buttons are Figma's `_Planning_Table_Icon_Button` set (`5813:118401`) and its states
(`5811:118374`): 24 round tonal discs — `IconButton variant="tonal" size="xs"`, the
`neutral.tonal` surface grey at rest, darker on hover, darker again pressed, with the
icon in `neutral.tonal.content`. The pen is `note-pencil`, the date button
`calendar-blank`; the pen shows an "Edit" tooltip. **Cancel is on the left, confirm on
the right.**

A calendar has no confirm because picking a day *is* the decision; a second "are you
sure" would make it the only calendar in the product that asks. If a date change must
be reviewed first, use `InlineEdit` with a `DatePicker` as the `editor`.

```tsx
<InlineDateEdit
  label="due date"
  value={row.due}              // ISO yyyy-mm-dd, as Figma draws it
  onChange={(iso) => save(iso)}
  picker={{ min: '2026-09-01' }}
/>
```

## `InlineEdit` owns the frame, not the control

`children` is the value as it reads. `editor` is the control shown while editing —
an `Input`, a `Select`, a `DatePicker` in a popover. `InlineEdit` adds the pen, the
confirm (check) and cancel (x) buttons, the keys and the focus handling around it,
so every editable cell behaves the same however different its control is.

It never holds the draft. The caller does, because only the caller knows what
"valid" and "saved" mean. `onConfirm` is where you commit it; `onCancel` is where
you throw it away.

```tsx
<InlineEdit
  label="owner"
  onConfirm={() => save(draft)}
  onCancel={() => setDraft(row.owner)}
  editor={<Input aria-label="Owner" value={draft} onChange={(e) => setDraft(e.target.value)} />}
>
  {row.owner}
</InlineEdit>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `ReactNode` | required | The value as it reads |
| `editor` | `ReactNode` | required | The control while editing. The caller owns its draft |
| `label` | `string` | required | What is being edited — names the pen: "Edit owner" |
| `editing` / `defaultEditing` / `onEditingChange` | | uncontrolled, closed | Controlled or not |
| `onConfirm` / `onCancel` | `() => void` | — | The component closes after either, unless `editing` is controlled |
| `confirmLabel` / `cancelLabel` | `string` | `Save` / `Cancel` | The two buttons' names |
| `disabled` | `boolean` | — | No pen; the value just reads |

**`InlineDateEdit`**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string` | — | ISO `yyyy-mm-dd` |
| `onChange` | `(iso) => void` | — | Fires with the chosen day; the popover then closes |
| `label` | `string` | required | What the date is — names the button: "Change due date" |
| `format` | `(iso) => string` | identity | How it reads. The design draws the ISO string |
| `placeholder` | `string` | `'No date'` | While there is no value |
| `picker` | `DatePicker` props | — | `min`, `max`, `today`, `markers`… passed through |
| `align` | `left \| right` | `left` | Which edge of the picker lines up with the button; `right` opens leftwards, for the last columns |
| `disabled` | `boolean` | — | No button |

## Tokens

The pen, calendar, check and cross are `IconButton`s, `tonal`, `xs` (24): `neutral.tonal.surface`
`default` / `hover` / `pressed` / `disabled` and `neutral.tonal.content` likewise — the hover,
pressed and disabled steps are new tokens (Figma's `colors/neutral/tonal/*`). Nothing else
carries a colour of its own.

The tonal buttons are **24 high, under the 40 touch minimum**: this is a pointer-dense table
feature, and the pen is reachable by keyboard and focus. Don't use it on a touch-first screen.

## Accessibility

- **The pen is always in the tab order.** It is only *drawn* on hover or focus
  (opacity, never `display:none`), so a keyboard or screen-reader user never has to
  find it by hovering. It is named "Edit owner", not "Edit".
- **Enter confirms** from a single-line field, and not from a `textarea` or a button,
  where Enter already means something. **Escape cancels** and does not reach the
  page.
- **Focus** moves into the control on opening and back to the pen on closing.
- Give the editor its own accessible name that says *which row*: "Owner of AV-2041",
  not "Owner" ten times.

## Don't

- **Don't save on blur.** Moving away from a field is not a decision; confirm and
  cancel are.
- **Don't put a whole form in a cell.** Two or three fields is an edit page.
- **Don't hide the pen from touch.** It is reachable by focus, but a design for touch
  should show it permanently.
- **Don't ask twice on a calendar.** `InlineDateEdit` commits on pick, as the design does.
- **A popover in a table is clipped by the table's scroll container** — pass
  `className="overflow-visible"` to the `DataTable` where it fits (see `docs/data-table.md`).
