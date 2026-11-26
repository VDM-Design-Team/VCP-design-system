---
bump: patch
---
### `DomainBudgetSummary` — the quarter details wrap instead of clipping (November 2026)

The points and the quarter's details went side by side at a fixed card width (64rem) and squeezed the details to
fit, so a long date ("31/12/2026") ran through its gap into the divider when the card was 1080–1200 wide (the
prototype's Dashboard at a 1440 window) and at 600. Now each figure is at least as wide as its value, and the
details wrap beneath the points whenever the two don't fit side by side; with room they share it 55:45 as before.
