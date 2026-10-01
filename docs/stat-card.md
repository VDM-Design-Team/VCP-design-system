# StatCard

One number that matters, on a card: a title row (optional icon, label,
optional info tooltip), then the value with an optional measurement beside it.
Dashboards tile these. Two forms:

- **`StatCard`** — one value, with a thick coloured **stripe** on the left edge.
  Two looks, set by `variant`:
  - `default` — Figma's `Value_Card`, what normal and admin users see on their
    dashboards. Bold value, height hugs the content.
  - `superadmin` — Figma's `_SuperAdmin_Metric_Card_Coloured_Base`. Semibold
    value, a fixed 150 high.
- **`StatCardGroup`** — two or more values under one title, side by side, split
  by vertical dividers. No stripe. Figma's `_SuperAdmin_Metric_Card_Grouped_Base`,
  so it has the superadmin look only, at a fixed 150 high (`h-37.5` on Tailwind's
  numeric scale).

Both fill their container's width. Every prop works in both looks of `StatCard`;
only the measurements and the value's weight differ.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Icon` | atom | The `hint` info glyph |
| `Divider` | atom | The vertical rule between the items of a `StatCardGroup` |
| `Tooltip` | component | The `hint` explanation |

`npm test` checks this list against the real imports.

## When to use

| Use | For |
|---|---|
| `StatCard` | A headline figure with at most one comparison |
| `StatCardGroup` | Two or more related figures that share a title — "Avg. Time: In Pending / In Review" |
| A plain section with a heading | Anything with real content — headings, body, actions |
| `DonutChart` in a StatCard | A consumed-of-total figure that wants a gauge (see the WithADonut story) |
| `DataTable` | The numbers behind the headline |

## Props — `StatCard`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `ReactNode` | required | What the number is. A `<span>`, deliberately not a heading |
| `value` | `ReactNode` | required | The figure — or a node (a small `DonutChart` works) |
| `unit` | `ReactNode` | — | The measurement beside the value — "%", "days", "of 40 pts" |
| `icon` | `ReactNode` | — | An `<Icon size="lg" />` before the label — Figma draws it in the `-fill` style. Decorative; takes the `accent` colour |
| `hint` | `string` | — | Explanation behind an info glyph after the label. Omit it and there's no glyph |
| `variant` | `default \| superadmin` | `default` | The look: `default` is the Value_Card (normal and admin dashboards), `superadmin` the larger fixed-height card |
| `accent` | `neutral \| brand \| info \| success \| critical \| warning` | `neutral` | The tone: the left stripe's colour, and the icon's. `brand` is the brand blue Value_Card uses for In Review / In Progress |
| `align` | `start \| center` | `start` | Left-aligned, or centred |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The card |

## Props — `StatCardGroup`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | The group's overall title. Always centred, whatever `align` is |
| `items` | `[item, item, ...item[]]` | required | **Two or more** — the type enforces it. For one value, use `StatCard` |
| `align` | `start \| center` | `start` | How each item's content aligns |
| `className`, `ref` | | | On the card |

An item takes `label`, `value`, `unit`, `icon`, `hint` and `accent` — the same
contents as a single card, less the stripe. `accent` colours the item's icon.
Items have no padding, hug their height and share the width equally.

## Tokens

**Card.** `stroke.default` outline, 1px, all round; `radius.md`. A single card
is `surface.elevated`, a group is `surface.base`. No shadow — Figma's cards are
flat.

**Both looks** have a `space.8` stripe on the left edge *inside* the outline, in
the `accent` tone. **Left-aligned**, the stripe is its own column: the content area
starts after it and its padding is measured from there, so it never overlaps the
content. **Centred**, the stripe is laid over the card's edge instead, so it does
not push the content off-centre and the text is centred on the whole card.

**Single, `default` (Value_Card):** `space.16` padding either side of the content,
with `space.20` above and below. No gap between the
title row and the value. At least 100 high, hugging its content. The value is bold
on a 44 line.

