---
bump: minor
---
### `AVTable` — BESA Passed, Rejected and Backlogged indicators (November 2026)

A row can now carry `besaPassed` (a green seal after the reference, "BESA Passed"), `rejected: { reason }` (a red warning glyph at the end of the details) and `backlogged: { reason }` (an info glyph), each with its tooltip, as Figma's `_AV_Table_ID`, `Rejected_AV_Indicator` and `Backlogged_AV_Indicator` draw them. They are buttons named "BESA Passed", "Rejected" and "Backlogged" so the keyboard reaches the tooltip. A new Flags story hovers one and checks the reason and the seal's place.
