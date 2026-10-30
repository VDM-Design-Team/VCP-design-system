---
bump: patch
---
### `NotificationItem` — review fixes: the unread dot, `moved` without a status, clicks on the comment (October 2026)

Fixes from the PR #175 review, which reached `main` in PR #176 before they were made:

- **The unread dot only makes way for the mark-read button.** It used to vanish whenever any button in the row had focus (the row itself, "Show more") and on hover even with no `onToggleRead`, leaving nothing in its place. It now goes only on hover or on the mark-read button's own focus, and only when that button exists. The row is now a named group (`group/notification`), so an outer `group` cannot trigger it.
- **`moved` needs its `status`.** The props are now a union on `kind`, so `kind="moved"` without `status` is a type error. At runtime a missing status ends the sentence at the title, and "[Status]" never shows. `status` stays `string | undefined` on `moved`, so a row built from data (`status={event.status}`) still type-checks. `NotificationItemProps` is now a type alias, not an interface, so an `interface … extends NotificationItemProps` no longer compiles. Nothing in the system does that.
- **A click on the comment preview opens the item.** The preview sat above the row's target, so a click on the comment's text did nothing. It now lets clicks through to the row. "Show more" and `previewActions` still take the pointer and keep their place in the tab order.
- Stories: `Static` and `MarkReadTooltip` now test something real. New stories cover each fix: `MovedWithoutStatus`, `CommentOpensTheItem`, `DotMakesWayForMarkRead` and `DotStaysWithoutMarkRead`. The docs' accessible name now matches the real one, and the docs no longer name the unmerged `NotificationInbox`. The note on the tooltip's left placement now gives a reason that still holds.
