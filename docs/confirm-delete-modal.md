# ConfirmDeleteModal

The confirmation anything has to pass before it is deleted — a user, a contact, a domain. The same alert layout as
`ConfirmDeleteAVModal` (Figma's `Confirm_Delete_AV_Popup`), with the word for the thing configurable instead of fixed to "Added Value".

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Modal` | component | The dialog itself — portal, focus trap, Escape, inert background |
| `Field` | component | Labels the read-only name |
| `Input` | atom | Shows the name, read-only |
| `Button` | atom | Cancel, and the destructive answer |
| `Icon` | atom | The warning glyph above the question |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ConfirmDeleteModal` | Deleting a user, a contact, a domain: anything where the user must see which one |
| `ConfirmDeleteAVModal` | Deleting an Added Value (the same layout, fixed to "Added Value") |
| A `Toast` with an undo | An action cheap enough to reverse. A confirmation is the expensive option |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | You own `open`. `onClose` fires on Escape and Cancel — never from the backdrop |
| `onConfirm` | `() => void` | required | The user answered yes. It does not close itself |
| `itemLabel` | `string` | required | What kind of thing it is, as the field's label: "User", "Contact" |
| `itemName` | `string` | required | Which one, shown so nobody deletes the wrong one |
| `title` | `string` | `Are you sure you want to delete?` | The question, and the dialog's accessible name |
| `description` | `ReactNode` | `This action cannot be undone. The item will be permanently removed.` | The consequence |
| `confirmLabel` / `cancelLabel` | `string` | `Delete` / `Cancel` | |
| `loading` | `boolean` | — | Spins the destructive button while the delete is in flight |

## Behaviour

- **It asks and reports; it deletes nothing.** `onConfirm` fires, the page deletes, then closes it — and says so with a toast.
- **An alert layout, not `Modal`'s default:** a warning glyph, the question, the consequence, all centred, with the name beneath in a
  read-only field (so it can be selected and copied before it goes). `Modal`'s header is unused; the heading lives in the body.
- **Not dismissible by a backdrop click**, and `role="alertdialog"` so the consequence is announced. Escape still closes it.

## Tokens

`Modal`'s, with the warning glyph in `accent.critical.outline.content`, the question `title-md-semibold` and the consequence
`caption-md-regular` `text.tertiary` (7.58:1 light / 9.85:1 dark). Cancel is `neutral`, the answer `danger`. No new tokens.

## Accessibility

- The dialog is named by the heading in its body (`aria-labelledby`) and described by the consequence, so the announced name is the visible question.
- Focus moves in on open and returns to what opened it; Escape closes. **If the item is deleted, what opened it is gone**, so focus falls to the page: the caller moves it on purpose after the delete — to the next item's delete control (or the previous one's when it was the last), or to the list's search or heading when nothing is left. See "Focus after a delete" in `docs/accounts-table.md`; every caller that removes the item has this job.
- The name field is a real, labelled, read-only input: it is read out and can be copied.

## Don't

- **Don't delete inside it.** It reports the answer.
- **Don't use it for an Added Value** — `ConfirmDeleteAVModal` is that, with its own wording.
- **Don't make the backdrop dismiss it.** A stray click must not delete anything.
