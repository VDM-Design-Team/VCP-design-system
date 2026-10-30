---
bump: patch
---
### `Modal` / `Popover` — Escape closes the open popup first, then the dialog (October 2026)

Fix: with a `Popover` or a `Menu` open inside a dialog, Escape closed the whole dialog. Now the first Escape closes only the popup and the dialog stays open; the next Escape closes the dialog. A dialog over a dialog still closes the inner one first.

The rule any popup follows to get the same: when your popup is open and Escape closes it, call `event.preventDefault()`, and the dialog skips that Escape. `Popover` (and so `Menu`) and `InlineEdit` do. See "Escape and the popups inside" in `docs/modal.md`. No API change.
