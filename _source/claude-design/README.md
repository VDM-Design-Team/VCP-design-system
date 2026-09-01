# Claude Design export — source material, not shipped code

This is the curated component set from the VCP Claude Design project
(`VCP Design System.zip`, exported 18 Aug 2026), vendored here so the port is
reproducible from the repo alone. Before this existed the sources lived only on
one laptop, which meant nobody else — and no cloud agent — could work on them.

**Nothing in here is built, imported, or published.** `tsconfig.json` includes only
`src` and `.storybook`; `scripts/lint-hardcoded-values.mjs` walks `src`; and
`package.json`'s `files` list ships `dist`, `src`, `tokens` and `docs`. This folder
is inert in all three.

## What is here

- `components/<Name>/` — the 83 curated components, each as a `.jsx` and a `.d.ts`.
  The `.d.ts` is the prop contract and is the more useful of the two.
- `styles.css` — the export's token layer, as CSS custom properties.
- `SKILL.md`, `README.md` — the export's own guidance, including its role model and
  its honest coverage gaps.

The full export also carried 660 raw Figma imports (`ButtonFig`, `Tabs2`,
`CheckboxVCP` and so on) and a 15MB bundle. Those are deliberately not vendored:
they are pre-curation duplicates and would only confuse the worklist.

## How to read it when porting

Treat these files as **intent, not as code to copy**. They render through
`React.createElement` with inline styles and raw `rgb()` values, and most of the
controls have no keyboard support at all — `Toggle` was a `<span onClick>` with
`role="switch"`, unreachable by keyboard. Every port so far has been a rewrite:
semantic tokens, the real native element, and the accessibility work the export
never had.

Where the export and this repo disagree, **this repo wins**. Sizes are the usual
case — the export uses its own scale, and CLAUDE.md requires `sm` = 32px and
`md` = 40px so that `size` means one thing everywhere.

`docs/inventory.md` records which tier each of these belongs in and what blocks
what.
