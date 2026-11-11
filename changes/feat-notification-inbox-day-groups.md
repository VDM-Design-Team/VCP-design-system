---
bump: minor
---
### `NotificationInbox` — rows grouped by day (November 2026)

A new prop, `groups`: the rows under a heading per day ("Today", "Yesterday", "3 November"), each day its own list named
by its heading, so a screen reader can move by day (decided 9 Nov 2026: the inbox groups by day, the popover stays a
flat list). `groupHeadingLevel` sets the headings' level (2 by default). An empty group is left out.
