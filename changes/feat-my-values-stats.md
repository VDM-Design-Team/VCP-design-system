---
bump: minor
---
### `MyValuesStats` — the strip across the top of My Values (November 2026)

New, built to Figma's `My_AVs_Stats`: the person's avatar and name, their Total AVs and Completed figures, and a segmented status breakdown whose segments are as wide as their counts (never narrower than 100). A segment with a count is filled in its tone; one with none is an empty outline. It owns one mapping — a tone to its colour — and takes the statuses, labels, counts and totals as data. Too narrow, it wraps the breakdown onto its own line first, and scrolls sideways once that cannot get any narrower.

With every count at 0 the segments share the strip equally, so the empty outlines span the width instead of bunching on the left. Draft's grey is `stroke.strong` (Figma's slate-500 in light, a quiet mid grey in dark). Each segment has the light 2px line down its left, beside its count and name.
