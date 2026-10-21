---
bump: major
---
### `stroke.strong` is the control boundary; `stroke.field` is removed (October 2026)

`stroke.field` was a token too specific to earn its place — named for a component, with `stroke.strong` sitting unused beside it. Making `strong` the control-boundary
colour keeps the variables streamlined and meets WCAG AA (1.4.11) for a control's boundary.

- **`stroke.strong` now holds the control-boundary colour:** slate-500 in light (was slate-400), slate-400 in dark (was slate-500) — the values `stroke.field` held. It clears
  WCAG 1.4.11's 3:1 in both themes (4.76:1 / 4.55:1 on white / canvas in light; 5.71:1 / 6.96:1 in dark). Nothing used the old `strong`.
- **Breaking: `stroke.field` is removed.** Migration: `border-stroke-field` → `border-stroke-strong` (Input, Select, Textarea, Checkbox, RadioGroup, Dropzone,
  SearchSelect, Stepper — all migrated here, so **nothing changes visually**). Figma's `stroke/strong` was set to match.
- `stroke.default` stays the decorative everyday border (1.48:1). `scripts/import-figma-tokens.mjs` now pins `stroke.strong` instead of adding `stroke.field`.
- `docs/color-tokens.md` documents the roles.
