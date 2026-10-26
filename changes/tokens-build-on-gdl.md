---
bump: minor
---
### Tokens — VCP builds on GDL, the parent design system (October 2026)

VCP's shared scales now come from `@vdm-design-team/gdl` 0.1.0, the same way
the VCP Figma library subscribes to the GDL library.
`tokens/` keeps only what is VCP's own:

- the `vcp-blue` ramp and `brand.navy`
- the UI face (`font.family.sans` → Poppins) and the emoji stack
- radius, shadow and border-width names
- the semantic colours

The rest comes from GDL: the colour families, spacing, Inter and the
weights, and the 47-style type ramp. The build uses GDL's formats.
`npm run check:contract` (in `npm test` and CI) checks the semantic colours
against GDL's contract.

Every utility and variable components use is unchanged, except one value:

- **`color.green.800` is `#016630`.** It was `#008236`, a copy of `green.700`.
- It feeds `accent.green.strong` and `accent.success.{filled.surface,outline.content}.hover`
  in light mode.
- In dark mode it feeds `accent.green.faint`, `accent.success.tonal.surface.hover`,
  and the success tonal and outline disabled content.
- Every pair gains contrast:
  - The `green` tone in Avatar and TagEditor (dark): 4.50:1 → 6.49:1.
  - Banner and Toast success hover (dark): 4.10:1 → 5.91:1. It now passes AA.

New from GDL, all additive:

- **Colour ramps:** `color.orange.*`, plus GDL's brand-slot ramps
  `color.primary.*` (pink) and `color.secondary.*` (teal). VCP doesn't use
  the brand-slot ramps; keep using `vcp-blue`.
- **Shape:** px-named `radius.{0…64,full}`, `shadow.elevation.{1…7}` (light
  and dark), `stroke-width.*`.
- **Spacing:** `space.{0,44,80,128,256}`.
- **Type:** the `font-inter`, `font-poppins`, `font-gotham-pro`, `font-montserrat`
  and `font-gotham-rounded` families, `font.weight.light`, and `font.size.*`.
- **Desktop type:** `dist/typography.desktop.css`, desktop type sizes behind
  `data-type-scale="desktop"`. Opt-in, and not wired into the ramp.

Two changes to build output that nothing in VCP reads:

- `dist/tokens.css` no longer repeats the dark theme as `--dark-*` variables
  in `:root`. The dark theme is `dist/tokens.dark.css`, unchanged.
- `type.body-md-regular` and `type.label-md-medium` lose their `$description`
  in `tokens.json` and `tokens.ts`.

Contributors: `npm install` now needs a GitHub token with `read:packages`,
once per machine (see the README).
