---
bump: minor
---
### `AnnouncementModal` — create or edit an announcement (November 2026)

New pattern, built to Figma's "Create Announcement" dialog: Title and Version (required), Description, Changelog Document URL, Announcement Type (the three kinds, from `CHANGELOG_KINDS`, as `kind`) and a Features list (add a line, remove a line with the minus-circle, blank lines dropped). `mode="edit"` titles it "Edit Announcement" with **Save**. It keeps its own draft and hands it to `onSubmit`; a missing Title, Version or Type, a non-semantic version and a non-`http(s)` URL are said under the field (Figma draws none; the words are ours), and `errors` carries server messages. Removing a feature line moves focus on.

Its draft is an `Announcement`'s fields (`lib/announcement`); Version is read-only when editing, is handed over as "v1.18.1" whether or not the "v" was typed, and the "Latest version" hint stays visible beside a version error. The footer is `ModalCancel` and `ModalConfirm`.
