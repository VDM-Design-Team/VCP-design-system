---
bump: minor
---
### `CycleSummary` — how a cycle went (November 2026)

New, built to Figma's `Cycle_Summary`: points committed, completed and carried over (each with its coloured dot), and a half-ring `DonutChart` gauge of the completion rate. The gauge's band colour — green at 90% and above, amber 70–89%, red below, grey with "-%" when there is no rate — is owned by the card (`completionBand`). It reflows by its own width with a container query: four across, two by two, stacked. The completion rate is the caller's.
