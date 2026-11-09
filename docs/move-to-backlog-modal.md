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
| `RejectPendingAVModal` | Rejecting, which needs a reason |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | Cancel and Escape ask to close |
| `onMove` | `(feedback: string) => void` | required | Once, with the feedback (`''` when none) |
| `loading` | `boolean` | `false` | The button spins and Cancel locks. The footer is `Modal`'s own `ModalCancel` and `ModalConfirm` (40 high), like every other dialog's |

## Behaviour

- **Feedback is optional**: the design draws no required marker and no error, so Move to Backlog is always available. Enter in the field submits.
- It resets each time it opens, and does nothing itself.
- **Title:** "Move Added Value to Backlog" — the bulk popup's order with Backlog capitalised. Figma's text reads "Move to backlog Added Value"; the wording here was decided with design.

## Tokens

`Modal` (`md`, no ✕ in the header, as Figma draws it). No new tokens.

## Accessibility

A dialog named by its title; the field is named "Feedback" by its label.

## Don't

- **Don't require feedback** unless the design says so.
- **Don't close it yourself on a failed move**; keep it open with what was typed.
