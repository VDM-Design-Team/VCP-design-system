---
bump: minor
---
### `Tag` — two more sizes, `xs` and `lg` (October 2026)

`Tag` gains `size="xs"` (20 tall, 10 type) and `size="lg"` (32 tall, 16 type), the smallest and largest sizes of the General Design Library `Tag`. The existing `sm` (24) and `md` (28, the default) are unchanged, so nothing is renamed: the sizes take the system's usual `xs | sm | md | lg` names in order, which makes GDL's "Medium" `sm` here and its "Large" `md`. Padding is 8 and the gap 4 (`xs`, `sm`) or 8 (`md`, `lg`), as drawn. `docs/tag.md` has the full table, with the icon size for each. Components that pass `size` through, like `DueDateTag`, accept the new values too.
