---
bump: minor
---
### `BudgetTable` — edit every domain's quarterly budget (November 2026)

New pattern, built to Figma's `Domain Budget Edit` page: one row per domain with an allocation field (`Stepper` `up-down`, with its empty "Set Budget" state), the points consumed against it as a bar, Remaining (derived, red when negative) and an optional note that grows when focused. Remaining and the bar follow the allocation as it is typed. The bar's status is `DomainBudgetSummary`'s `budgetStatus`, so the two never disagree. It is controlled and saves nothing: Save Changes, its loading state and the "Changes Saved" toast are the page's.
