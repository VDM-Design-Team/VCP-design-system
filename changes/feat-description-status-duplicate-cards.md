---
bump: minor
---
### `DescriptionCard`, `StatusHistory`, `DuplicateToOtherDomain` — three cards from the AV page (October 2026)

**`DescriptionCard`** (component): one numbered entry in an AV's description, a coloured number
block and the paragraph beside it. Four types: `problem`, `solution`, `deliverable`,
`desired-outcome`. Reading, or `editing`: the paragraph becomes a text field that grows with what is
typed, with an invalid state and an optional remove button.

**`StatusHistory`** (component): the collapsible bar that holds the status log, a clock,
"Status History (n)" and a caret. A disclosure wired as one (heading, button with
`aria-expanded` / `aria-controls`, labelled region); controlled or uncontrolled. Open, it shows `entries`: who
changed the status, from which to which (a neutral `Tag`, then a `StatusTag`), and when.

**`DuplicateToOtherDomain`** (component): the "Duplicate to other Domains" card, a `fieldset`
with one `Checkbox` per domain, "Initiate to {name} assignment". The domains are passed in and
never include the current one; controlled or uncontrolled. `onChange` reports which option just
changed as well as the whole set, because ticking one usually opens a section.

No new tokens. `DescriptionCard`'s `deliverable` type uses `accent.info` and `desired-outcome` uses
`surface.neutral.stronger` as stand-ins: the design's cyan is on no ramp and the darkest slate has no
surface token.
