---
bump: patch
---
### Tokens — GDL 1.0.0: the pink and teal ramps no longer ship (October 2026)

VCP now builds on `@vdm-design-team/gdl` 1.0.0, still pinned exactly.
GDL 1.0.0 keeps its placeholder brand-slot ramps, `color.primary.*` (pink)
and `color.secondary.*` (teal), to itself, the same way GDL's Figma library
already hides them from publishing.

- `dist/` loses their 22 variables (`--color-primary-{50…950}` and
  `--color-secondary-{50…950}`) and the utilities built on them
  (`bg-primary-500`, `text-secondary-*`, …).
- Nothing in VCP used them, and no semantic token pointed at them. Every
  other token, variable and utility is unchanged.
- They only arrived with VCP's move onto GDL 0.1.0, which hasn't been
  released yet, so no released version of VCP ever shipped them.

Also from GDL 1.0.0: `npm run check:contract` now fails a semantic token that
points at `{color.primary.*}` or `{color.secondary.*}`. Use `vcp-blue` instead.
