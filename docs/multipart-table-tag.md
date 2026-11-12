# MultipartTableTag *(component)*

The small tag in the AV table that says an Added Value is part of a multipart set. Built to Figma's `_Multipart_Table_Tag` (`Type=Child` / `Type=Parent`, each with its tooltip).

## Composed of

| Piece | Tier |
|---|---|
| `DonutChart` | atom |
| `Icon` | atom |
| `Tooltip` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MultipartTableTag` | An AV table row that is a multipart parent or one of its parts |
| `MultipartParentChip` | The link from a child back to its parent |
| `StatusTag` | The status of an Added Value — a different thing |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `kind` | `child \| parent` | required | |
| `total` | `number` | required | How many parts the set has |
| `position` | `number` | `1` | `child`: which part this is — "1/3" |
| `parentRef` | `string` | — | `child`: the parent's reference, for the tooltip ("Parent ID: VCP-4321") |
| `completed` | `number` | `0` | `parent`: how many parts are done — the progress ring |

## The two tags

| | Glyph | Then | Tooltip |
|---|---|---|---|
| **Child** | The split glyph | "1/3" | "Multipart Child: This part belongs to a multipart parent value and is completed independently. Parent ID: VCP-4321" |
| **Parent** | VCP's own `arrows-split-source` | A progress ring (`DonutChart`, 20 across, 3 thick) | "Multipart Parent: This value was split into multiple parts, status is calculated from its parts. It currently has 3 child parts." |

## Tokens

A white pill: `surface.neutral.base`, a `stroke.subtle` hairline, `radius.sm`, **28 high**, 8 across, 4 between; 20 glyphs and `label-sm-medium` (14) `text.secondary`, as Figma draws it. (A 24-high one-line version was tried, and design compared the two side by side and chose Figma's.) The progress ring is a 20 `DonutChart`, 3 thick.

**It never shrinks or truncates**: it hugs its content however narrow the table gets (the table scrolls sideways instead).

**Its tooltip opens above**, as Figma draws it. `Tooltip` flips to the other side and slides along it when there is no room, so the table's edge no longer cuts it off (an earlier version opened it to the right for that reason).

## Accessibility

- It is **focusable**, so the tooltip is reachable by keyboard (focus opens it, with no delay) as well as by hover.
- It carries the facts as words for a screen reader: "Multipart child, part 1 of 3" / "Multipart parent, 1 of 3 parts completed". The glyph and the ring are decoration.

## Don't

- **Don't use it as a status.** It says what an AV is part of, not where it is.
- **Don't put anything interactive in the tooltip.** The link to the parent is `MultipartParentChip`.
