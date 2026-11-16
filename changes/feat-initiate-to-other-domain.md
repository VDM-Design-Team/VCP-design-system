---
bump: major
---
### `InitiateToOtherDomain`, `DetailCard` — "Duplicate" becomes "Initiate" (November 2026)

`DuplicateToOtherDomain` is now `InitiateToOtherDomain`, and its title reads "Initiate to other Domains": the options already said "Initiate to Development assignment", Figma's frame is "AV Initiated (to other domain)" and the status is "Initiated". It is still a group of checkboxes, several at once, and `value` and `onChange` are unchanged. `AVPage`'s `duplicate` prop is now `initiate`.

The Detail Card follows: its "Duplicates" row now reads **"Initiated to"**, the card type `duplicate` is `initiated`, the value's `duplicates` is `initiatedTo`, and the `DetailCardDuplicate` type is `DetailCardInitiatedDomain`.

New on the card: a `disabled` card now says why. It is for an Added Value that came from another domain and is edited in the second, and it shows a line under the title, "This Added Value came from another domain, so it can't be initiated to others from here." (`disabledReason` to change it), which a screen reader hears as the group's description.

Migration: import `InitiateToOtherDomain` (and `InitiateToOtherDomainProps`, `InitiateDomainOption`) instead of `DuplicateToOtherDomain`, `DuplicateToOtherDomainProps`, `DuplicateDomainOption`; its props are the same. Rename `AVPage`'s `duplicate` prop to `initiate`. On `DetailCard`, pass `type="initiated"` instead of `type="duplicate"`, `value.initiatedTo` instead of `value.duplicates`, and use `DetailCardInitiatedDomain` instead of `DetailCardDuplicate`.
