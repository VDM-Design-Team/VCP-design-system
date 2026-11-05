---
bump: minor
---
### `InCaseYouMissedIt` and `InCaseYouMissedItCard` — the dashboard's "waiting" strip (November 2026)

New, built to Figma's `InCaseYouMissedIt` and `_ICYM_Card`.

- **`InCaseYouMissedItCard`** (component) — one waiting Added Value: who and when, its title, and a tag and message for Overdue, Due Soon, Awaiting Review or Pending (the type vocabulary lives here; pass `days` and the sentence is written for you). The face opens it; a tonal red ✕ in the corner dismisses it (shown on hover and focus, always on touch).
- **`InCaseYouMissedIt`** (pattern) — a titled card over a row of those cards that scrolls sideways, with an arrow at each edge on hover. It owns no state: the caller removes and remembers a dismissed card. Empty renders nothing.
- **Icon:** `clock-user` (and its fill).
