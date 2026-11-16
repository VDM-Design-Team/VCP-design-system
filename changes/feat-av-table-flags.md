---
bump: minor
---
### `AVTable` — BESA Passed, Rejected and Backlogged indicators (November 2026)

A row can now carry `besaPassed` (a green seal after the reference, "BESA Passed"), `rejected: { reason }` (a red warning glyph at the end of the details) and `backlogged: { reason }` (an info glyph), each with its tooltip, as Figma's `_AV_Table_ID`, `Rejected_AV_Indicator` and `Backlogged_AV_Indicator` draw them. Each tooltip says what the glyph is first ("BESA Passed", "Rejected: the reason", "Backlogged: the reason"); they are buttons named by that sentence so the keyboard reaches it. A new Flags story hovers one and checks the reason and the seal's place.
