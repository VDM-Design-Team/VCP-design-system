# DomainItem

One row in a Tag Management card: a name with edit and delete, a locked built-in
with a "Default" tag, or a draggable row with a grip. Built to Figma's
`_Domains_Item` (`7463:91894`).

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `IconButton` | atom |
| `Tag` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DomainItem` | A row in a list the admin manages: tags, roles, statuses, projects |
| `DomainCard` | The titled card that stacks these and wires reordering |
| `DataTable` | Rows with several columns worth sorting |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | A string on purpose — it names the buttons ("Edit Bug", "Delete Bug", "Move Bug") |
| `variant` | `default \| locked \| draggable` | `default` | See below |
| `lockedLabel` | `string` | `Default` | The tag on a locked row |
| `onEdit` | `() => void` | — | Draws the pencil |
| `onDelete` | `() => void` | — | Draws the bin |
| `grabbed` | `boolean` | — | Picked up for a keyboard move; the grip is `aria-pressed` |
| `onGrabToggle` | `() => void` | — | Space, Enter or a click on the grip: pick up, or drop |
| `onMove` | `(direction: 'up' \| 'down') => void` | — | ↑ / ↓ — **only while `grabbed`** |
| `onCancel` | `() => void` | — | Escape, or focus leaving the grip, while `grabbed` |
| `dragging` | `boolean` | — | The row being dragged (or `grabbed`) takes `surface.neutral.subtle` |
| `dropTarget` | `boolean` | — | A dragged row is over this one |
| `handleId` | `string` | — | Marks the grip so a parent can return focus to it |
| `className`, `ref`, … | | | The row `<div>`; native `draggable` and `onDrag*` pass through |

## Types

| Type | Name | Right side | Notes |
|---|---|---|---|
| `default` | `text.primary` | pencil-in-square, red bin | Both buttons are textual: the bin is `IconButton` `critical`, the pencil `tertiary`; only the glyph colour changes on hover and press |
| `locked` | `text.tertiary` | "Default" `Tag` (`sm`, neutral) | Built-in value: cannot be edited, deleted or moved |
| `draggable` | `text.primary` | pencil-in-square, red bin | A 24 grip at the left (`dots-six-vertical`) |

40 tall, 28 padding either side (20 on the left when draggable). The buttons are
`IconButton` `md` — 40, so they meet the touch minimum without the row growing.

## Accessibility

- **Reordering is not drag-only, and not accidental.** The grip is a real toggle `<button>` named
  "Move ${label}" (`aria-pressed`), described by a hidden hint. An arrow key alone does nothing:
  Space or Enter picks the row up, ↑ / ↓ move it, Space or Enter drops it, Escape or tabbing away
  cancels. A stray key press cannot reorder a list.
- Edit and delete are named for their row, so a list of ten rows has ten distinct names.
- The locked name is `text.tertiary` on `surface.elevated` — above 4.5:1.
- **Touch:** HTML drag-and-drop does not fire from touch, and the arrow-key path needs a
  keyboard. A touch reorder alternative (e.g. move up / move down buttons) is an open design
  question.

## Don't

- **Don't make a locked row editable by hiding the tag.** Locked is a product rule, not a style.
- **Don't re-derive "which rows are locked" here.** The caller says; the row draws.
