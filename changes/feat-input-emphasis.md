---
bump: minor
---
### `emphasis` on the value fields — filters read regular (November 2026)

`Input`, `Select`, `SearchSelect` and `DateField` take `emphasis: 'regular' | 'medium'`: the weight of a *chosen* value (the placeholder is regular either way). Each keeps the weight it had by default — `Input` regular, `Select` and `SearchSelect` medium — so nothing changes unless it is set. **A filter passes `emphasis="regular"`**, so a row of filters sits quietly while a chosen value in a form stays medium. `DateField`'s chosen date is now medium by default (it was regular, via `Input`) so it reads like the selects beside it in a form; its existing day-mode fields, such as the Add Required Details dialog's, change look. `PlanningFilters`' status and priority use `regular`.
