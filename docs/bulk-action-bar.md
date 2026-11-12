# BulkActionBar *(pattern)*

The bar over an AV table once rows are selected: **"4 Selected ✕"**, a dropdown for each thing you can change (**Status**, **Urgency**, **Type**, **Cycle**) and **Delete**.
Built to Figma's `Bulk_Action_Bar_AV_Table` and `Bulk_Actions_Dropdowns`.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `Menu` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `BulkActionBar` | Acting on several selected rows of an `AVTable` at once |
| `BulkActionConfirmModal` | What a choice should open before anything changes |
| `BulkActionFailedModal` | What to show when some of the change did not go through |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `count` | `number` | required | How many rows are selected. **At 0 the bar is not drawn**; 1 looks the same as many ("1 Selected") |
| `onClear` | `() => void` | required | The chip was pressed ("4 Selected ✕"): clear the selection |
| `actions` | `BulkAction[]` | required | `{ key, label, heading?, items, onSelect }` — one menu each. **The page owns the choices**: statuses differ by domain, cycles by date |
| `onDelete` | `() => void` | — | **Delete** (the red text button). Leave it out to hide it |
| `returnFocusRef` | `RefObject<HTMLElement>` | — | Where focus goes when the selection empties and the bar goes with it: the table's **select-all checkbox**. Only moves focus that was lost |

## Every choice only asks

`onSelect(key)` and `onDelete` do not change anything. The page opens `BulkActionConfirmModal` (or a delete confirmation), and only its **Confirm** makes the change; then a toast says
so (`Added Values Updated`), or, if some failed, `BulkActionFailedModal` names them. The `OnTheTable` story shows the whole flow on a real `AVTable`.

## Narrow screens

The bar **never wraps or shrinks**: every control keeps its size, and when the screen is narrower than the bar it is `max-w-full` and **scrolls sideways inside itself**. Its menus float over that scrolling (`Menu`'s default `fixed` strategy, placed from the trigger's screen rect), so it never clips them.

## Where it sits

The page places it: **stuck to the bottom of the table, centred over it**, over the last rows (Figma draws it so, and the same bar for one selected row). It is only the bar. The `OnTheTable` story does it with `sticky bottom-6`.
`AVTable` still has its own **Delete Selected (n)** button (`onDeleteSelected`); with this bar, leave it out — the bar's **Delete** replaces it.

**Deleting** opens `ConfirmDeleteAVModal` with `avTitles`: every selected Added Value, one line each ("VCP-12345 Title"), in a read-only field.

## The menus

Each is a `Menu` that **opens upward** (the bar sits at the bottom of the window; it flips down if there is no room above) with a category-style heading ("Urgency", "Move to Status").
**The page fills them in**, because the choices are data: statuses differ by domain, cycles by date.

| Menu | Heading | Choices |
|---|---|---|
| **Status — development** (Figma's list) | Move to Status | Save as Draft, Submit, **Pending Review ›** (Accept, Reject), In Progress, Handoff, For Review, In QA, For QA, Ready for Deploy, Confirmed Prod, **Review ›** (Accept, Reject), Backlog |
| **Status — design** | Move to Status | The same idea with design's own steps, and a submenu where it has a review. **Figma does not draw this list**; the stories build one from the status progression (with Design Review), for design to confirm |
| **Urgency** | Urgency | Low, Normal, High, Urgent |
| **Type** | Type | Type 1, Type 2, Type 3 |
| **Cycle** | (none drawn) | "C33 (May 25, 2026 - Jun 08, 2026)" … a long list; Figma gives it a **search box** (`searchable`, which `Menu` has) |

A choice with a submenu shows the right caret (`Menu`'s own, the same everywhere) and is not itself a choice; only Accept / Reject are, and their keys say where they came from (`pending-review/accept`).

## Tokens

`surface.elevated`, a `stroke.strong` border, `radius.md`, `elevation-3`. The chip is a 28-high outlined pill (`label-sm-regular`). **The actions are in the neutral palette**: `Button`'s `neutral-text` variant (`neutral.textual.content`, default, hover, pressed, disabled — the same tokens the date picker's carets use), so they read as controls, not calls to action (the ghost button's own colour is the brand blue). Delete is `Button`'s `danger-tertiary` variant (red text, no fill: `accent.critical.outline` content, with its hover and pressed). No colour is set on the bar.

## Accessibility

- A `toolbar` named "Bulk actions". The chip's name ends "…: clear the selection". Each action is a `Menu` button (arrow keys, Escape, focus returns).
- Delete is a button named "Delete"; the page's confirmation says what will go.
- **Focus never drops.** At 0 the bar draws nothing, so a focused button in it goes too (after a confirmed Delete, a change that clears the selection, or the chip). Pass `returnFocusRef` (the select-all checkbox) and focus goes there.

## Don't

- **Don't change anything from a choice.** Confirm first.
- **Don't draw it at 0 selected.** It draws nothing itself; just pass `count`.
- **Don't leave focus to the page** when the selection empties: pass `returnFocusRef`.
