---
bump: minor
---
### `AVTable` — BESA Passed, Rejected and Backlogged indicators (November 2026)

A row can now carry `besaPassed` (a green seal after the reference, "BESA Passed"), `rejected: { reason }` (a red warning glyph at the end of the details) and `backlogged: { reason }` (a grey info glyph), each with its tooltip, after Figma's `_AV_Table_ID`, `Rejected_AV_Indicator` and `Backlogged_AV_Indicator`. Backlogged is grey where Figma draws it green, so green in a row means BESA Passed alone; the seal keeps Figma's green, a known exception to the 3:1 rule in the light theme (both decided 17 November 2026). Each tooltip says what the glyph is first ("BESA Passed", "Rejected: the reason", "Backlogged: the reason"); they are buttons named by that sentence so the keyboard reaches it. A new Flags story hovers one and checks the reason and the seal's place.
