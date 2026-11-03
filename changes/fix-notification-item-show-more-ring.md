---
bump: patch
---
### `NotificationItem` — "Show more" shows its whole focus ring (November 2026)

Fix: on a long comment preview, the keyboard focus ring around "Show more" / "Show less" was cut off at the top and bottom by the preview card, which clips its overflow, so only its two sides showed, like brackets. The ring is now drawn inside the button, so it shows whole. No API change.
