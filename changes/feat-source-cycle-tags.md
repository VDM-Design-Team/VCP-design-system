---
bump: minor
---
### `SourceTag`, `CycleTag` — the Figma `Source_Tag` and `Cycle_Tag` (October 2026)

Two new components, both a `Tag` wearing one fixed look. `SourceTag` shows where an Added Value came from: the source's name (`source`) in the info tonal fill with the info outline border, as the design draws it. `CycleTag` shows its cycle: `code`, `start` and `end` (ISO dates), written "C18 (Sep 20, 2025 - Oct 02, 2026)", outlined with the lighter `stroke.default` border, at `Tag`'s 28 tall size. The dates are formatted from the string, with no `Date` or time zone. `formatCycleRange` is exported for anything that lists cycles. No new tokens, and no change to `Tag`.
