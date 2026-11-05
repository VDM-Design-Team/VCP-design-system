---
bump: minor
---
### `DomainBudgetSummary` — a domain's budget for one quarter (November 2026)

New, built to Figma's `Domain_Budget_Admin_View`: Allocated, Consumed and Remaining points (each with an info tooltip; Remaining is derived and turns red when negative), the quarter's tag and dates (current, past or upcoming), quarter and year pickers with a "Go to Current Quarter" button when another quarter is being viewed, and a usage bar. The bar's status is owned by the card (`budgetStatus`): under 75% brand blue, 75–99% warning, 100% and over critical. It reflows by its own width with a container query. Controlled: the caller supplies the quarter, year, dates and days left.

**`ProgressBar` — `labelPlacement`.** New `labelPlacement` (`above` by default, or `below`) puts the label row under the bar, as Figma draws Domain Budget's. Nothing changes for existing bars.

Below 560 wide the card stops reflowing and scrolls sideways as a whole, rather than squeezing its figures.
