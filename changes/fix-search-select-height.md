---
bump: patch
---
### `SearchSelect` is 32 / 36 / 40 tall, as `Select` (November 2026)

The trigger inside the field was 24 / 26 / 32 high with 4 of padding and a 1 border either side, so `sm` measured 34 and `md` 42 (only `compact` was right, at 36). The trigger is now 22 / 26 / 30, so the field is exactly 32 / 36 / 40, level with `Select` and `Input` beside it. A field with tags still grows past its minimum.
