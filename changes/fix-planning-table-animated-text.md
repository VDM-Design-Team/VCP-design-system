---
bump: patch
---
### `PlanningTable` — the animated date's text now changes colour (November 2026)

The cell animation (a date calculated for the person) ran a colour animation on a wrapper around the date, but the date's own text sets its colour, so it never inherited it and stayed ink while the sweep crossed. While the animation is live the text inside the wrapper now inherits it, and the date runs black, blue, white, blue, black as Figma draws it. A story test pauses a loop at 35% and checks the date itself is white. The loop is now 2.5 seconds (it was 1.6), the updated design, still three loops. The table inside each Cycle and Backlog card is now inset 24 from the card's edges with no outline of its own (`bare`), as every table in a `TableCard` is; it ran edge to edge before.
