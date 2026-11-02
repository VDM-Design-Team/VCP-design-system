---
bump: minor
---
### `NotificationItem` — copy, two new kinds, a larger mark-read target (October 2026)

Follow-up to the review fixes in #209, covering what it left for design review. The copy is past tense (`accepted`, `handed off … Ready for Review`), and every sentence ends in a full stop with the time shown capitalised after it ("A few seconds ago"). Two kinds are added, `pending` ("submitted … for approval. Pending") and `completed` ("accepted & completed"), making thirteen, with `pending` listed before `accepted`. The mark-read / mark-unread button has a 40 click area (the 20 icon is unchanged and the text and icon stay where they were), and is named "Mark as read: *Title*" so it is not a repeat of the tooltip. `docs/notification-item.md` records who gets each notification, whether it raises the red dot, and the status it follows. In Storybook the `status` control picks from the shared and domain statuses.

A click on the comment preview does **not** open the item (the comment is content to read and select; only "Show more" / "Show less" and the caller's `previewActions` respond there). This reverses the click-through added in #209, per design.
