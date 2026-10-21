---
bump: patch
---
### `Modal` — focus-ring room, scroll clearance, one header gap, no empty parts (October 2026)

Fix: the last field's focus ring was clipped at the bottom of the body. The body now keeps 4px of bottom padding with a footer, and the footer's top padding is 4px shorter, so the visible gap stays 20.

Fix: on long, scrolling content the body ran hard against the subtitle. Part of the header-to-body gap now lives in the header, so it stays put while the content scrolls.

Change: the gap between the header and the body is one fixed 12, whether or not there is a subtitle and whatever the body opens with. It was 20, and briefly depended on the body's first element. Split as the header's 8 plus the body's own 4.

Change: an optional part that is empty renders nothing. A blank `description` or `footer` (absent, `false` or an empty string) leaves no empty caption or action row holding space, and a blank `title` no empty heading. No API change: there are no new props.
