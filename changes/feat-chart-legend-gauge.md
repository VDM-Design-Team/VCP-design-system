---
bump: minor
---
### `LegendItem` — new atom; `DonutChart` — `segmented` (October 2026)

`LegendItem` is one entry in a chart legend — a colour swatch and its word — in
two sizes (`md`: 12 swatch + 12 caption for dashboard charts; `sm`: 8 dot + 10
caption for the Gantt chart) on `ProgressBar`'s tones, so a legend can't drift
from its chart. The swatch is `aria-hidden`; the label is the item.

`DonutChart` gains `segmented`: flat ends and a gap between the filled arc and
the remainder (a quarter of `thickness`) instead of a round-capped fill over a
full track — the flat Cycle Summary gauge. Existing rings are unchanged. No new
tokens.
