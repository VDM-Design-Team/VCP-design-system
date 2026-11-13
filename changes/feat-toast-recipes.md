---
bump: major
---
### `ToastProvider` / `ToastViewport` — top right by default, the stack waits when it is full (November 2026)

**Breaking:** the default `position` is now `top-right` (it was `bottom-right`), and the viewport is 24 from the screen's edges (it was 16), as Figma draws it. A toast is full width below 640 (a phone). **Migration:** pass `position="bottom-right"` to `ToastProvider` (or `ToastViewport`) to keep the old place; nothing else needs to change. Padding is now 24 (16 on a phone).

The stack behaves as one: oldest at the top and each new toast beneath, whatever its tone. A toast that leaves fades and closes and the others move up smoothly (not animated with reduced motion). When there are more toasts than the page has room for, the newest wait, unmounted (no timer, nothing announced), and arrive as room is made. There is no fixed maximum. A toast without a `duration` stays until dismissed. The two live regions are now `display: contents`, so they stay in the page but the toasts are laid out together.

### Toast recipes (November 2026)

New named messages for `toast()`: `missingInput(field, kind?)`, `unavailableAssignee()`, `changesSaved()`, `bulkUpdated({ property, value, count })`, `discarded(reference?)` and `undoDeletion(item, onUndo)`. Each returns the options for `toast()` (tone, title, wording, and timing), so `toast(changesSaved())` reads the same on every page. `docs/toast.md` has the table and the behaviour section.

The "Missing input" title is now sentence case (it was "Missing Input" in the doc and the story).
