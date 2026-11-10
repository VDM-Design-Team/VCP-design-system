# ChildPartModal *(pattern)*

Asks for the title of a part of a multipart Added Value: a new one (before it is added) or an existing one (to rename it). Built to Figma's `Multipart_Child_Part_Modal` (all three variants).

## Composed of

| Piece | Tier |
|---|---|
| `Input` | atom |
| `Banner` | component |
| `Field` | component |
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ChildPartModal` | **Add Part** on a multipart AV (`new`), and a part's edit button (`edit`) |
| `MultipartSection` | What opens it |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | You own `open`; Escape and Cancel ask to close |
| `mode` | `new \| edit` | `new` | `new`: "Add a New Child Part to Multipart AV", **Confirm**. `edit`: "Edit Child Part Title", **Save** |
| `initialTitle` | `string` | — | `edit`: the current title, which the field starts with |
| `onConfirm` | `(title: string) => void` | required | The typed title, trimmed. **Empty means "use the default"** (also when renaming) |
| `statusChange` | `{ from, to }` | — | `new` only. Shows the **Status will change** warning: "The status of this AV is Completed. If a new child part is added, the AV will be returned to In Progress." |
| `confirming` | `boolean` | — | Confirm spins; the field and Cancel lock |
| `error` | `string` | — | What only the server knows |

## A blank title is allowed

The placeholder says so: "Enter a title, or leave blank for “Part (X/X) Parent Title”." The default is **the page's to work out** — it knows how many
parts there are and what the parent is called. The dialog keeps its own draft, empty each time it opens; Enter confirms.

## Tokens

`Modal` (`md`), no ✕ (Figma draws none: **Cancel** closes). The footer is `Modal`'s own `ModalCancel` and `ModalConfirm` (40 high), like every other dialog's; the warning is a `Banner` (`warning`).

## Accessibility

- A `dialog` named by its title; focus is trapped, Escape closes, focus returns to what opened it.
- The warning is a banner above the field, read when the dialog is; the Title field is named by its label.

## Don't

- **Don't make the title required.** A blank one is a feature.
- **Don't work out the default title in here.** The page owns it.
