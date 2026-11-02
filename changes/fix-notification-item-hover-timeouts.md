---
bump: patch
---
### `NotificationItem` stories — the hover tests no longer time out in a full `npm test` (November 2026)

Stories only; the component is unchanged. `DotMakesWayForMarkRead` and `DotStaysWithoutMarkRead` move the browser's real pointer, because the unread dot is driven by CSS `:hover`. They moved it with Playwright's `hover()`, which first waits for its target to be visible, stable and unobstructed. That is a dozen or more round trips between Vitest and the page, and in a full `npm test` (several pages at once) they could take the test's whole 15 seconds, so one of the two timed out now and then. Each move is now a single DevTools `Input.dispatchMouseEvent`, and the stories check in the page that the row is, or is not, hovered before they read the dot. The pointer now parks in the screen's bottom-right corner between tests. It used to finish at the top-left, which under Vitest is on the story's row.
