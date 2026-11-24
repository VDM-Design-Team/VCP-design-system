---
bump: major
---
### `DescriptionSection` / `DescriptionCard` — only Problems can be added to and removed (November 2026)

Figma draws the add button on the Problems section alone, and the remove button on the problem card alone. The code now does the same, in the two pieces that own those controls: `DescriptionSection` shows its add button only for `type="problem"`, and `DescriptionCard` shows its remove button only when `type` is `problem` (the default). On a solution, a deliverable or the desired outcome, `onAdd` and `onRemove` are ignored. The reason is that the problem controls a set: adding a problem adds a card to all four sections, and deleting it deletes the set, so problem 1 goes with solution 1, acceptance criteria 1 and outcome 1. The page does both; the components only report the press. This is now written in `docs/description-section.md` ("A problem is a set"). The paperclip is unchanged.

Migration: stop passing `onAdd` to `DescriptionSection` with `type` of `solution` or `deliverable`, and `onRemove` to the cards inside them, since they now do nothing. The page adds and removes whole sets from the problem's controls.
