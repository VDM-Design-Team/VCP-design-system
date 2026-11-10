---
bump: minor
---
### `SystemChangelog` and `ChangelogItem` — the admin's list of releases (November 2026)

New atom **`ChangelogItem`** (a release card: the kind's glyph, title and version, "Posted on …", message, Features/Updates bullets) and new pattern **`SystemChangelog`** (a "System Changelog" title over a card per release, with loading and empty states), built to Figma's `Admin System Changelog`.

- **Dates** are ISO and shown through `useDateFormat` (dd/mm/yyyy, or the person's locale) inside a `<time>`. Versions read as given ("v1.18.1").
- **Kinds:** a card's `kind` (`experimental`, `update`, `feature`) draws its glyph and names it for screen readers. The glyph, colour and words now have one owner, `CHANGELOG_KINDS` (`src/lib/changelog-kinds.ts`), which `ChangeLogModal` reads too. `ChangeLogModal` looks and behaves as before.
- **Links:** a card's `href` makes its title a link to the release's changelog document, opening in a new tab.
- **Many releases** are paged with the existing `Pagination` under the cards (`page`, `pageCount`, `onPageChange`), controlled like the tables.
- The title's id is `useId`, so two changelogs on a page each name their own.
