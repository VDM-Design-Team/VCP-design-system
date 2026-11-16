---
bump: minor
---
### `AVPage` — a banner for a rejected or backlogged AV (November 2026)

New `banner` prop: a `Banner`, the width of the left column, above the title. Figma's `AV Was Rejected/Backlogged` page draws a critical one, "This Task was rejected", with the reason under it, and a warning one, "Remarks", with the feedback under it; the initiated page names the domain ("This Task was rejected in Development Domain", "Remarks from Development Domain"). New `rejectedBanner()` and `backloggedBanner()` write those two (tone, headline copy, `live: 'off'`); the page passes the reason or feedback. Two stories cover them. Until now the page had nowhere to put a notice, so the design's banner could not be placed.
