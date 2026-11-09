---
bump: minor
---
### `AvatarGroup` hover tooltips; the Added Value table's Members column uses them (November 2026)

`AvatarGroup` gains `tooltips`: each avatar says who it is when the pointer rests on it (the name, and the new optional `role` on a person: "Ali Rahman (Assignee)"), and the `+N` chip lists the people it hides. It is for the pointer only: the stack stays one labelled image with no extra tab stops, and its label now reads each person's role after the name ("Members: Ali Rahman (Assignee), Eve Chen and 2 others") so a keyboard or screen-reader user gets the same information. `AVTable`'s Members column turns `tooltips` on; give a member a `role` to show it. Without `tooltips` nothing changes.
