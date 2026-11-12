---
bump: patch
---
### `Button` / `IconButton` / `Field` — `aria-disabled` ignores the keyboard, and Field works with a control's own ids (November 2026)

Found in a code review of the design system and the prototype. Nothing calls them this way today, but the next caller could.

- **`Button` and `IconButton`**: a caller's `aria-disabled` looked disabled and blocked the mouse, but Enter or Space on the focused button still ran `onClick`. It now ignores presses the way `loading` does, keyboard included, and keeps focus. Only `true` or `"true"` counts. `BulkActionHandoffModal`'s arrows, which guard themselves, behave as before.
- **`Field`**: a control that brought its own `id` kept it, but the label pointed at the id Field generated, so clicking the label did nothing. The label now points at the control's own id (an explicit `htmlFor` still wins). A control that brought its own `aria-describedby` lost Field's helper or error from its description; Field now adds its id after the control's own.

No API change.
