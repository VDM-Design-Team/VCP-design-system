---
bump: minor
---
### `DomainPage` — the Super Admin's Domain page (November 2026)

New pattern: the main content of the Domain page, the page title and then `TagManagement` (Domains and Global Tags, with the Add New, rename and delete dialogs), laid out once (32 in from the sides, as `AVListPage` does), so the app only passes the lists and the callbacks inside `AppShell`. Controlled, holding no data. Built to Figma's `Domain Page` (the page, Add New Tag, Add New Domain and Delete Domain). `docs/tag-management.md` now says it is the page's content, as the Admin Panel tab of Settings is for a Design Admin.
