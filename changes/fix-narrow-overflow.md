---
bump: patch
---
### `DomainBudgetSummary`: a too-narrow card no longer widens the page (November 2026)

The card scrolls sideways when it is narrower than 512, but its visually hidden "of 90" text (`sr-only`, absolutely positioned) was not clipped by that scroll, so on a phone the whole page scrolled sideways by about 76px. The card is now the containing block (`relative`), which keeps the hidden text inside it. The `Narrow` stories of `DomainBudgetSummary` and `CyclePerformance` put the card in a fixed 560 / 384 wide box; those boxes now give way on a screen narrower than that (`max-w-full`), so the stories no longer scroll the page.
