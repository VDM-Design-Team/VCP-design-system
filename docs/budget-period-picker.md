# BudgetPeriodPicker

Which quarter's budget is being edited: Q1–Q4 as a segmented control, and the year beside it as a dropdown. Built to Figma's
`_Domain_Budgeting_Quarterly_Selection` and `_Domain_Budgeting_Year_Selector` (the Domain Budget edit page).

## Composed of

| Piece | Tier |
|---|---|
| `SegmentedControl` | atom |
| `Select` | atom |
| `DomainBudgetSummary` | component (only its `Quarter` type) |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `BudgetPeriodPicker` | Choosing the quarter and year of a budget being **edited** |
| `DomainBudgetSummary`'s own pickers | The dense 32-high pair inside the Domain Budget *view* card |
| `SegmentedControl` / `Select` | Any other choice |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `quarter` | `Quarter` (`1 \| 2 \| 3 \| 4`) | required | The quarter shown. Controlled |
| `year` | `number` | required | |
| `years` | `readonly number[]` | required | What the year picker offers |
| `onQuarterChange` / `onYearChange` | `(Quarter) => void` / `(number) => void` | — | A pick. Only a value the controls offer is ever reported |
| `disabled` | `boolean` | — | Locks both — while a save is in flight |
| `className`, `ref` | | | On the wrapper |

It does no date arithmetic: which quarter is current, and what to do when another is chosen, are the page's.

## Heights

**Both controls are 40 high:** the segmented control at its `lg` size and the `Select` at `md`, so they sit as one row.
Figma draws the control at its `L` size; the repo's default segmented control is 48, so `lg` is passed on purpose.

## Accessibility

- The segments are a radio group named "Quarter" (arrow keys move between them, Tab leaves the group); the year is a native
  select named "Year".
- Both hold their 40 height, which is also the minimum touch target.

## Don't

- **Don't mix the two heights.** A 40 segmented control beside a 32 dropdown reads as a mistake: pick one size pair.
- **Don't use it inside the view card.** That card has its own dense pickers.
