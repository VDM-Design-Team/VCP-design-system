---
bump: minor
---
### `CycleSummary` — how a cycle went (November 2026)

New, built to Figma's `Cycle_Summary`: points committed, completed and carried over (each with its coloured dot), and a half-ring `DonutChart` gauge of the completion rate. The gauge's band colour — green at 90% and above, amber 70–89%, red below, grey with "-%" when there is no rate — is owned by the card (`completionBand`). It reflows by its own width with a container query: four across, two by two, stacked. The completion rate is the caller's.

The completion band is picked from the rate **as shown** (rounded first): 89.5 reads "90%" and is green, 69.5 reads "70%" and is amber. The gauge is named "Completion" and valued by its number, so a screen reader no longer hears the percentage twice; with no rate it says "No rate yet" instead of announcing 0.
