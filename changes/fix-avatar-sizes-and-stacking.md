---
bump: minor
---
### `Avatar` and `AvatarGroup` — four sizes, and the stack's order (October 2026)

Design review of build 20 (#121).

- **`Avatar` has four sizes**, each with its own type: `xs` 16 / 10 (`caption-sm-medium`),
  `sm` 24 / 12 (`caption-md-medium`), `md` 32 / 12 (`caption-md-medium`) and
  `lg` 36 / 14 (`label-sm-medium`). **Two things change for existing callers:** `md`
  text goes from 14 to 12, and `lg` goes from 40 to 36. `xs` is new. Nobody in the
  repo uses `lg` today; the `TopBar` and `AVTable` avatars are `md`, so their initials
  get smaller.
- **No size is 40 any more**, so none meets the 40 minimum target on its own. An avatar
  wrapped in a control needs padding on the control (documented in `docs/avatar.md`).
- **`AvatarGroup` takes the same four sizes** (its `+N` chip and overlap follow), and
  **the leftmost person is now on top** with each one after them behind (it was the
  reverse). Set with `z-index`; the markup and reading order are unchanged.

Migration: none required for `sm`/`md` callers beyond the smaller `md` text.