**Single, `superadmin`:** `space.24` side padding (after the stripe), content centred vertically,
exactly 150 high; `space.12` between the title row and the value row. The value is semibold on a
36 line.

**Group:** `space.16` top and `space.24` on the other three sides; the title at
the top, `label-sm-semibold` in `text.secondary`; `space.12` below it, the row
of items; `space.36` between each item and the divider beside it; dividers are
the `Divider` atom (`stroke.default`, 1px, full height of the items).

**Title row.** Icon 24 × 24 (`size-6`) in the accent tone, the label in
`label-sm-medium` `text.secondary`, the tooltip glyph 20 in `text.tertiary`;
`space.6` between the three. (The gap to the value row is per look, above.)

**Value row.** `space.8` between the value and the measurement, bottom-aligned
on the baseline. Both `text.primary`, Poppins.

**Tone.** The stripe and the icon read the same token, so they are the same
colour: `neutral.outline.border.default` for `neutral`,
`accent.{info,success,critical,warning}.outline.border.default`, and
`surface.brand.strong` for `brand` (Value_Card's In Review and In Progress use the
brand blue, which is not in the accent families) — as a `bg-*`
fill on the stripe (not a `border-l`, so it can't lose a cascade fight with the
card's own border) and as a `text-*` colour on the icon.

### Two exceptions to the type ramp

| | Figma | Why it's written out |
|---|---|---|
| Value | 36 / bold on a 44 line (`default`), 36 / semibold on a 36 line (`superadmin`) | The ramp has no 36 step (display-md is 40, heading-xl is 32) |
| Measurement | 24 / medium, 36 line | There is no `heading-lg-medium` — `heading-lg` ships bold, semibold and regular only |

Both live as marked lines in `StatCard.tsx` (`ds-lint-ignore`), not as new
tokens. If either becomes a real ramp step, swap the two constants for the token
class — nothing else changes. Everything else on the card is on the ramp:
`label-sm-medium` and `label-sm-semibold`.

| Pair | Light | Dark |
|---|---|---|
| Value on the card (`text.primary`) | **20.17:1** | **14.63:1** |
| Label on the card (`text.secondary`) | **10.35:1** | **11.87:1** |
| Tooltip glyph (`text.tertiary`) | **7.58:1** | **9.85:1** |

The tone colours are below 3:1 against a white card in places — light theme:
neutral **2.56**, success **2.22**, warning **1.91**; dark theme: info **2.79**.
The stripe and icon are decorative and hidden from assistive tech — the label
says what the card is — so they confirm a category rather than carry it, but
they are a known soft spot of `outline.border.default` as a fill. The 1px
`stroke.default` outline is **1.48:1** (light), the system-wide value.

## Accessibility

- The label is a `<span>`, not a heading — eight stat tiles must not
  contribute eight `<h3>`s to the outline; the dashboard section's heading
  owns them. It renders no heading of its own for that reason, and nothing it
  composes renders one either.
- `StatCardGroup` is a `role="group"` named by its title, so a screen reader
  announces "Avg. Time, group" before reading the items.
- Reading order is icon → label → hint → value → measurement, which is the
  sentence: "Open claims, 128 days" plus the hint button wherever it sits. In a group, the title comes first, then each
  item in order.
- The icon, the stripe and the dividers are decorative and hidden — the label
  text and the icon's own shape already carry which category a card belongs
  to. Colour is confirmation, not the only signal.
- `hint` renders a real, focusable `button` (named "About &lt;label&gt;")
  wrapping the system `Tooltip`, not a `title` attribute — reachable by
  keyboard, not just hover.

## Don't

- **Don't put actions in it.** A stat that opens the detail wants a real link
  beside or under the tile, not a clickable card.
- **Don't use `StatCardGroup` for one value**, or for unrelated figures that
  merely sit next to each other — a group says "these share a title".
- **Don't tile twelve.** Past a handful, the headline figures stop being
  headlines; the rest is a table.
- **Don't mix the two looks in one row.** `default` and `superadmin` have
  different stripes, padding and heights; a dashboard uses one or the other.
