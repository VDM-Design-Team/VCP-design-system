---
bump: minor
---
### `SystemChangelog` and `ChangelogItem` — the admin's list of releases (November 2026)

New component **`ChangelogItem`** (a release card: title and version, "Posted on …", message, Features/Updates bullets) and new pattern **`SystemChangelog`** (a "System Changelog" title over a card per release, with loading and empty states), built to Figma's `Admin System Changelog`. Nothing is formatted inside: the version and date read as given.

Review changes: `date` is an ISO date shown through `useDateFormat` (dd/mm/yyyy, or the person's locale) inside a `<time>` (the separate `dateTime` is gone), the title's id is `useId` so two changelogs on a page name their own, and the examples read "v1.18.1".
