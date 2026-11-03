# MyValuesStats

The strip across the top of the My Values page: who you are, how many Added Values are yours and how many are completed, and the
rest by status as one segmented bar. Built to Figma's `My_AVs_Stats` (the `My Values Page` of `VCP Pages & Flows`).

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Divider` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MyValuesStats` | A person's own AV totals and status breakdown, above their list |
| `StatCard` | One headline figure on a dashboard |
| `ProgressBar` | One fraction of one whole |

## What it shows

- **Who.** The avatar over the person's name, then a vertical divider.
- **Two headline figures.** **Total AVs**, and **Completed** with its green dot.
- **The breakdown.** One segment per status, **as wide as its count** and never narrower than 100, so a status with nothing in it
  is still a visible, labelled stop. Under each bar: the count, then the status's name. A segment with a count is **filled** in its
  tone; one with none is drawn as an **empty outline** in the same tone.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `user` | `{ name: string; src?: string }` | required | Whose values these are |
| `total` / `completed` | `number` | required | The caller's. **Total is not the sum of the segments** — it includes what is completed |
| `segments` | `MyValuesStatsSegment[]` | required | `{ id, label, count, tone }`, in reading order |
| `totalLabel` / `completedLabel` | `string` | `Total AVs` / `Completed` | |
| `aria-label` | `string` | `My Values statistics` | The region's name |
| `className`, `ref` | | | On the section |

A segment's `tone` is one of `neutral`, `yellow`, `blue`, `brand`, `critical`.

## It owns one mapping

**A tone → its colour,** once (`neutral.outline.border.default`, `accent.yellow.medium`, `accent.blue.medium`, `surface.brand.strong`,
`accent.critical.outline.border.default`). Everything else is the page's: which statuses there are, what they are called, which tone
each wears, and every number. The breakdown is **not** the `AVStatus` vocabulary — Figma's has *Active* (a grouping) and *Overdue* (a
derived state) — so the segments arrive as data and `StatusTag` keeps owning the statuses themselves.

## Layout

A container query, so it follows the card, not the screen. With room, the profile, the two figures and the breakdown share one row;
when the breakdown (at least 24rem) does not fit beside them it drops to its own line, full width. Segments share the breakdown's
width **in proportion to their counts**, each at least 100.

## Tokens

The card is `surface.elevated` with a `stroke.subtle` outline, `radius.md`, `space.16` all round. Figures: 24 medium (the marked
exception below) in `text.primary`, over their `body-sm-medium` `text.tertiary` labels; the status counts are `body-lg-medium`.
Contrast on the card: `text.primary` **20.17:1** light / **14.63:1** dark; `text.tertiary` **7.58:1** / **9.85:1**.

**Differences from Figma, on purpose.**

- **Active is `brand` blue** (`surface.brand.strong`), the blue the dashboards' In Progress card uses. Figma draws it `#818cf8` — an
  indigo that is bound to no variable, and the system has no indigo.
- **The avatar is 36** (`lg`, the system's largest); Figma's profile image is 40.
- **"Total AVs"** is the default label; Figma's text reads "Total Avs".
- **24 medium has no step** on the type ramp (`heading-lg` ships bold, semibold and regular), so it is the one marked exception,
  the same as `StatCard`'s and `DomainBudgetSummary`'s. A `heading-lg-medium` in GDL would remove it from all three.

## Accessibility

- A `section` named "My Values statistics". The breakdown is a **list** ("Status breakdown"), one item per status reading its
  count then its name, so the bar's meaning is in the text. The bars are decorative and hidden — colour is never the only signal.
- The avatar is decoration (the name is beside it), the green dot likewise.

## Don't

- **Don't compute the totals here.** Pass them in; Total is not the segments' sum.
- **Don't re-derive a status's tone at every call site.** The page maps its statuses to the five tones once.
- **Don't use it for a count that is not a breakdown.** A single figure is a `StatCard`.
