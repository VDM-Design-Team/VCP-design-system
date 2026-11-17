---
bump: minor
---
### `AVPage` — a banner for a rejected or backlogged AV (November 2026)

New `banner` prop: a `Banner`, the width of the left column, above the title. Figma's `AV Was Rejected/Backlogged` page draws a critical one with the reason under it and a warning one with the feedback under it; the initiated page names the domain. New `rejectedBanner()` and `backloggedBanner()` write those two (tone, headline copy, `live: 'off'`); the page passes the reason or feedback. The headlines are "This Added Value was rejected" and "This Added Value was moved to the backlog" (with "in Development Domain" when another domain did it), not Figma's "This Task was rejected" and "Remarks" (decided 17 November 2026). Two stories cover them. Until now the page had nowhere to put a notice, so the design's banner could not be placed.
