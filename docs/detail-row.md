# DetailRow

One label/value line in a details panel: a fixed 132 label column, the value
taking the rest, an optional edit affordance on the right. Stack rows and the
labels align into a scannable column.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `IconButton` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DetailRow` | Field-by-field facts about one object — a claim's supplier, status, dates |
| A table (`DataTable`, to port) | The same fields across *many* objects |
| `Field` + `Input` | Editing as the primary mode, labels above inputs |

`DetailRow` is read-first: the value is a fact, and editing is the exception a
pencil unlocks. If most rows are editors most of the time, the panel wants to
be a form built from `Field`, not a stack of these.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | A string **on purpose** — it also names the edit button ("Edit Start date") |
| `children` | `ReactNode` | — | The value: text, a `Badge`, an `AvatarGroup`, an editor while `editing` |
| `icon` | `IconName` | — | Glyph before the label. Decorative — the label is right there |
| `onEdit` | `() => void` | — | Renders the edit affordance. Fires for both pencil and confirm-tick |
| `editing` | `boolean` | — | Pencil → check, name → `Confirm ${label}`. Swapping the value for an editor is the caller's half |
| `align` | `center \| top` | `center` | `top` keeps the label with the first line of a multi-line value |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The row `<div>` |

The edit affordance is the system's own `IconButton` (`tertiary`, `sm`) — same
tokens, same ring, same exemption; nothing bespoke. The export reached `Icon`
and `IconButton` through a global-registry hack; here they are imports.

## Type ramp note

The export set label and value both at 13px/400 — a step the ramp deliberately
does not have (no 400-weight partner at 13px; see the inventory's known gaps).
The port maps label → `label-md` (13 medium) and value → `body-md` (14
regular), which is also the better hierarchy: the quiet column is quiet because
of `text.tertiary`, not because of weight.

## Tokens

Label `text.tertiary` at `label-md`; its glyph `text.subtle`; value
`text.primary` at `body-md`. No new tokens.

| Pair | Light | Dark |
|---|---|---|
| Value on `surface.base` | **20.17:1** | **14.63:1** |
| Label on `surface.base` | **7.58:1** | **9.85:1** |
| Label glyph on `surface.base` *(decorative)* | **4.76:1** | **5.71:1** |
| Label glyph on `surface.canvas` *(decorative)* | **4.55:1** | **6.96:1** |

## Accessibility

- The edit button is named `Edit ${label}` / `Confirm ${label}` — which is the
  whole reason `label` is typed `string`. Ten pencils in a panel with distinct
  names, not ten "Edit"s.
- The rows are plain `<div>`s, not `<dl>` — a details panel interleaves rows
  with editors and dividers, which fights a definition list's content model.
  The label/value pairing is visual and the edit name restates it; if your
  panel is a pure glossary, use a real `<dl>` instead of this.
- When `editing` swaps the value to an input, give the input its own
  `aria-label` (the story shows this) — the row's label column does not label
  the input for free.
- The pencil is `IconButton size="sm"` (32): the pointer-dense exemption from
  the 40 target. Details panels qualify; a touch-first mobile screen does not.

## Don't

- **Don't put a sentence in `label`.** It is a column, 132 wide, truncating —
  and it becomes a button name.
- **Don't skip `onEdit` and hide a click on the value** — an invisible
  affordance and an unreachable one.
- **Don't use it for two unrelated columns of text.** The 132 column is a label
  column, not a layout grid.
- **Don't put VCP vocabulary in it** — a status value is a `StatusPill`
  (pattern) passed as `children`, never encoded here.
