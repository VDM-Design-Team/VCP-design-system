---
bump: patch
---
### `Modal` — focus-ring room, scroll clearance, and no empty parts (October 2026)

Fix: the last field's focus ring was clipped at the bottom of the body. The body now keeps 4px of bottom padding with a footer, and the footer's top padding is 4px shorter, so the visible gap stays 20.

Fix: on long, scrolling content the body ran hard against the subtitle. Part of the header-to-body gap (8 of the 12, or 0 of the 4) is now the header's own padding, so it stays put while the content scrolls; at rest the gaps are still 12 and 4.

Change: the gap between header and body is 12 under a subtitle or when the body opens with a control or card (a button, a form field, a selectable card), and 4 when running text follows a bare title.

Change: an optional part that is empty renders nothing. A blank `description` or `footer` (absent, `false` or an empty string) leaves no empty caption or action row holding space, and a blank `title` no empty heading. No API change: there are no new props.
