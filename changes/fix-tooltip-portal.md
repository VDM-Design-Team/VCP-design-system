---
bump: patch
---
### `Tooltip` — the bubble floats above the page (October 2026)

The bubble is now drawn in a portal, `position: fixed` from the trigger's coordinates, instead of as an absolutely-positioned child of the trigger. It can no longer widen a scrolling container it sits in (a tooltip on a button at a row's right edge made the notification popover's list scroll sideways), and no container that clips or scrolls can cut it off. It goes into the nearest `.dark` ancestor when there is one, so a themed wrapper still themes it, and follows the trigger on scroll and resize while open. Placement is unchanged: the same four sides, the same gap, no flipping. The API is unchanged.
