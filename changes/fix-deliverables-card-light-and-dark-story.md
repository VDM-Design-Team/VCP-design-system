---
bump: patch
---
### `DeliverablesCard`, `UserMenu`, `NotificationPopover` — the Light and dark stories render whole (November 2026)

Stories only. Each Light and dark story cleared the meta's decorators with `decorators: []`, which
doesn't remove them, so the meta's frame still wrapped both themes:

- **DeliverablesCard:** both themes were squeezed into one 26rem card's width, so the link titles
  vanished and the drop area wrapped a word per line. Each theme now gets its own half (stacked on a
  narrow screen) with the card at its page width.
- **UserMenu:** both themes were squeezed into the 288×256 frame and the open menus hung off the dark
  panel. The story now spans the page, as in the top bar.
- **NotificationPopover:** the themes were stacked, so the lower bell had no room below it on most
  screens and its panel opened upward over the upper one. They now sit side by side, so both panels
  open downward; a canvas narrower than both scrolls sideways.

The meta decorators now skip those stories (`layout: 'fullscreen'` in DeliverablesCard and UserMenu;
`frame: 'none'` in NotificationPopover, where every story is fullscreen).
