---
bump: patch
---
### `StatusProgression` — "Move to In Progress", "Return to In Progress" (November 2026)

The shared `In Progress` step's buttons read "Move to In progress" and "Return to In progress", with a lower-case p; Figma's `Status_Progression_*` sets (all eight) draw "Move to In Progress" and "Return to In Progress", and `In Progress` is a proper name everywhere else (the status tag, the chain). The label is now `In Progress`. A story assertion that matched the old text case-insensitively now matches the exact label. The stories' demo chains now spell the steps as Figma does (For Review, Ready for Deploy, Confirmed Prod, Design Review), and a story checks the exact "Return to In Progress".
