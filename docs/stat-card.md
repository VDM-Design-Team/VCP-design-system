# StatCard

One number that matters, on a card: a title row (optional icon, label,
optional info tooltip), then the value with an optional measurement beside it.
Dashboards tile these. **There are two cards, one per dashboard**, read off
Figma's `VCP Pages & Flows` file (5 Oct 2026) and set by `variant`:

| | `default` — admin & user dashboards | `superadmin` — super admin dashboard |
|---|---|---|
| Figma | `Value_Card` (node `947:306362`, "Value Cards") | `_SuperAdmin_Metric_Card_Coloured` (node `3:4848`) |
| Stripe | 8 wide | 8 wide |
| Alignment | **Left** | **Centred** |
| Size | Exactly 100 high, at least 16.5rem wide | Exactly 150 high |
| Title | Label only (Figma draws no icon or hint) | Accent icon, label, info hint |
| Value | 32 **bold** (`heading-xl-bold`) | 32 **semibold** (`heading-xl-semibold`), plus a 24 unit |

**`StatCardGroup`** is the super admin dashboard's
`_SuperAdmin_Metric_Card_Grouped`: two or more values under one title, side by
side, split by vertical dividers, centred, 150 high. No stripe.

Alignment belongs to the look rather than being a prop — Figma never draws a
centred Value_Card or a left-aligned super admin card. Every form fills its
container's width.

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
| `variant` | `default \| superadmin` | `default` | Which dashboard's card: `default` is the Value_Card (admin and user — left-aligned, 100 high), `superadmin` the super admin card (centred, 150 high) |
| `accent` | `neutral \| brand \| info \| success \| critical \| warning` | `neutral` | The tone: the left stripe's colour, and the icon's. `brand` is the brand blue Value_Card uses for In Review / In Progress |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The card |

## Props — `StatCardGroup`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | The group's overall title, centred above the items |
| `items` | `[item, item, ...item[]]` | required | **Two or more** — the type enforces it. For one value, use `StatCard` |
| `className`, `ref` | | | On the card |

An item takes `label`, `value`, `unit`, `icon`, `hint` and `accent` — the same
contents as a single card, less the stripe. `accent` colours the item's icon.
Items have no padding, hug their height and share the width equally.

## Laying cards out

A default card has a minimum width (16.5rem), so a fixed-column grid can force
cards past their cell and into each other when the space is tight. Put a row of
them in a **wrapping flex container** — `flex flex-wrap gap-4` — and give each
card `className="flex-1"` so they share the row and drop onto the next one when
three no longer fit. The card doesn't set `flex-1` itself: in a column it would
collapse the card's fixed height.

## Tokens

**Card.** `stroke.default` outline, 1px, all round; `radius.md`. A single card
is `surface.elevated`, a group is `surface.base`. No shadow — Figma's cards are
flat.

**The stripe** sits on the left edge *inside* the outline, in the `accent`
tone, and is always its own column: the content area starts after it, so
centred content centres in the space beside the stripe — as Figma draws it.

**Single, `default` (Value_Card):** an 8 stripe; `space.16` either side of the
content, left-aligned and centred vertically; no gap between the label and the
value. Exactly 100 high and at least 16.5rem wide (`h-25 min-w-66`; Figma's own minimum is 175, widened so the card stays readable). The value
is bold on a 44 line.

**Single, `superadmin`:** an 8 stripe — the same as the Value_Card's (design review, October 2026; it was 12); `space.24` either side, content centred
both ways; `space.12` between the title row and the value row. Exactly 150
high (`h-37.5`). The value is `heading-xl-semibold`.

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

### The value is on the ramp; the measurement is the one exception

The **value** is `heading-xl` (32): `heading-xl-bold` on the `default` card,
`heading-xl-semibold` on the `superadmin` card.

**Why it differs from Figma (design decision, 5 Oct 2026).** Figma draws the value
at 36, which has no step on the type ramp. We use 32 on purpose, for three reasons:

1. **It matches the typography we have.** 32 is `heading-xl`, an existing ramp step
   — so the value is a token, not a hand-written size.
2. **It is more consistent.** A one-off 36 would sit between `heading-xl` (32) and
   `display-md` (40) and belong to no tier; the other numerals in the system are on
   the ramp.
3. **It helps once there are a lot of value cards.** A dashboard will show many of
   these in a row; a slightly smaller figure keeps each card, and the row, from
   feeling heavy — and is one less thing that scales badly.

If Figma is updated to 32, there is nothing to change here. If a 36 step is ever
added to the ramp, revisit this.

| | Figma | Why it's written out |
|---|---|---|
| Measurement | 24 / medium, 36 line | There is no `heading-lg-medium` — `heading-lg` ships bold, semibold and regular only |

It lives as one marked line in `StatCard.tsx` (`ds-lint-ignore`), not as a new
token. If it becomes a real ramp step, swap the constant for the token class —
nothing else changes. Everything else on the card is on the ramp:
`heading-xl-bold` / `heading-xl-semibold` (value), `label-sm-medium` and
`label-sm-semibold`.

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
- **Don't mix the two looks in one row.** `default` and `superadmin` belong to
  different dashboards and have different stripes, alignment and heights.
