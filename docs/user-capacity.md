# UserCapacity

How each person's capacity for a cycle is spent: a title (with an optional hint), one row per person (their name, a stacked bar, their total), and one legend for them all. Built to Figma's `User_Capacity` (`4217:32697`) and `_User_Capacity_Member_Row`.

## Composed of

| Piece | Tier |
|---|---|
| `LegendItem` | atom |
| `Skeleton` | atom |
| `CardHeader` | component |
| `CapacityBar` | component |
| `TruncatedText` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `UserCapacity` | One bar per person |
| `TeamCapacity` | One bar for the whole team |
| `CapacityBar` | A single bar in a layout of your own |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `members` | `{ id, name, segments }[]` | required | One row each, in the order given. A row's total is the sum of its segments |
| `title` | `string` | `User Capacity` | The heading, and the region's name |
| `hint` | `string` | — | Explains the card, behind an info glyph (a real button, "About User Capacity"). Omit it and there is no glyph |
| `unit` | `string` | `pts` | After each total |
| `scale` | `row \| shared` | `row` | `row`: every bar fills its track, as Figma draws it. `shared`: each bar is its share of the **largest total**, so a part-timer's row is visibly shorter. **Not in Figma** |
| `empty` | `ReactNode` | "No one has capacity in this cycle." | What it says with no members |
| `loading` | `boolean` | — | Five placeholder rows and a status; the section is `aria-busy` |
| `className`, `ref` | | | On the section |

## It is data

Pass `members`; each row's bar, its total and the legend follow. The legend is the series **across all the rows** (so "Leave" shows only when somebody has some), in the system's order. Colours are `CHART_SERIES`'s (see `docs/capacity-bar.md`).

**Many people** make a longer list: nothing here scrolls or paginates, so cap or page `members` in the caller for a large team.

## Layout and responsiveness

A container query. With room (28rem and up) a row is one line: the name (124 wide, cut with "…" and the whole name on hover and focus when it doesn't fit), the bar, and the total (50 wide, right-aligned). Narrower, the name takes a line of its own over the bar and the total, and nothing overflows. The card is `surface.elevated`, `radius.md`, `space.24` all round; rows are `space.12` apart.

## Tokens

| Part | Style | Colour |
|---|---|---|
| Title | `title-sm-semibold` | `text.primary` |
| Name | `label-sm-medium` | `text.primary` |
| Total | `label-sm-semibold` | `text.primary` |

Figma sets the name in `#212b36`, which is not a token; it is `text.primary` here.

## Accessibility

- A `section` named by its title.
- The rows are a list; each is its name, a bar that is one image ("Completed 15, Committed 15, total 30 pts") and the total.
- A cut name is a tab stop only while it is cut (`TruncatedText`); the full name is always in the page.
- The legend is a list named "Legend"; the info glyph is a focusable button (`InfoHint`, through `CardHeader`, wrapping the system `Tooltip`).
- Loading: one `status` ("Loading User Capacity"), the placeholders hidden from assistive tech.

## Don't

- **Don't pass totals.** They are the sum of each row's segments.
- **Don't draw a row's legend.** One legend serves them all.
- **Don't put hundreds of people in it.** Page the list in the caller.
