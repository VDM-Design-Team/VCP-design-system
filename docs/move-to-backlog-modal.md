# MoveToBacklogModal *(pattern)*

Moving an Added Value to the Backlog, with the **Feedback** that says why. One field, **Cancel** and **Move to Backlog**. Built to Figma's `Move_Backlog_Modal` (`7771:93171`, AV Page Details Card).

## Composed of

| Piece | Tier |
|---|---|
| `Input` | atom |
| `Field` | component |
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MoveToBacklogModal` | Moving one Added Value to the Backlog |
| `BulkActionConfirmModal` (`backlog`) | Moving several from the table's action bar, with a per-Added-Value override |
| `RejectPendingAVModal` | Rejecting, which needs a reason too |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | Cancel and Escape ask to close |
| `onMove` | `(feedback: string) => void` | required | Once, with the feedback: trimmed, never blank |
| `loading` | `boolean` | `false` | The button spins and Cancel locks. The footer is `Modal`'s own `ModalCancel` and `ModalConfirm` (40 high), like every other dialog's |

## Behaviour

- **Feedback is required** (decided 13 Nov 2026, as the live product does): parking an Added Value says why, the way rejecting one does. The field has the required marker and **Move to Backlog waits until something is typed**; spaces alone do not count. Enter in the field submits once there is feedback. Figma's `Move_Backlog_Modal` draws no marker yet: the design file is behind on this.
- **It opens with the cursor in Feedback**, the one thing to type here, so typing and Enter are enough.
- It resets each time it opens, and does nothing itself.
- **Title:** "Move Added Value to Backlog" — the bulk popup's order with Backlog capitalised. Figma's text reads "Move to backlog Added Value"; the wording here was decided with design.

## Tokens

`Modal` (`md`, no ✕ in the header, as Figma draws it). No new tokens.

## Accessibility

A dialog named by its title; the field is named "Feedback" by its label, with "(required)" for a screen reader. The waiting button is a real `disabled`, so Enter cannot get round it. Focus starts in Feedback when it opens (`Modal`'s `initialFocusRef`, for a dialog with one obvious job) and returns to what opened it on close.

## Don't

- **Don't make feedback optional again**, and don't accept it blank in the handler: the banner on a Backlog AV (Remarks) is this text.
- **Don't close it yourself on a failed move**; keep it open with what was typed.
