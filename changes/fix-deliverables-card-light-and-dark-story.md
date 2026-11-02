---
bump: patch
---
### `DeliverablesCard` — the Light and dark story shows the card at its real width (November 2026)

Story only. The Light and dark story's `decorators: []` didn't remove the meta's 26rem wrapper, so
both themes were squeezed into one card's width: the link titles vanished and the drop area wrapped a
word per line. The meta decorator now skips fullscreen stories, and each theme gets its own half
(stacked on a narrow screen) with the card at its page width.
