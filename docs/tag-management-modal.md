# TagManagementModal

The three dialogs behind Tag Management. Built to Figma's `Tag_Management_Modal`
(`7592:109639`).

## Composed of

| Piece | Tier |
|---|---|
| `ConfirmDeleteModal` | pattern |
| `Modal` | component |
| `Field` | component |
| `Button` | atom |
| `Input` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `TagManagementModal` `type="tag"` / `"domain"` | Naming a new tag or domain |
| `TagManagementModal` `type="delete-domain"` | Confirming a domain's deletion |
| `ConfirmDeleteModal` | Any other delete confirmation (a user, a contact) |
| `ConfirmDeleteAVModal` | Deleting an Added Value — it shows the AV's title |

`delete-domain` **is** `ConfirmDeleteModal`, with the domain's name and the domain wording. It used to be a plain
`Modal` with a "Confirm" button; it is now the system's one delete confirmation, so it reads like every other
(a warning glyph, the question, the consequence, the name, **Cancel** and a red **Delete**).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | You own it |
| `type` | `tag \| domain \| delete-domain` | required | Picks the copy and layout |
| `onClose` | `() => void` | required | Escape, Cancel, ✕, and a backdrop click on the add forms |
| `onSubmit` | `(name: string) => void` | — | `tag` / `domain`: the trimmed name |
| `onConfirm` | `() => void` | — | `delete-domain` |
| `loading` | `boolean` | `false` | Spins Submit / Confirm |
| `mode` | `add \| edit` | `add` | `edit` renames: "Rename Tag", Save. **Not in Figma** — the add dialog, reused |
| `noun` | `string` | the `type`'s (`Tag`, `Domain`) | The word for what is added or renamed when it is neither: "Role" gives "Add a new Role", "Rename Role" and a "Role Name" field |
| `initialName` | `string` | `''` | The current name. `mode="edit"` starts the field as it (Save stays off until it changes); `delete-domain` shows it so nobody deletes the wrong domain |

## Accessibility

- Add forms: "Tag Name" / "Domain Name" is a real label; Submit is off until the name has
  characters; the form is reset each time it opens.
- Delete: `ConfirmDeleteModal` — `role="alertdialog"` named by the question; no ✕ and a
  backdrop click does nothing, so a stray click cannot delete a domain. Escape and Cancel still close it.
- Cancel is the system's **neutral** (grey outline) button and Delete is `critical-primary` (red). Figma draws
  a plain dark-text Cancel and a "Confirm" button; the system's one delete confirmation says Delete (see `docs/confirm-delete-modal.md`).

## Don't

- **Don't reuse the delete type for anything but a domain** — its wording says "domain".
