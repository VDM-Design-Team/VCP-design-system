# ChildPartModal *(pattern)*

Asks for the title of a new part before it is added to a multipart Added Value. Built to Figma's `Multipart_Child_Part_Modal` (both variants).

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Input` | atom |
| `Banner` | component |
| `Field` | component |
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ChildPartModal` | **Add Part** on a multipart AV |
| `MultipartSection` | What opens it |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | You own `open`; Escape and Cancel ask to close |
| `onConfirm` | `(title: string) => void` | required | The typed title, trimmed. **Empty means "use the default"** |
| `statusChange` | `{ from, to }` | — | Shows the **Status will change** warning: "The status of this AV is Completed. If a new child part is added, the AV will be returned to In Progress." |
| `confirming` | `boolean` | — | Confirm spins; the field and Cancel lock |
| `error` | `string` | — | What only the server knows |

## A blank title is allowed

The placeholder says so: "Enter a title, or leave blank for “Part (X/X) Parent Title”." The default is **the page's to work out** — it knows how many
parts there are and what the parent is called. The dialog keeps its own draft, empty each time it opens; Enter confirms.

## Tokens

`Modal` (`md`), no ✕ (Figma draws none: **Cancel** closes). **Cancel** is `secondary`, **Confirm** `primary`; the warning is a `Banner` (`warning`).

## Accessibility

- A `dialog` named by its title; focus is trapped, Escape closes, focus returns to what opened it.
- The warning is a banner above the field, read when the dialog is; the Title field is named by its label.

## Don't

- **Don't make the title required.** A blank one is a feature.
- **Don't work out the default title in here.** The page owns it.
