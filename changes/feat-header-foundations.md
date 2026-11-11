---
bump: minor
---
### A 36 high `compact` size, and a `PageTitle` that holds a view switch and a row of filters (November 2026)

A page header with a view switch and a row of filters needs every control at one height. 36 is the height a small `Button` and a medium `SegmentedControl` already have, so `Select`, `Input`, `SearchSelect` and `DateField` gain `size="compact"` (36), between small (32) and medium (40); small and medium are unchanged. `DateField` also takes `edge`, as `Input` does.

`PageTitle` gains `beside` (a slot beside the title, for a view switch; the left group wraps so the switch drops under the title in a narrow page). Its `actions` slot now wraps, is capped to the band's width and shares a centre line with a one-line title (it sat 5 above the middle of 36 high controls); with a `subtitle` the actions stay at the top as before.
