---
bump: patch
---
### `surface.track` — the dark track shows on a card: slate-700 (November 2026)

Fix: in dark, the grey track behind `ProgressBar` and `DonutChart` was slate-800, the same colour as a card (`surface.elevated`), so on a card it disappeared. A partly filled bar or ring lost its remainder and read as a loose stripe or arc. An empty gauge, such as the Cycle Summary's before it has a rate, drew nothing but "-%". It is now slate-700, one step up: **1.41:1** on a dark card and 1.72:1 on the canvas, a little more than the light track's 1.23:1 on white. Light is unchanged.

The cost: against the lighter track, three dark fills drop under 3:1, critical (2.72:1), info (2.75:1) and pending (2.91:1). Each still clears 3.84:1 against the card around the meter, and every meter announces its value, so the colour is never the only signal. The others stay above 3:1: brand 4.48, success 3.22, warning and caution 5.42. `docs/progress-bar.md`, `docs/donut-chart.md` and `docs/password-strength.md` carry the new figures. Figma's dark `surface/track` variable wants the same value.

No API change.
