---
bump: minor
---
### `FilterBar` — labelled fields in Figma's order, under the search (November 2026)

Decided 10 Nov 2026: every list's filters follow Figma's Manage table. The search sits at the left with Reset and Filters (now the filled button) at the right; the fields go under them, each with its label above, in Figma's order: Priority, Tags, Status, Date, then Cycle and the people. A filled people field holds just the name, since its label says which. The period field is labelled and named "Date" (Figma's word); `period.label` changes it.

Migration: nothing to change at call sites. A test that finds the period by the name "Period" now finds "Date"; a test that reads "Assignee: Amy Lee" in the field now reads "Amy Lee".
