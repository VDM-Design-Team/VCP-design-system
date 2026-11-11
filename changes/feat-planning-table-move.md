---
bump: minor
---
### `PlanningTable` — move a row anywhere, and without dragging (November 2026)

Planning review: AVs need to move between Cycles and back to the Backlog, and by keyboard as well as by mouse.

- **`moves="anywhere"`**: any row drags onto any other section, another Cycle or the Backlog. The default,
  `to-cycle`, keeps today's behaviour (a Backlog row onto a Cycle).
- **`acceptsRows: false`** on a section takes no rows (a Cycle that has ended): no drop target, no menu choice.
- **`canMove(row, from)`** keeps a row where it is (no button, no drag), e.g. a Completed one.
- **A "Move … to…" button** on every movable row when `onMoveRow` is given: a menu of the sections the row may go to,
  calling `onMoveRow` as a drop does. It is the way to move a row without dragging (WCAG 2.5.7).
- **Focus follows the row**: after a move from its menu, focus goes to the row's button in its new section.

The table gains a narrow last column for the button when `onMoveRow` is given.
