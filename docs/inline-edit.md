# InlineEdit

A value you can change in place. Read it, press the pen, change it with whatever
control fits, then confirm or cancel. It is the cell-sized version of an edit page
— for the one field you want to fix without leaving the table.

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `InlineEdit` | One field in a table or list that people correct often — an owner, a points value, a date |
| An edit page or modal | Several fields at once, or a change that needs a reason or a review step |
| A plain form field | The value is *always* editable, e.g. a settings form — there is nothing to read first |

## It owns the frame, not the control

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

## Tokens

The pen, check and cross are `IconButton`s (`tertiary`, `sm`); nothing else carries a
colour of its own. No new tokens.

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
