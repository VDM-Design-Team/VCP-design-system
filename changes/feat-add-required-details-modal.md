---
bump: minor
---
### `AddRequiredDetailsModal` and `DateField` — the dialog a Backlog drop opens (November 2026)

New, built to Figma's `Add_Required_Details_Planning_List` and the Assignee Availability flows.

- **`AddRequiredDetailsModal`** (pattern) — repeatable assignee rows (person with availability, role, points), Start and Due Date, Cycle, Capacity Points. With `estimate`, the dates the system calculates fill in "(est.)" and a date a person sets is never overwritten. Confirm will not go through with an unavailable assignee (`onInvalid`).
- **`DateField`** (component) — a read-only field with a calendar glyph and a `DatePicker` in a fixed-position `Popover`; `estimated` reads "(est.)".

Stacked on the Planning table PR (it uses `Popover`'s `strategy="fixed"`).
