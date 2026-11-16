---
bump: major
---
### `PageTitle` — the `size` prop is removed (November 2026)

`PageTitle` had `size="sm"` (14 medium) beside the default 18 semibold. Nothing in the system used it except one story that showed an AV's reference as a page title, and `AVHeader` already is that case on an Added Value page. The title is 18 semibold, `text.secondary`, always.

Migration: delete `size="sm"` (or `size="md"`) from any `PageTitle`. A page that wanted a quiet reference-style title on an Added Value page uses `AVHeader`.
