---
bump: minor
---
### New `SettingsPage` (pattern): the Settings page's content, for a user or an admin (November 2026)

The title, the tabs and the tab that is showing, built to Figma's Settings pages. The user's and the admin's Settings are one layout with two tab lists, so one piece draws both and `audience` (`user`, `admin`) picks which: **Personal Info · Password · Changelog**, or **Personal Info · Users · Admin Panel · Announcements · Manuals · Password**. `SETTINGS_TABS` exports both.

It is controlled and slot-based: the page passes each tab's body in `panels`, and a tab shows only when it has one, so a page can leave out a tab it has not built. Composed of `PageTitle` and `Tabs`; the bodies (`PersonalInfoForm`, `ChangePasswordForm`, `UsersTable`, `ManualsTable`, `SystemChangelog`) draw their own cards.

On purpose, against Figma: both audiences are titled "Settings" (the admin frame's "Page Title" is a placeholder), and both inset 32 from the sides as `PageTitle` does (Figma has 24 for the user and 32 for the admin).
