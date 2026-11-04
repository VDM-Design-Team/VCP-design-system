# BulkActionFailedModal *(pattern)*

When some of a bulk change did not go through: **"Added Values Failed to Update"**, "2 of 5 added values failed to update Urgency to High", each failure with **why** in red, and **Got it**.
Built to Figma's `Bulk_Action_Failed_Update_Summary_Popup`.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `BulkActionFailedModal` | Naming the Added Values that failed, and why |
| `Toast` | Saying the rest worked ("Added Values Updated") |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | **Got it** and ✕ both ask to close |
| `total` | `number` | required | How many were in the change |
| `property` / `value` | `string` | required | "Urgency" / "High" |
| `failures` | `{ ref, title, reason }[]` | required | **Which AVs and why** (Figma's note). `reason` is the server's words |

It lists only the ones that failed; a toast already said how many worked.

## Tokens

`Modal` (`lg`; Figma draws 592) with its ✕; the reason is `accent.critical.outline` text with a filled warning glyph.

## Accessibility

- A `dialog` named by its title, described by the count line. The reason is words, not just the colour: the glyph is decoration.

## Don't

- **Don't list the ones that worked.**
- **Don't paraphrase the reason.** The server knows why.
