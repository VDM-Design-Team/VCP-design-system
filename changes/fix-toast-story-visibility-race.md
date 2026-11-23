---
bump: patch
---
### Story tests — the toast checks wait for the toast to be visible (November 2026)

Four story tests (`UsersTable`, `AnnouncementsTable`, `AccountsTable`, `ContactsTable`) checked that a toast was visible the moment it appeared in the page, while it was still fading in, so they failed now and then on unrelated pull requests. They now wait until the toast is visible. Tests only: no component changes.
