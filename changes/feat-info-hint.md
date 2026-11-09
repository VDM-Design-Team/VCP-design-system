---
bump: minor
---
### `InfoHint` — one info icon for every card (November 2026)

New component: the small "i" beside a card's title or a stat's label, with its explanation in a tooltip. A 16 glyph in `text.tertiary`, a real button named "About {label}", the `Tooltip` opening below it, and a **40 press area** around the glyph (a `::after`), so the touch minimum holds without a bigger icon.

It replaces the control `InCaseYouMissedIt`, `StatCard` and `DomainBudgetSummary` each drew by hand, in two sizes (16 beside a card title, 20 beside a label). One size is the precedent now: 16. Visible changes: `StatCard` and `DomainBudgetSummary`'s icons go from 20 to 16, and every hint's pointer target is 40 (it was 16 in `InCaseYouMissedIt` and `StatCard`). `InCaseYouMissedIt`'s hint is unchanged to look at.
