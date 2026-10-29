---
bump: minor
---
### `DescriptionCard`, `StatusHistory`, `DuplicateToOtherDomain` — three cards from the AV page (October 2026)

**`DescriptionCard`** (atom): one numbered entry in an AV's description, a coloured number
block and the paragraph beside it. Four types: `problem`, `solution`, `deliverable`,
`desired-outcome`.

**`StatusHistory`** (component): the collapsible bar that holds the status log, a clock,
"Status History (n)" and a caret. A disclosure wired as one (heading, button with
`aria-expanded` / `aria-controls`, labelled region); controlled or uncontrolled; the log is a slot.

**`DuplicateToOtherDomain`** (component): the "Duplicate to other Domains" card, a `fieldset`
with one `Checkbox` per domain, "Initiate to {name} assignment". The domains are passed in and
never include the current one; controlled or uncontrolled.

No new tokens. `DescriptionCard`'s `deliverable` type uses `accent.info` and `desired-outcome` uses
`surface.neutral.stronger` as stand-ins: the design's cyan is on no ramp and the darkest slate has no
surface token.
