---
bump: minor
---
### `Toast` — an action toast can time out after 15 seconds (November 2026)

A Toast with an action stayed on screen until dismissed, whatever its `duration`, so the design's undo snackbar (it goes after 15 seconds, or when dismissed) could not be built. It can now: pass `duration` of at least the new `MIN_ACTION_TOAST_DURATION` (15000) beside `actionLabel` and the toast counts down, with the timer bar, still pausing on hover and focus and dismissible at once. A shorter or default `duration` with an action is still ignored, so nothing existing changes. docs/toast.md has a new "Undo" section. The gap between the message and the action is now 16 instead of 8 (the other gaps are unchanged).
