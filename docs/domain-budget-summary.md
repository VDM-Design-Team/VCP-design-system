# DomainBudgetSummary

A domain's development-point budget for one quarter, on the admin dashboard: what was allocated, what is consumed, what
remains, which quarter this is, and a bar of how much of the budget is used. Built to Figma's `Domain_Budget_Admin_View`
(the `Domain Budget Dashboard View` page of `VCP Pages & Flows`).

## Composed of

| Piece | Tier |
|---|---|
| `Badge` | atom |
| `Button` | atom |
| `Divider` | atom |
| `Icon` | atom |
| `ProgressBar` | atom |
| `Select` | atom |
| `Tooltip` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DomainBudgetSummary` | One domain's quarterly point budget, with the quarter pickers |
| `StatCard` / `StatCardGroup` | Headline figures that are not a budget |
| `CycleSummary` | How a *cycle* went — committed, completed, carried over |
| `ProgressBar` | A meter anywhere else |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `allocated` / `consumed` | `number` | required | Points. Remaining is `allocated − consumed`, derived here so the three never disagree |
| `quarter` / `year` | `Quarter` (`1 \| 2 \| 3 \| 4`) / `number` | required | The quarter shown. Controlled |
| `years` | `readonly number[]` | required | What the year picker offers |
| `period` | `DomainBudgetPeriod` | required | `current` (`endsOn`, `daysLeft`, `daysTotal`), `past` (`startedOn`, `endedOn`) or `upcoming` (`startsOn`, `endsOn`). Dates are strings the caller has formatted ("Mar 31") |
| `onQuarterChange` / `onYearChange` | `(Quarter) => void` / `(number) => void` | — | A pick in the pickers. Only a value the pickers offer is ever reported |
| `onGoToCurrent` | `() => void` | — | "Go to Current Quarter", which shows only for a past or upcoming `period` |
| `title` | `string` | `Domain Budget` | The heading |
| `className`, `ref` | | | On the section |

Which quarter is the current one, its dates and its days left are the caller's: a date calculation is not this card's to make.

## The budget status

**This card owns the status, once** (`budgetStatus`, with `budgetUsage` for the percentage):

| Used | Status | Bar |
|---|---|---|
| under 75% | `fine` | brand blue |
| 75–99% | `warning` | warning |
| 100% and over | `over` | critical, capped at 100% |

With no allocation there is nothing to measure against: nothing consumed reads 0% and fine, anything consumed reads over.
Remaining is green until it goes negative, then red. Figma draws it green at every level but over.

## Layout

A container query, so it follows the card, not the viewport. With room (64rem and up) the points box and the quarter details sit side
by side, 55 / 45, as Figma draws them; narrower, the quarter details drop beneath the points. The quarter and year pickers and
"Go to Current Quarter" wrap under the heading when the row runs out.

**It is never squeezed past what its figures need.** The content has a minimum width of 32rem (512), which is what the three
points and their dividers take. A card narrower than that plus its padding (560) doesn't truncate or overlap anything:
the **whole card scrolls sideways** (`overflow-x: auto` on the section). The tooltips are portalled, so the scroller doesn't clip them.

## Tokens

The card is `surface.elevated`, `radius.md`, `space.24` all round, no outline — the same as `CycleSummary`. The points box has a
`stroke.default` outline and `space.36` between its figures and the `Divider`s between them.

| Part | Style | Colour |
|---|---|---|
| Heading | `title-sm-semibold` | `text.primary` |
| Point label | `body-sm-medium` | `text.secondary` |
| Point figure | `heading-xl-bold` | `text.primary`; Remaining `accent.success.outline.content`, or `accent.critical.outline.content` when negative |
| "pts", quarter value, dates | 24 medium | `text.secondary` for the details; the figure's colour for "pts" |
| Detail labels | `body-sm-medium` | `text.tertiary` |

| Pair, on the card (`surface.elevated`) | Light | Dark |
|---|---|---|
| Figures (`text.primary`) | **20.17:1** | **14.63:1** |
| Point labels, quarter and dates (`text.secondary`) | **10.35:1** | **11.87:1** |
| Detail labels (`text.tertiary`) | **7.58:1** | **9.85:1** |
| Remaining, in budget (`accent.success.outline.content`) | **4.95:1** | **6.60:1** |
| Remaining, overspent (`accent.critical.outline.content`) | **4.77:1** | **5.06:1** |

**Differences from Figma, on purpose.** The figure is `heading-xl-bold` (32), not Figma's 28, which has no step on the
ramp — the same call `StatCard` made. The 24 medium for "pts" and the details has no step either (`heading-lg` ships bold,
semibold and regular), so it is the one marked exception, as in `StatCard`. The bar is `ProgressBar`'s 8 high, not Figma's 12 (its label row is below the bar, as Figma draws it, but in the atom's caption type), and its
warning fill is the atom's accessible `accent.warning.filled` rather than Figma's bright yellow: the warning border token
moved to yellow-700 for contrast in November and Figma still shows the old one.

## Accessibility

- A `section` named by its heading, so a screen reader announces "Domain Budget, region".
- Each info glyph is a real, focusable `button` named "About Allocated" (and so on) wrapping the system `Tooltip` — the definition is
  reachable by keyboard, not only on hover. The glyph is 20, with a 40 press area.
- "Go to Current Quarter" goes away once the current quarter shows, so focus moves to the quarter picker instead of dropping to the page.
- The bar is a `role="progressbar"` named "Budget Usage", with its value in percent, so what is announced is what is shown.
  The status is also in the numbers beside it (a negative Remaining, "100%"): colour is never the only signal.
- The pickers are native selects named "Quarter" and "Year".
- "Days left" reads "48 of 90": the slash is hidden from assistive tech and "of" read instead.

## Don't

- **Don't map a number to a tone at the call site.** The bands live in `budgetStatus`.
- **Don't pass a third number for Remaining.** It is `allocated − consumed`.
- **Don't use it for a cycle** — a cycle's committed / completed / carried over is `CycleSummary`.
- **Don't put several of these side by side to compare domains.** It is one domain's quarter; a comparison is a table.
