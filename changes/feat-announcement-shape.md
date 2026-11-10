---
bump: minor
---
### One announcement record, and one owner for its type (November 2026)

New `Announcement` (`src/lib/announcement.ts`): `id`, `title`, `version` ("v1.18.1"), `kind`, `date` (ISO), `description?`, `changelogUrl?`, `features`. The Announcements table, overview, dialog and the System Changelog all take their fields from it, so a page passes one object to all of them and the names agree. It also exports `VERSION_PATTERN` and `formatVersion` ("1.18.1" and "V1.18.1" both become "v1.18.1").

`CHANGELOG_KINDS` (`src/lib/changelog-kinds.ts`), the one owner of an announcement kind's glyph, colour and words, now also holds each kind's **Type word** (Experimental, Update, Feature) and **tag tone** (success, warning, info, the glyph's own hue), and `CHANGELOG_KIND_ORDER` gives the order lists show them. The table's Type tag and the dialog's Type list read these instead of mapping types themselves.

**Renamed to match the record** (both shipped in the System Changelog, days ago): `ChangelogItem` and `ChangelogRelease` take `description` (was `message`) and `changelogUrl` (was `href`). `ChangelogRelease` is now derived from `Announcement`.
