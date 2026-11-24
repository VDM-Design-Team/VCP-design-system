---
bump: minor
---
### `FilterBar` — starts collapsed (November 2026)

On top of a table the filter fields are now hidden at first: the search, Reset and Filters show, and Filters opens the rest. A new `defaultFiltersOpen` prop (default `false`) sets where an uncontrolled bar starts; `filtersOpen` still controls it. A page that wants the fields shown on load passes `defaultFiltersOpen` (or `filtersOpen`).
