---
bump: patch
---
### `NotificationItem` — the emoji palette opens over the next row (November 2026)

In the notification popover, the palette opened from one comment ran under the next row's comment and reactions:
every row's comment sits on the same layer, and the later one painted over it. While something in a row's comment
is open, that comment now goes up a layer, so the palette sits on top of everything.
