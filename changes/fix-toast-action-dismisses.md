---
bump: patch
---
### `Toast` — pressing the action closes it (November 2026)

A toast raised with `toast()` that has an action (the **Undo** on "Problem set deleted", the **Retry** on a failed save) now closes itself once the action has run. Before, the action ran and the toast stayed, still saying "deleted" after the deletion was undone, until its timer ran out or someone pressed the X. Figma's undo flow ends with "the snackbar disappears". A bare `<Toast>` is unchanged, since it has no queue to leave. Pages that closed the toast themselves in `onAction` need no change; calling `dismiss` twice does nothing.
