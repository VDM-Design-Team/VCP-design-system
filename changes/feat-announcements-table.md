---
bump: minor
---
### Announcements tab: `AnnouncementsTable`, `AnnouncementsOverview`, `MetricTile` (November 2026)

New **`MetricTile`** (a number with its name and a tinted icon tile — the quiet settings tile, not a dashboard `StatCard`), new **`AnnouncementsOverview`** (the title card and three facts: total, latest version, last updated), and new **`AnnouncementsTable`**: New Announcement, View Changelog and Refresh above, and Version / Title / Type / Date / Features with an Edit and Delete menu on every row. Controlled: every button only asks. "New Announcements" in Figma is **New Announcement**. Figma's purple Last Updated tile has no token, so it is `brand` for now.

**One record** (`Announcement`, `lib/announcement`): a row is its `id`, `title`, `version`, `kind`, `date` and `features`, and the overview takes its `version` and `date`, so a page hands the same object to the table, the dialog and the changelog. **Type** is a tag whose word (Experimental, Update, Feature) and tone come from the one owner of the kinds, `lib/changelog-kinds`; the table maps nothing itself. **Version** is plain text ("v1.18.1"), so a Feature row no longer has two identical blue tags. **Dates** are ISO, shown dd/mm/yyyy or the person's locale (`useDateFormat`) in a `<time>`, in the table and in Last Updated.
