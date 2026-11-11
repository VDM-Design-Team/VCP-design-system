# AddManualModal

The dialog behind **Add Manual** on the Settings Manuals tab. Figma draws the button in the admin's top bar
(`1046:242262`) and not the dialog; what it asks for was decided on 10 Nov 2026: **a name and one or more files**,
with the shared `Attachments`.

## Composed of

| Piece | Tier |
|---|---|
| `Modal` | component |
| `Field` | component |
| `Attachments` | component |
| `Input` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AddManualModal` | Adding a manual on the Manuals tab |
| `Attachments` on its own | Files that belong to something else (an Added Value, a handoff) |
| `TagManagementModal` | Naming a tag or a domain: a name and nothing else |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | You own it |
| `onClose` | `() => void` | required | Escape, Cancel and ✕ |
| `onSubmit` | `(draft: { name: string; files: File[] }) => void` | required | Only when both are there; the name is trimmed. The dialog stays open — close it once the upload is through |
| `submitting` | `boolean` | `false` | Submit spins, the fields lock, nothing closes the dialog |
| `errors` | `{ name?: ReactNode; files?: ReactNode }` | — | What only the server knows (a name already taken, a failed upload), under its field |
| `accept` | `string` | — | What the picker takes (`Dropzone`'s) |
| `maxSize` | `number` | — | Bytes; a bigger file is refused and the drop area says why |
| `hint` | `string` | — | The accepted-types line under the drop area |
| `title` | `string` | `'Add Manual'` | |

It uploads nothing. Each opening starts empty: a cancelled draft doesn't come back.

## Accessibility

- **Manual Name** is a real label on its input; both fields are marked required.
- Errors show from the first Submit on, under their field, and each clears as it's fixed: "Give the manual a name.",
  "Add at least one file."
- Picked files are `Attachments` cards; removing one moves focus to the next card's ✕, else the previous one's, else the
  drop area. It never drops focus.
- Closing returns focus to the button that opened it (`Modal`).

## Don't

- **Don't decide who reads the manual here.** That's the product's rule (every user in the domain), not the dialog's.
- **Don't close it on Submit yourself before the upload is through** — pass `submitting`, then close.
- **Don't build a second file picker for manuals.** It's `Attachments`, as everywhere else.
