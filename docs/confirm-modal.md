# ConfirmModal *(component)*

The question a person answers before something is lost: **"Are you sure you want to discard this Added Value?"**, what it will cost, then **Cancel** and a red **Confirm**.
It is `Modal` in its `critical` tone and nothing else, with the copy of the dialogs Figma draws kept in one place, `confirmations`.

## Composed of

| Piece | Tier |
|---|---|
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ConfirmModal` | A step that loses something and needs one more answer: discarding an AV, removing a link or file, deleting a problem set, leaving with unsaved edits |
| `ConfirmDeleteModal` / `ConfirmDeleteAVModal` | A deletion that names what is going (a user, a contact, an Added Value): they show its name in a read-only field |
| `Toast` with Undo | A step that is cheap to take back: ask nothing, offer Undo |

## The copy: `confirmations`

Each is a recipe (`title` and, where there is a cost to say, `description`) for a dialog the design draws. Spread one in:

```tsx
<ConfirmModal open={asking} onClose={stay} onConfirm={discard} {...confirmations.discardAV()} />
```

| Recipe | Asks | Costs |
|---|---|---|
| `deleteProblemSet()` | Are you sure you want to delete this Problem Set? | Removing this problem set will also remove the associated multipart child permanently. |
| `discardAV()` | Are you sure you want to discard this Added Value? | This action cannot be undone. The item will be permanently removed. |
| `removeLink()` | Are you sure you want to remove this link? | — |
| `removeFile()` | Are you sure you want to remove this file? | — |
| `leavePage()` | Are you sure you want to leave? | You have unsaved changes which will be lost if you leave this page. |

A recipe is copy only. **When** to ask, and what happens after the answer (a redirect and a toast after a discard: the `discarded()` toast recipe, "Draft discarded"; not Figma's "…has been discarded successfully.", see *Writing toast copy* in `docs/toast.md`), is the page's.
`removeFile` is not drawn on its own: the design draws a link and says a file is the same step. "Are you sure want to remove this link?" in Figma is corrected to "…you want to…".

Two of them are built into the patterns that own the button, **opt-in** (off, the buttons fire at once, as before): `DeliverablesCard`'s `confirmRemove` and `AVPage`'s `actions.confirmDiscard`.
**Discard asks the plain question** (decided 17 November 2026): it does not show the Added Value's reference and title, as the delete dialog would. **Both stay off unless a page turns them on** (decided the same day), so existing pages are unchanged; VCP's own pages are expected to turn them on, since the design's flows always ask.
The other three are the page's to show: the problem set's remove, and the leave prompt, which needs the app's router to know a navigation is happening, which a design-system piece cannot.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | |
| `onClose` | `() => void` | required | Cancel, or Escape. Never from a click outside |
| `onConfirm` | `() => void` | required | Confirm was pressed. The dialog does not close itself |
| `title` | `string` | required | The question, and the dialog's name |
| `description` | `ReactNode` | — | What it will cost |
| `confirmLabel` | `string` | "Confirm" | As Figma draws it |
| `cancelLabel` | `string` | "Cancel" | |
| `loading` | `boolean` | — | Confirm spins and nothing closes the dialog until the work is done |

## What it takes from `Modal`'s critical tone

An alert dialog (so the cost is part of the announcement), **no ✕** and **no click-outside to dismiss** (a stray click must not answer it), a grey Cancel beside a red Confirm. Escape closes it unless it is `loading`.
Figma draws a ✕ on some of these and a warning glyph on the link one. These stay plain: no ✕ and no glyph, as `Modal`'s critical tone is (decided 17 November 2026; a recorded difference from Figma). The warning glyph belongs to the delete dialogs that name what is going, `ConfirmDeleteModal` and `ConfirmDeleteAVModal`.

## Accessibility

- Named by its title; the description is read with it. Focus moves into the dialog (`Modal` puts it on the panel, so the title and cost are read before any button), and Escape and Cancel return it to what opened the dialog.
- Confirm is a real button named "Confirm"; the cost says what it confirms.

## Don't

- Don't ask for what Undo would do: a cheap step takes a toast with Undo, not a dialog.
- Don't ask twice for one step.
- Don't rewrite a recipe's copy at a call site: change the recipe, so every page asks the same thing.
