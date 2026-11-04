# BulkActionConfirmModal *(pattern)*

The question after a bulk choice, **one component for every action**. You pass the `action` and the selected Added Values; it draws the title, the field the action collects (or the value it
changes to), a collapsible **List of Added Values** with a field per Added Value where the action has one, and **Cancel** / **Confirm** (red for **Reject**). Built to Figma's
`Bulk_Action_Accordian_Confirmation_Popup` — all twelve of its variants.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Checkbox` | atom |
| `Divider` | atom |
| `Icon` | atom |
| `Input` | atom |
| `Select` | atom |
| `Tag` | atom |
| `CycleTag` | component |
| `Field` | component |
| `Modal` | component |
| `TypeTag` | component |
| `UrgencyTag` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `BulkActionConfirmModal` | Confirming a bulk change before it is made |
| `BulkActionBar` | What opens it |
| `BulkActionFailedModal` | What to show if some did not go through |
| `ConfirmDeleteAVModal` | Confirming a delete (`avTitles` for several) |

## The actions

**You never change what it shows** — the `action` decides. (Handoff is not here: it is its own multi-step popup.)

| `action` | Also pass | Title | It shows | `onConfirm` gets |
|---|---|---|---|---|
| `urgency` | `value` (`'Low'`…) | Change Urgency for 2 Added Values | "Selected AVs will be updated to:" and the value as an `UrgencyTag` | nothing |
| `type` | `value` (`'Type 1'`…) | Change Type for 2 Added Values | …as a `TypeTag` | nothing |
| `cycle` | `value` `{ code, start, end }` | Change Cycle for 2 Added Values | …as a `CycleTag` ("C18 (Sep 20, 2025 - Oct 02, 2026)") | nothing |
| `status` | `value` (the status) | Change Status for 2 Added Values | …as a `Tag`. **Figma draws no popup for the other statuses** (In Progress, For QA…); this is the plain one | nothing |
| `backlog` | — | Move 2 Added Values to Backlog | **Feedback** (optional), and per Added Value "Uses bulk reason unless overridden" | `{ value, overrides, detail?, overrideDetails? }` |
| `accept-pending` | `domain` | Accept 2 Pending Added Values | `development`: a **Multipart Value** checkbox (with its description), bulk and per Added Value. Otherwise nothing | `{ value: boolean, overrides }`, or `null` |
| `accept` | `domain` | Accept 2 Added Values | `development`: **Require Cypress Test Script**; `design`: **Copy to Dev**; otherwise nothing | `{ value: boolean, overrides }`, or `null` |
| `reject-pending` | `reasons` | Reject 2 Pending Added Values | **Rejection Reason** (a select of your `reasons`: `{ value, label, explanation?, other? }`; the chosen reason's `explanation` shows under it, and the one marked `other` shows an optional note field instead), bulk and per Added Value. **Required** | `{ value, overrides, detail?, overrideDetails? }` |
| `reject` | `reasons` | Reject 2 Added Values | The same, with a **red Confirm** | `{ value, overrides, detail?, overrideDetails? }` |

`domain` is `development`, `design` or `other`; a single Added Value reads singular ("Accept 1 Pending Added Value").

## A bulk field, and one per Added Value

The bulk field "will be applied to all selected Added Values unless overridden below". In the list each Added Value has its own: a text one starts empty (it uses the bulk reason), a checkbox
**follows the bulk one until it is changed**, a select starts empty. `onConfirm` gets `{ value, overrides }`: the bulk value, and `overrides[ref]` for each Added Value that **differs** (an untouched one is not listed).

**A reason is required to reject.** Confirm says "Select a rejection reason, or one for each Added Value." under the field, focuses it, and does not go through until every Added Value has one.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | You own `open`; Escape and Cancel ask to close |
| `action` | see above | required | Decides everything shown |
| `items` | `{ ref, title }[]` | required | The selected Added Values |
| `value` / `domain` / `reasons` | | by action | See the table |
| `onConfirm` | by action | required | The page's cue to make the change, then close, and say so (a toast, or `BulkActionFailedModal`) |
| `items[].href` | `string` | — | Makes that reference a blue link that opens the Added Value in a new tab; without it the reference is plain grey text |
| `defaultExpanded` | `boolean` | `false` | Open the list at first. Each time the dialog opens, everything starts again |
| `confirming` | `boolean` | — | Confirm spins; Cancel locks |

## The list

Collapsed until asked for (a disclosure button, `aria-expanded`). Each line is the reference in the link colour and the title, cut with "…" (the whole title is the hover `title`).

## Tokens

`Modal` (`lg`, 640: Figma draws 592, between `md` 512 and `lg`; no ✕, Cancel closes). **Cancel** is `secondary`, **Confirm** `primary` (`danger` for `reject`). The fields are the system's own `Input`, `Select` and
`Checkbox`; a checkbox sits in a bordered box as Figma draws it.

## Accessibility

- A `dialog` named by its title; focus is trapped, Escape closes, focus returns to what opened it.
- Each per-Added-Value field is named for it ("Reason for VCP-12345", "Multipart Value for VCP-12345").

## Don't

- **Don't build the fields yourself.** Pass the `action`.
- **Don't make the change in `onClose`.**
