---
bump: minor
---
### `BudgetTable` — edit every domain's quarterly budget (November 2026)

New pattern, built to Figma's `Domain Budget Edit` page: one row per domain with an allocation field (`Stepper` `up-down`, with its empty "Set Budget" state), the points consumed against it as a bar, Remaining (derived, red when negative) and an optional note that grows when focused. Remaining and the bar follow the allocation: at once for a nudge, after a brief pause (`commitDelay`, 600 ms) for typing. The bar's status is `DomainBudgetSummary`'s `budgetStatus`, so the two never disagree. It is controlled and saves nothing: Save Changes, its loading state and the "Changes Saved" toast are the page's. A `loading` state keeps the headers and shows placeholder rows. The stories show the page around it: quarter and year (a 40-high segmented control and select), Save Changes, the success toast, an error toast for a save that fails (the table keeps what was typed), and the browser's leave-page prompt for unsaved changes.
