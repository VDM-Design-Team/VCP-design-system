# MultipartParentChip *(component)*

On a child part's row, a small link to its parent: "Parent: VCP-4321 ↗". Built to Figma's `Child_Multipart_Parent_Reference_Chip` (`Default` / `Hover`).

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
| `href` | `string` | — | Given, the chip is a real link |
| `onOpen` | `() => void` | — | Pressed. With no `href` the chip is a button, and the page opens the parent. It **asks** |

## Tokens

`surface.neutral.faint`, `radius.sm`, 24 high (12 left, 8 right), the label in `text.link.default` (`caption-md-medium`) with an arrow; **underlined on hover**. 164 wide at most: a long reference is cut with "…" and the arrow stays.

## Accessibility

- A link or a button named by its words ("Parent: VCP-4321"); the arrow is decoration.
- A visible focus ring.

## Don't

- **Don't open the parent from the row.** This chip is the control.
