---
bump: major
---
### `Dropzone` moves to atoms; its edge is a 1 dashed stroke (October 2026)

`Dropzone` imports nothing but `Icon`, so by the composition rule it is an atom: it moves from `src/components/dropzone` to `src/atoms/dropzone` (Storybook title `Atoms/Dropzone`). The dashed edge is now drawn in SVG, 1 thick with 6-long dashes and 4 between (it was a 2 CSS dashed border, whose dash cannot be set), in the same state colours.

Migration: import it from the package root as before (`import { Dropzone } from '@vcp/design-system'`); inside this repo, change `../../components/dropzone` to `../../atoms/dropzone`. The props and behaviour are unchanged.
