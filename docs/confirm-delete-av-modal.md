# ConfirmDeleteAVModal

The confirmation an Added Value has to pass before it is deleted.

Read off the Figma `Confirm_Delete_AV_Popup` (`7829:105404`, audit batch 4,
11 September 2026).

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Modal` | component | The dialog itself — portal, focus trap, Escape, inert background |
| `Field` | component | Labels the read-only AV title |
| `Input` | atom | Shows the AV title, read-only |
| `Button` | atom | Cancel, and the destructive answer |
| `Icon` | atom | The warning glyph above the question |

The import rows are checked against the real imports — `npm test` fails if this
list drifts, and fails a pattern composing fewer than two pieces.

## When to use

| Use | For |
|---|---|
| `ConfirmDeleteAVModal` | Deleting an Added Value, where the user must see which one |
| `Modal` with `role="alertdialog"` | Any other destructive confirmation — this one knows about AVs |
| A `Toast` with an undo | An action cheap enough to reverse. A confirmation is the expensive option |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | You own it. The dialog never closes itself |
| `onClose` | `() => void` | required | Escape or Cancel. **Never** a backdrop click |
| `onConfirm` | `() => void` | required | The user answered yes |
| `avTitle` | `string` | required | Shown read-only, so nobody deletes the wrong AV |
| `title` | `string` | "Are you sure you want to delete?" | The question, **and** the accessible name |
| `description` | `ReactNode` | the consequence sentence | Wired to `aria-describedby` |
| `confirmLabel` | `string` | `'Delete'` | See the deviation below |
| `cancelLabel` | `string` | `'Cancel'` | |
| `loading` | `boolean` | `false` | Spins the destructive button while the delete is in flight |

## It does not use `Modal`'s header

The design is an **alert layout**: a warning glyph, the question, the
consequence, all centred, with the AV's title underneath. `Modal` draws a
left-aligned title beside a close button, which is a different thing. So
`title` is omitted on `Modal`, `showClose` is `false`, and the heading lives in
the body.

One consequence is worth knowing. `Modal` accepts a visible `title` **or** an
`aria-label`, and deliberately does not accept `aria-labelledby` — so a dialog
whose heading is in its body cannot point at that heading, and has to repeat
the string as its name. This pattern passes one variable to both, so the two
cannot drift, but the tidier wiring would be for `Modal` to take
`aria-labelledby`. Flagged, not fixed.

## Accessibility

- **`role="alertdialog"`**, and `description` is wired to `aria-describedby`,
  so the consequence is part of the initial announcement rather than something
  the user has to go looking for.
- **A backdrop click does nothing.** `dismissible={false}`, because the
  accidental gesture must not delete anything. Escape still closes it — taking
  that away is how keyboard users get sealed in.
- **Focus starts on the panel**, which is `Modal`'s default, so the first Tab
  is Cancel and the destructive button is two stops away rather than one.
- **The warning glyph is decorative.** The question carries the meaning; an
  announced "warning" before it adds nothing.
- **The AV title is `readOnly`, not `disabled`**, so it stays selectable and
  copyable — a disabled field cannot be read out or copied from.
- **Interaction test.** `AnsweringIt` is a `play` story and runs under
  `npm test`: it proves the backdrop does nothing, Escape cancels, focus
  returns to the trigger, and the destructive answer reports itself.

## Deviations from the design

| The design | Ours | Why |
|---|---|---|
| ~~The destructive button read **"Complete"**~~ — **fixed in Figma, 11 Sep 2026** | `confirmLabel`, defaulting to **"Delete"** | It was a copy error, almost certainly pasted from another modal, and the file now says "Delete" too. The prop stays so a caller can override the wording |
| ~~Cancel is a **neutral** outlined button~~ — **no longer a deviation** | `Button variant="neutral"` | The system had no neutral outlined button; `neutral.outline.*` was imported from Figma on 11 Sep 2026 and `Button` gained the variant. The values match the design exactly |
| Field border `stroke.default` (1.48:1) | `Input`'s own `stroke.field` (4.76:1) | A form control's boundary has to be perceivable — the same correction `Input` already carries against the export |
| Dialog width 561 | `size="md"` (512) | Widths ride the spacing scale; 512 is the nearest step, as `Modal` documents |

## Don't

- **Don't make it dismissible.** The whole point is that the accidental
  gesture cannot delete anything.
- **Don't point `initialFocusRef` at the destructive button.** It is two Tab
  stops away on purpose.
- **Don't close it yourself on confirm.** `onConfirm` reports the answer; the
  caller closes when the delete actually succeeds, which is also what lets
  `loading` mean anything.
- **Don't reuse it for a non-AV delete.** It names an Added Value. A generic
  confirmation is `Modal` with `role="alertdialog"`.
