# Working on this design system

This repo is the **single source of truth** for the VCP Design System. Design and
engineering both change it here. Figma is not authoritative; neither is any
Claude Design project — those mirror this repo, not the other way round.

## Rules — apply to every change

1. **Tokens before components.** If a component needs a value that no token
   provides, add the token in `tokens/` first, run `npm run tokens`, then use it.
   Never write a hex, a raw `px`, or an arbitrary Tailwind class (`bg-[#336afa]`).
   `npm run lint:tokens` fails the build on these.
2. **Two token layers.** `tokens/core/` holds raw values (`color.brand.500`).
   `tokens/semantic/` holds intent (`surface.brand`, `content.muted`, `line.default`)
   and must only ever reference core tokens. **Components use semantic tokens only.**
3. **`dist/` is generated.** Never hand-edit it. It is rebuilt from `tokens/`.
4. **Every component ships with**: the `.tsx`, a `.stories.tsx` covering all
   variants/sizes/states, and a `docs/<name>.md` with a when-to-use table,
   props table, accessibility notes, and a "Don't" list.
5. **Accessibility is not optional.** 4.5:1 contrast on text, 3:1 on UI borders,
   visible focus ring, 40px minimum target for touch, `aria-label` on icon-only
   controls.
6. **Changes are versioned.** Adding a token or variant is a minor bump. Renaming
   or removing one is a major bump and needs a note in `CHANGELOG.md` with the
   migration path.

## Naming

- Semantic colors follow the VCP Figma variables exactly:
  `surface.*` (backgrounds), `text.*` (text/icons), `stroke.*` (borders),
  `action.{primary|secondary|tertiary}.{surface|content|border}.{state}` (controls),
  `accent.{critical|success|warning|info|…}.{filled|outline|tonal}.{surface|content|border}.{state}` (status).
  Tailwind utilities: `bg-surface-canvas`, `text-text-primary`, `border-stroke-default`,
  `bg-action-primary-surface-default`, `bg-accent-critical-tonal-surface-default`.
- Spacing: do NOT override Tailwind's numeric scale — VCP's px values map onto it
  exactly (4px = `p-1`, 8px = `p-2`, 16px = `p-4`, 64px = `p-16`).
- Type ramp: `text-display-xl` … `text-caption-sm` — size, line-height, weight and
  tracking come as a unit from `type.*`. Poppins for UI (`font-sans`), Inter for
  dense numerics (`font-numeric`).
- Dark theme exists: `tokens/semantic/color.dark.json` builds to `dist/tokens.dark.css`
  (`.dark` overrides). Components must only use semantic tokens so dark works for free.
- Component props: `variant`, `size`, `fullWidth`, `loading`. Keep these names
  consistent across every component — devs should be able to guess the API.

## Commands

| | |
|---|---|
| `npm run tokens` | Rebuild `dist/` from `tokens/` |
| `npm run dev` | Storybook at :6006 |
| `npm test` | Token lint + typecheck (what CI runs) |

## How design proposes a change

Work on a branch, open a PR, tag the engineering owner. Describe the change in
product terms in the PR body ("secondary buttons need a subtle variant for the
settings page"), not in CSS terms. Never push to `main`.
