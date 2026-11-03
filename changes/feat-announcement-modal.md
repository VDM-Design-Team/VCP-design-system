---
bump: minor
---
### `AnnouncementModal` — create or edit an announcement (November 2026)

New pattern, built to Figma's "Create Announcement" dialog: Title and Version (required), Description, Changelog Document URL, Announcement Type (a list the page passes in) and a Features list (add a line, delete a line, blank lines dropped). `mode="edit"` titles it "Edit Announcement" with **Save**. It keeps its own draft and hands it to `onSubmit`; a missing Title, Version or Type, a non-semantic version and a non-`http(s)` URL are said under the field (Figma draws none; the words are ours), and `errors` carries server messages. Removing a feature line moves focus on.
