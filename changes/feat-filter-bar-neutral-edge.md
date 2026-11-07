---
bump: minor
---
### `edge` on `Input`, `Select` and `SearchSelect`; `FilterBar` uses the neutral edge (November 2026)

`Input`, `Select` and `SearchSelect` gain `edge`: `strong` (the default, `stroke.strong`, unchanged) or `neutral` (`neutral.outline.border.default`, lighter). `FilterBar`'s search, selects and period button use `neutral`, so a row of filters is quieter beside a table. It is about 2.6:1 on white, below the 3:1 every other field edge holds, so it is a deliberate exception documented in `docs/filter-bar.md`: the fields are also identified by their icons and placeholders, and error, warning and focus edges are unchanged.
