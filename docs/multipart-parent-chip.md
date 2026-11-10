# MultipartParentChip *(component)*

On a child part's row, a small link to its parent: "Parent: VCP-4321 ↗", **which opens the parent in a new tab**. Built to Figma's `Child_Multipart_Parent_Reference_Chip` (`Default` / `Hover`).

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MultipartParentChip` | A child part's way back to its parent, in the AV table |
| `MultipartTableTag` | The tag that says it is a child |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `parentRef` | `string` | required | As it reads: "VCP-4321" |
| `href` | `string` | — | Given, the chip is a real link that **opens the parent in a new tab** (`target="_blank"`, `rel="noopener noreferrer"`, and "(opens in a new tab)" for a screen reader). It keeps its ↗ because the arrow is then true |
| `onOpen` | `() => void` | — | Pressed. With no `href` the chip is a button, and the page opens the parent. It **asks**. With an `href` it is called as the link opens |

**With neither `href` nor `onOpen` there is nowhere to go**, so the chip is **plain text** ("Parent: VCP-4321", no arrow, no link colour, no focus stop) rather than a focusable control that does nothing.

## Tokens

`surface.neutral.faint`, `radius.sm`, 24 high (12 left, 8 right), the label in `text.link.default` (`caption-md-medium`) with an arrow; **underlined on hover**. 164 wide at most: a long reference is cut with "…" and the arrow stays.

## Accessibility

- A link ("Parent: VCP-4321 (opens in a new tab)") or a button named by its words; the arrow is decoration. With nowhere to go it is plain text, so it is not a tab stop.
- A visible focus ring.

## Don't

- **Don't open the parent from the row.** This chip is the control.
