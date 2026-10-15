---
bump: major
---
### `SegmentedControl` — five sizes, strokes (October 2026)

- **Sizes** follow Figma's `Segmented_Control`: `xs` / `sm` / `md` / `lg` / `xl` = 28 / 32 / 36 / 40 / 48 high, track padding exactly 4 (the stroke is an inset ring and takes no room), segments fill
  20 / 24 / 28 / 32 / 40 with 6 / 8 / 12 / 12 / 16 either side, type 12 / 14 / 14 / 14 / 16 medium. **`xl` is the default.**
- **Strokes:** the track and the selected segment each draw a 1px `stroke.default`; the selected segment keeps its `shadow.card`,
  the lightest elevation.
- **No gap between segments** (was 2px) — Figma's item spacing is 0.
- **`Field`'s error message** (the caption under an invalid control, e.g. a failed save) is now `accent.critical.outline.content.default`,
  the colour of the invalid border, instead of `.tonal.content.default`. The required marker is unchanged.
- **Breaking:** `size` was `sm | md` (default `md`). Migration: old `sm` (32 segment) is now `lg`; old `md` (40 segment, the default)
  is now `xl`. Callers that pass no `size` get `xl`, a little taller than before (48 vs 46).
