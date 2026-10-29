---
bump: minor
---
### `UserLabel` — a person, named in place (October 2026)

New component, to Figma's `Profile_Image_Name_Label`: an avatar, a name and, under it, an optional description ("John" / "Assignee", the `description` prop, named as `Chip`'s second line is), in Figma's two sizes (`md`, a 32 avatar with body type; `sm`, a 24 avatar with caption type). It is display only: a person you can press or remove is a `Chip`. The avatar beside the visible name is decoration, so there is one announcement.

The description line is pulled up directly under the name so the two sit close, matching the Assignee chip.
