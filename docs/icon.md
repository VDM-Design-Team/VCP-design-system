# Icon

A [Phosphor](https://phosphoricons.com) glyph at `regular` weight, filled with `currentColor`.

## When to use

| Use | Instead of |
|---|---|
| Reinforcing a visible label (`🗑 Delete`) | An icon on its own where the meaning isn't obvious |
| An icon-only control, **with `label`** | An unlabelled glyph — invisible to screen readers |
| Status glyphs beside status text | Colour alone to carry state |
| — | Hand-drawn `<svg>` in a component. Add the glyph here instead. |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `IconName` | — | See the list below, or import `ICON_NAMES`. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 16 / 20 / 24. Dense cells / inline / nav. |
| `label` | `string` | — | Accessible name. **Only** when the glyph is the sole carrier of meaning. |
| `className` | `string` | — | Merged via `cn()`. This is where colour goes. |

Everything else passes through to the `<svg>`. Returns `null` for an unknown name.

## Tokens

Icon uses **no colour token of its own** — that is deliberate.

| Concern | How |
|---|---|
| Colour | `fill="currentColor"`. Set a text token on the icon or its parent: `text-text-tertiary`, `text-accent-critical-tonal-content-default`. Themes for free. |
| Size | Tailwind's numeric scale: `size-4` / `size-5` / `size-6`. |
| Geometry | Phosphor `regular`, 256×256 viewBox, 16-unit stroke, round caps. |

## Phosphor, not Heroicons

The VCP Figma library draws from **Phosphor**. This matters mechanically, not just
cosmetically: **Phosphor glyphs are filled paths**, where Heroicons outline glyphs
are stroked. A component built to stroke them renders nothing.

Note that the Claude Design export's own `Icon` component claims "Heroicons v2
outline" — that was its own substitution, and it is wrong. The raw Figma imports in
the same export are unambiguously Phosphor (`ArrowUUpLeft`, `CheckFat`,
`SealCheck`, `DotsSixVertical`, `FunnelSimple`), each carrying a `style2`
weight prop defaulting to `"regular"`, which is Phosphor's weight system. Take icon
names from the raw imports, not from that component.

## Why the set is trimmed

Phosphor ships 1,512 glyphs per weight. A `name`-driven API needs a dynamic lookup
(`ICON_PATHS[name]`), which tree-shaking cannot reduce — so bundling the full set
would put a large amount of unused path data into every consumer. This ships the
glyphs VCP actually references.

**To add a Phosphor glyph**: copy the inner markup of its `regular` SVG from
`@phosphor-icons/core/assets/regular/<name>.svg` (or phosphoricons.com) into
`PHOSPHOR_ICONS` in `icons.ts`, keeping Phosphor's kebab-case name. The
`IconName` union derives from that object, so TypeScript picks it up with no other
change.

## In-house glyphs

Where Phosphor has no equivalent, VCP draws its own. They live in `CUSTOM_ICONS`
in `icons.ts`, are listed by `CUSTOM_ICON_NAMES`, and are otherwise
indistinguishable to callers — same `name` API, same sizes, same colour inheritance.

Current in-house glyphs:

| Name | Why | Used by |
|---|---|---|
| `caret-triple-up` | Phosphor stops at `caret-double-up` | Planning table "raise to top" |

**Adding one — export as SVG, not PNG.** A raster cannot do the two things this
component depends on:

- **Colour.** The whole set is monochrome and inherits `currentColor`, which is how
  one glyph serves light theme, dark theme, and every accent colour. A PNG's pixels
  are fixed — you would need a separate file per colour per theme, and it still
  could not take an accent.
- **Scale.** `size` renders the same glyph at 16, 20 and 24, and on a 2× or 3×
  display those become 32/40/48 real pixels. Vector is exact at every one; a PNG
  needs an `@1x/@2x/@3x` set per glyph and still blurs at sizes you did not export.

Since the custom glyphs are drawn in Figma, which is already vector, exporting SVG
is both less work and the only form that themes. **Export SVG** → *Copy as SVG* on
the frame.

Then, to match the rest of the set:

1. **Normalise to a 256×256 viewBox.** Phosphor's box. A glyph at Figma's own
   dimensions will not align with its neighbours.
2. **Outline the strokes** so the result is filled paths, and drop any `stroke`,
   `fill` or colour attributes — `Icon` supplies `fill="currentColor"`.
3. **Match Phosphor `regular`**: 16-unit stroke width at 256, round caps and joins.
   A custom glyph at a different weight reads as a mistake sitting beside the others.
4. Add it to `CUSTOM_ICONS` and to the table above.

If what you have is genuinely multicolour — a brand mark or an illustration — it is
not an Icon. Raster or multi-path colour artwork belongs in `Logo` or as an asset,
because it cannot participate in theming either way.

## Accessibility

- **Decorative by default.** With no `label`, the glyph is `aria-hidden="true"`
  and has no role, so assistive tech skips it. This is right when a visible label
  sits beside it — otherwise the label is announced twice.
- **`label` when the icon stands alone.** Renders `role="img"` with
  `aria-label`. An icon-only button needs a name on *the button*; if you have
  already labelled the button, leave the icon decorative rather than naming both.
- **`focusable="false"`** is set explicitly: without it, legacy Edge put SVGs in the
  tab order.
- **Contrast.** The glyph inherits its colour, so contrast is the caller's
  responsibility. A meaningful icon is a UI component under WCAG 1.4.11 and owes
  **3:1** against its background; an icon duplicating adjacent text is decorative and
  exempt. `text-text-tertiary` is 7.6:1 on `surface.base`, `text-text-subtle` is
  4.76:1 — both safe. Anything lighter needs checking.
- **Never rely on the glyph alone** to convey status. Pair it with text.

## Don't

- **Don't hand-draw an `<svg>` in a component.** Add the glyph to `icons.ts`.
- **Don't add a `stroke`.** Phosphor glyphs are filled; a stroke thickens them unevenly.
- **Don't set `fill` directly.** Colour comes from `currentColor` via a text token.
- **Don't add custom glyphs as PNG.** See above — they cannot theme or scale.
- **Don't pass `label` to an icon beside its own visible text** — double announcement.
- **Don't size with `width`/`height` or arbitrary classes.** Use `size`.
- **Don't rename Phosphor glyphs.** The names match Phosphor, which is how anyone finds them.

## Available names

`arrow-down` · `arrow-left` · `arrow-right` · `arrow-u-up-left` · `arrow-up` · `arrows-down-up` · `arrows-split` · `bank` · `bell` · `calendar-blank` · `calendar-dots` · `calendar-x` · `caret-double-down` · `caret-double-left` · `caret-double-right` · `caret-double-up` · `caret-down` · `caret-left` · `caret-right` · `caret-triple-up` · `caret-up` · `caret-up-down` · `chat-centered-text` · `chat-dots` · `chats-circle` · `check` · `check-circle` · `check-fat` · `circle` · `clock` · `cloud-check` · `code` · `database` · `dots-six-vertical` · `dots-three` · `dots-three-vertical` · `eye` · `eye-slash` · `file` · `film-reel` · `flask` · `function` · `funnel-simple` · `git-branch` · `globe` · `globe-simple` · `graph` · `handshake` · `hourglass-low` · `house-line` · `info` · `link` · `list` · `list-bullets` · `magnifying-glass` · `megaphone` · `minus` · `minus-circle` · `note-pencil` · `paint-brush` · `palette` · `paperclip` · `pencil-simple` · `plus` · `plus-circle` · `rocket` · `seal-check` · `sort-ascending` · `sort-descending` · `thumbs-up` · `trash` · `trash-simple` · `user` · `users` · `warning` · `warning-circle` · `x` · `x-circle`

In-house glyphs are marked in the table above and listed by `CUSTOM_ICON_NAMES`.
