---
bump: minor
---
### `DescriptionCard`, `DescriptionSection`, `StatusHistory`, `DuplicateToOtherDomain` — the cards from the AV page (October 2026)

**`DescriptionCard`** (component): one numbered entry in an AV's description, a coloured number
block and the paragraph beside it. Four types: `problem`, `solution`, `deliverable`,
`desired-outcome`. Reading, or `editing`: the paragraph becomes a text field that grows with what is
typed, with an `error` (the critical border and a message under the card) and an optional remove button inside the card's right edge, which appears on hover and while the card has focus (always on a touch screen).

**`DescriptionSection`** (component): the frame around a block of the description, a title with an optional round add button, the numbered cards as an ordered list, and the attached files with a paperclip to attach more. The cards are its children and the files its `attachments`; pass `onAdd` and `onAttach` for an editor and neither for a view. Every section folds: a caret button at the right of the header hides the cards and files (hidden, not unmounted), with a short slide.

**`StatusHistory`** (component): the collapsible bar that holds the status log, a clock,
"Status History (n)" and a caret. A disclosure wired as one (heading, button with
`aria-expanded` / `aria-controls`, labelled region); controlled or uncontrolled. Open, it shows `entries`: who
changed the status, from which to which (a neutral `Tag`, then a `StatusTag`), and when.

**`DuplicateToOtherDomain`** (component): the "Duplicate to other Domains" card, a `fieldset`
with one `Checkbox` per domain, "Initiate to {name} assignment". The domains are passed in and
never include the current one; controlled or uncontrolled. `onChange` reports which option just
changed as well as the whole set, because ticking one usually opens a section.

**`RemoveButton`** (atom): the small critical ✕ that takes an item out of a list. `tonal` is the glyph on a filled disc, used by `DescriptionCard` and `FileAttachment` (whose remove button now uses it) so the two match; `plain` is the bare glyph. Icon only, with a required name and a 40 target.

No new tokens. `DescriptionCard`'s `deliverable` type uses `accent.info` and `desired-outcome` uses
`surface.neutral.stronger` as stand-ins: the design's cyan is on no ramp and the darkest slate has no
surface token.
