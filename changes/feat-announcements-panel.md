---
bump: minor
---
### New `AnnouncementsPanel` (pattern): the Announcements tab of Settings (November 2026)

The overview, the list and the dialogs behind it, built to Figma's `Announcements` tab: **New Announcement** opens "Create Announcement", a row's **Edit** opens it filled, **Delete** asks first (`ConfirmDeleteModal`, with the title), and **View Changelog** and **Refresh** ask the page. The page passes the announcements and answers `onCreate`, `onUpdate` and `onDelete`; a callback may return a promise, the dialog closes on success and **stays open if it rejects**.

After a delete, focus goes to the next row's menu button, the previous one if it was the last, or New Announcement when the list is empty. All five callbacks are required (the table always draws its buttons). Controlled, no toasts of its own. Composed of `AnnouncementsOverview`, `AnnouncementsTable`, `AnnouncementModal` and `ConfirmDeleteModal`. **It builds on #269 and #270**, which add those pieces.
