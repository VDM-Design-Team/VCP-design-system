---
bump: major
---
### `InitiateToOtherDomain` — "Duplicate" becomes "Initiate", a radio group with "Don't initiate" selected by default (November 2026)

`DuplicateToOtherDomain` is now `InitiateToOtherDomain`, and its title reads "Initiate to other Domains": the options already said "Initiate to Development assignment", Figma's frame is "AV Initiated (to other domain)" and the Detail Card says "Initiated". It is also a **radio group** now, one choice at a time, with a first option, **"Don't initiate to another domain"**, selected until a person picks a domain (it is the default for most Added Values, a new one included). Figma draws checkboxes; both changes are questions for the design lead, raised in the PR.

`disabled` is for an Added Value handed off from another domain: the card is there with "Don't initiate" selected and nothing can be changed. `AVPage`'s `duplicate` prop is now `initiate`.

Migration: import `InitiateToOtherDomain` (and `InitiateToOtherDomainProps`, `InitiateDomainOption`) from `components/initiate-to-other-domain` instead of `DuplicateToOtherDomain`, `DuplicateToOtherDomainProps`, `DuplicateDomainOption`. `value` and `defaultValue` are now one string, the chosen domain's `value`, or `''` (`DONT_INITIATE`) for none, not a list of ticked values; `onChange(value: string)` replaces `onChange(values, { value, checked })`, so a section for a domain is derived from `value`. Rename `AVPage`'s `duplicate` prop to `initiate`. The Detail Card's "Duplicates" row and `duplicates` value are unchanged for now (its new wording is a question for the design lead).
