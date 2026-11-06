---
bump: minor
---
### `CycleSummary` — how a cycle went (November 2026)

New, built to Figma's `Cycle_Summary`: points committed, completed and carried over (each with its coloured dot), and a half-ring `DonutChart` gauge of the completion rate. The gauge's band colour — green at 90% and above, amber 70–89%, red below, grey with "-%" when there is no rate — is owned by the card (`completionBand`). It reflows by its own width with a container query: four across, two by two, stacked. The completion rate is the caller's.

The completion band is picked from the rate **as shown** (rounded first): 89.5 reads "90%" and is green, 69.5 reads "70%" and is amber. The gauge is named "Completion" and valued by its number, so a screen reader no longer hears the percentage twice; with no rate it says "No rate yet" instead of announcing 0.

Review polish: the figure dots use the chart tones (`surface.brand.strong`, `accent.success.filled.surface`, `accent.warning.filled.surface`) instead of a button surface, a border and a text colour, (Carried Over's dot is nearly the same brown in light, amber in dark); the gauge sits 24 from its divider instead of centred; a figure's title and value are 4 apart; stacked, each cell follows its content instead of a fixed 100.
