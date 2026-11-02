---
bump: patch
---
### Say it once: nothing on a screen reader repeats its own name (November 2026)

Fix: in ten places a screen reader heard the same words twice, as an element's name and again as its
description. A new story check (`vcp-description-repeats-name`, run with axe on every story) now fails that,
and these are fixed:

- **Tooltips that only showed the trigger's name** no longer describe it too (`describe={false}`):
  `EmojiReactionPicker`'s "Add reaction", `NotificationItem`'s "Mark as read" / "Mark as unread",
  `Sidebar`'s rows when collapsed, `InlineEdit`'s "Edit" pen (in `DataTable` and `PlanningTable`),
  `DomainLabel`'s "Added by …" (also in `DeliverableLink` and `DeliverablesCard`).
- **Hints that were in a name *and* a description**: a `RadioGroup` option with a `hint`, and `Dropzone`'s
  file types or error (also in `DeliverablesCard` and `HandoffAVModal`). Each control is now named by its own
  words and described by the hint, so "Starter, Up to 3 seats" is heard once, not "Starter Up to 3 seats, Up
  to 3 seats".

`Tooltip` marks a trigger it does not describe with `data-tooltip`, and `IconButton` drops its native `title` under
either mark, so the pen never gets the browser's own bubble on top of ours.

Nothing changes on screen. No API change.
