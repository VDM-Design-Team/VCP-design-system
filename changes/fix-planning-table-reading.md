---
bump: patch
---
### `PlanningTable` — the initiator said once, and an empty cell reads "Not set" (November 2026)

Fix: the initiator avatar is named "Initiator: Marvin Reed" and its tooltip described it again as "Marvin Reed",
so a screen reader heard the name twice; the tooltip now shows without describing (`describe={false}`). An empty
Start Date, Due Date or Points cell put "Not set" in an `aria-label` on a plain `span`, which ARIA does not allow
and most screen readers skip, reading "dash"; the hyphen is now hidden from them and "Not set" is the cell's text.
