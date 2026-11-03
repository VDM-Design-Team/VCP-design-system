# SuperAdminMetrics *(pattern)*

The super admin dashboard's numbers for one domain and one month: who is doing what, how the work is going, how reviews end.
Built to Figma's `SuperAdmin_Dashboard_Metrics` (the `SuperAdmin Dashboard` page of `VCP Pages & Flows`).

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `Select` | atom |
| `Skeleton` | atom |
| `DateField` | component (`mode="month"`) |
| `StatCard` | component |

`StatCardGroup` is `StatCard`'s sibling in the same module. Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `SuperAdminMetrics` | The super admin dashboard's metric block |
| `StatCard` (`default`) | The admin and user dashboards' Value_Cards |
| `CycleSummary` | How one *cycle* went |
| `DomainBudgetSummary` | One domain's quarterly point budget |

## What it shows

| Row | Cards | Accent and icon |
|---|---|---|
| Filters, top right | A domain `Select` and a `DateField` in `month` mode, both 40 high, 14rem wide and **regular weight** (`emphasis="regular"`: filters sit quietly) | |
| Single cards | **Values Created** | `info`, `note-pencil-fill` |
| | **Values Completed** | `success`, `check-square-fill` |
| | **Overdue Value Rate** (`%`) | `critical`, `calendar-x-fill` |
| | **Active / Total Users** (`12 / 15`) | `neutral`, `users-fill` |
| Grouped (`StatCardGroup`) | **Avg. Time**: In Pending (`days`), In Review (`days`) | `yellow`, `clock-fill`; `info`, `chat-dots-fill` |
| | **Review**: Acceptance Rate (`%`), Values Rejected | `info`, `thumbs-up-fill`; `critical`, `x-circle-fill` |

Every figure has an ⓘ with Figma's copy (`SUPERADMIN_METRIC_HINTS`; override any with `hints`).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `metrics` | `SuperAdminMetricsData` | required | `valuesCreated`, `valuesCompleted`, `overdueRate`, `activeUsers`, `totalUsers`, `avgPendingDays`, `avgReviewDays`, `acceptanceRate`, `valuesRejected`. The rates and averages are `number \| null` |
| `domains` / `domain` / `onDomainChange` | `readonly string[]` / `string` / `(domain) => void` | required / required / — | The filter's options (named as they read: "Development Domain"), the choice, and a pick |
| `month` / `onMonthChange` | `string` / `(iso) => void` | required / — | Any ISO date in the month; a pick reports the **first of the month** |
| `loading` | `boolean` | — | Each figure becomes a placeholder; the section is `aria-busy` |
| `hints` | `Partial<SuperAdminMetricsHints>` | Figma's copy | |
| `className`, `ref` | | | On the section |

## It owns no numbers

Every figure arrives in `metrics`; what "overdue" or "active" means, and the arithmetic, are the product's — the tooltips say what
each is. The one rule it has is how an unavailable figure reads:

| Case | Reads |
|---|---|
| A count with nothing to count (Values Created, Values Rejected, Active users) | `0` — a real zero |
| A rate or average that cannot be worked out (`null`): Overdue Value Rate with no Active Values, an average with nothing to average, Acceptance Rate with nothing reviewed | `--`, with its unit still beside it |

That is Figma's empty state: counts at 0, the rest at "--", users "0 / 0".

## Layout

A container query, so it follows the section, not the viewport. The single cards are a wrapping row: **Values Created, Values Completed
and Overdue Value Rate share the width equally** (each at least 15rem), and **Active / Total Users is a fixed 16.5rem** (Figma's 264) —
the least important figure, so the narrow one, never wider than the row. As the row runs out of room the cards wrap. The grouped
cards sit side by side from 48rem, then stack.

## Tokens

None of its own. The cards are `StatCard`'s `superadmin` look — an 8 stripe, centred, 150 high, the value `heading-xl-semibold` — and
the grouped cards are `StatCardGroup`'s. Stripe and icon colours are the accent families' `outline.border.default` tokens; the In
Pending clock is the `yellow` accent (`accent.yellow.medium`), as the Pending card on the other dashboards.

## Accessibility

- A `section` named "Domain metrics". The cards add no headings (a `StatCard` label is a `span`), so a dashboard of metrics does not
  flood the outline.
- Each ⓘ is a real, focusable button ("About Values Created") that opens its definition on hover **and** focus.
- The filters are a native select named "Domain" and a read-only `combobox` named "Month".
- Loading: the section is `aria-busy`; the labels, filters and tooltips stay, only the figures are placeholders.
- Status is never colour alone: each card is named by its label, and the stripe and icon only confirm the category.

## Don't

- **Don't compute the figures here.** Pass them in; pass `null` for one that cannot be worked out.
- **Don't show `0` for a rate with nothing behind it.** A 0% overdue rate and "no Active Values yet" are different things; the second is `--`.
- **Don't use it on the admin or user dashboard.** Their cards are `StatCard`'s `default` look.
