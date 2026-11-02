# TagManagementModal

The three dialogs behind Tag Management. Built to Figma's `Tag_Management_Modal`
(`7592:109639`).

## Composed of

| Piece | Tier |
|---|---|
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
| `ConfirmDeleteAVModal` | Deleting an Added Value — it shows the AV's title |
| `Modal` with `role="alertdialog"` | Any other destructive confirmation |

There is no general "confirm delete" modal in the system; `ConfirmDeleteAVModal` is an
alert layout built around an AV. The delete here is the plain dialog Figma draws.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | You own it |
| `type` | `tag \| domain \| delete-domain` | required | Picks the copy and layout |
| `onClose` | `() => void` | required | Escape, Cancel, ✕, and a backdrop click on the add forms |
| `onSubmit` | `(name: string) => void` | — | `tag` / `domain`: the trimmed name |
| `onConfirm` | `() => void` | — | `delete-domain` |
| `loading` | `boolean` | `false` | Spins Submit / Confirm |

## Accessibility

- Add forms: "Tag Name" / "Domain Name" is a real label; Submit is off until the name has
  characters; the form is reset each time it opens.
- Delete: `role="alertdialog"`, named by the question; no ✕ and a backdrop click does nothing,
  so a stray click cannot delete a domain. Escape and Cancel still close it.
- Confirm is the system's red `danger` button; Cancel is `tertiary`, as in the design.

## Don't

- **Don't reuse the delete type for anything but a domain** — its wording says "domain".
