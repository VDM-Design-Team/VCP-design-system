---
bump: minor
---
### `Tag` — two more sizes, `xs` and `lg`, and GDL's updated spacing (October 2026)

`Tag` gains `size="xs"` (20 tall, 10 type) and `size="lg"` (32 tall, 16 type), the smallest and largest sizes of the General Design Library `Tag`. The sizes take the system's usual `xs | sm | md | lg` names in order, so nothing is renamed: GDL's "Medium" is `sm` here and its "Large" is `md`.

GDL also updated the spacing, and the existing sizes follow it. Side padding is 6 on `xs` and `sm` (it was 8 on `sm`) and 8 on `md` and `lg`; the gap between a glyph and the label is 4 on `xs` and `sm` and 6 on `md` and `lg` (it was 8 on `md`). So every `sm` tag is 4px narrower, and a `md` tag with a glyph (`TypeTag`, `UrgencyTag`) is 2px narrower per glyph. Heights and type are unchanged. `docs/tag.md` has the full table, with the icon size for each. Components that pass `size` through, like `DueDateTag`, accept the new values too.
