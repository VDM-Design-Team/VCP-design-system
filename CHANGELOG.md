# Changelog

## 0.1.0 — unreleased

Initial system, seeded from the VCP Figma Variables export (Aug 2026).

- Core: 10 colour ramps (vcp-blue, slate, neutral, blue, green, red, yellow,
  pink-legacy, teal-legacy, monochrome), 14-step px spacing scale, Poppins/Inter.
- Semantic (light + dark): `surface.*`, `text.*`, `stroke.*`,
  `action.{primary,secondary,tertiary}`, `accent.{critical,success,warning,info,blue,green,red}`
  in filled/outline/tonal styles — 228 tokens per theme.
- Type ramp: display-xl … caption-sm as composite tokens → `text-*` utilities.
- Shape: radius sm/md/pill, shadows card/raised/menu/modal.
- Build targets: Tailwind v4 `@theme` CSS + `.dark` overrides, plain CSS vars,
  TypeScript, flat + nested JSON.
- Components: `Icon` (sm/md/lg = 16/20/24) — a Heroicons v2 outline glyph stroked
  with `currentColor`, so colour comes from a text token on the parent and dark
  theme needs no second path. No new tokens. Decorative by default
  (`aria-hidden`); pass `label` to give it `role="img"` and a name when the glyph
  is the only carrier of meaning. Ships the 82 glyphs the VCP Figma library
  references rather than all of Heroicons — a `name`-driven lookup cannot be
  tree-shaken, so the full set would cost every consumer ~100KB of unused paths.
- Components: `Button` (primary/secondary/tertiary/danger/link × sm/md/lg,
  loading/disabled), mapped to `action.*` and `accent.critical.*` state tokens.
- Components: `SegmentedControl` (sm/md, fullWidth, disabled options) — a radio
  group on a `surface.neutral.subtle` track. No new tokens. Sizes are 32/40px to
  match Button rather than the export's 28/36, so `md` meets the 40px target rule.
  Known: the selected segment's surface is 1.1:1 against the track, so the
  selected state is carried by the label's colour and weight — see
  `docs/segmented-control.md`.
- Components: `Tabs` (sm/md, fullWidth, counts, disabled tabs) — selected tab takes
  `action.secondary.content.default` for both label and 2px underline; count pill
  uses `type.caption-sm` on `surface.brand.faint` / `surface.neutral.subtle`.
  No new tokens. Exports `tabId()` / `tabPanelId()` so panels can be associated —
  the bar alone is not an accessible tab set.

### Not imported from the Figma export (deliberately)

- `schemes-*` and `state-layers-*` variables — Material theme-builder noise.
- `-2`/`-3` duplicate variables — Figma collection duplication artifacts.
- `button-*` component variables — they referenced the pink `primary` ramp;
  design confirmed (2026-08-18) pink is not a brand colour. The pink ramp is
  removed entirely; `action.*` (vcp-blue) is the button source.

### Fixes

- `cn()` was dropping type classes. tailwind-merge files any `text-…` it doesn't
  recognise as a colour, so `text-label-lg` and `text-action-primary-content-default`
  collided and only the last one survived. **Every `Button` has been rendering at the
  browser's inherited 16px/400 instead of `type.label-lg` (14px/500) since 0.1.0.**
  `cn()` now declares the type ramp as a font-size group, and `npm run lint:tokens`
  fails if that list drifts from `tokens/semantic/type.json`.

### Contrast fixes vs the Figma export (approved by design, 2026-08-18)

- `text.subtle`: slate-400 → slate-500 (was 2.56:1 on white — failed AA).
- `text.tertiary`: slate-500 → slate-600 (keeps the hierarchy distinct after the
  subtle fix; 7.58:1).
- `accent.success.tonal.content.default`: green-800 → green-900 (was exactly
  4.50:1; now 8.24:1).
- Dark theme: `stroke.focused` was left at vcp-blue-500, the same value as light,
  while every other `stroke.*` token was inverted. That is 2.37:1 against the dark
  surfaces — below the 3:1 WCAG 1.4.11 asks of a focus indicator, so the focus ring
  was close to invisible in dark theme on every component, Button included.
  Now vcp-blue-300 (6.33:1), mirroring how `stroke.brand.strong` flips 600 → 300.
  This corrects the earlier "dark theme already passes" note.
- These fixes live in `scripts/import-figma-tokens.mjs`, so re-importing a fresh
  Figma export cannot silently regress them. **Push the same three changes back
  to the Figma variables** so the export catches up with the code.
