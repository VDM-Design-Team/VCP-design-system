# Icon

A [Phosphor](https://phosphoricons.com) glyph in `regular` or `fill` weight, filled with `currentColor`.

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
| `size` | `10 \| 12 \| 16 \| 20 \| 24 \| 28 \| 32 \| 40 \| 48` (or `'sm' \| 'md' \| 'lg'`) | `'md'` (20) | Box size in px — the nine sizes Figma draws. `sm` / `md` / `lg` are the old names for 16 / 20 / 24. |
| `label` | `string` | — | Accessible name. **Only** when the glyph is the sole carrier of meaning. |
| `className` | `string` | — | Merged via `cn()`. This is where colour goes. |

Everything else passes through to the `<svg>`. Returns `null` for an unknown name.

## Tokens

Icon uses **no colour token of its own** — that is deliberate.

| Concern | How |
|---|---|
| Colour | `fill="currentColor"`. Set a text token on the icon or its parent: `text-text-tertiary`, `text-accent-critical-tonal-content-default`. Themes for free. |
| Size | Tailwind's numeric scale: `size-2.5` (10), `size-3` (12), `size-4`, `size-5`, `size-6`, `size-7` (28), `size-8`, `size-10`, `size-12` (48). |
| Geometry | Phosphor `regular`, 256×256 viewBox, 16-unit stroke, round caps. |

## Phosphor, not Heroicons

The VCP Figma library draws from **Phosphor**. This matters mechanically, not just
cosmetically: **Phosphor glyphs are filled paths**, where Heroicons outline glyphs
are stroked. A component built to stroke them renders nothing.

**The rule: Phosphor, or our own.** Never Heroicons, and never a second
family. Where Phosphor has no equivalent, take the design's own geometry and
add it to `CUSTOM_ICONS` at Phosphor's weight — 256 viewBox, 16-unit stroke.

Two of the navigation glyphs needed that (8 Sep 2026):

| Glyph | Why |
|---|---|
| `rectangle-group` | Dashboard. Phosphor has no three-panel form; redrawn in Phosphor's weight |
| `rectangle-stack` | Manage. Phosphor's `stack` glyphs are isometric; the design's is face-on |

And one status glyph (5 Oct 2026):

| Glyph | Why |
|---|---|
| `fire-solid` | `UrgencyTag`'s Urgent. The design's flame (Heroicons' mini `fire`, solid, inner tongue cut out) is drawn for 20; Phosphor's `fire` is an outline and `fire-fill` a plain blob at that size. Exported from Figma and scaled from its 20 box. Solid, so it has no stroke weight to match |

`rectangle-stack` is exported from the SideBar page and
transformed from its 24 box onto the 256 viewBox, so the shape is the
design's exactly rather than an approximation of them. Heroicons' 1.5 stroke
on a 24 box is exactly Phosphor's 16 units at 256, so a stroked glyph sits in
the set at the right weight.

⚠️ **The Figma library is mixed.** The Tags and atom pages are Phosphor, but
the `SideBar` page's icon instances are named `heroicons-outline/light-bulb`
and `RectangleGroup` (found 8 Sep 2026). Those should be swapped to Phosphor
in the design file; the repo does not follow them there. Tracked in
`docs/figma-audit.md`.

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
`@phosphor-icons/core/assets/regular/<name>.svg` (a devDependency, so the
source is in the repo) into `PHOSPHOR_ICONS` in `icons.ts`, keeping Phosphor's
kebab-case name. Drop the `<rect ... fill="none"/>` bounding box the source
files carry — `Icon` sets its own viewBox.

**Pick the glyph by looking at it, not by its name.** The Claude Design export
names icons in Heroicons vocabulary, and a same-named Phosphor glyph is often
a different drawing. Render the candidates beside the Figma frame before
choosing; the navigation set (8 Sep 2026) needed `layout`, `lightbulb`,
`user-check`, `list-dashes`, `package`, `archive`, `rows` and `users-three`,
none of which share a name with what the export asked for. The
`IconName` union derives from that object, so TypeScript picks it up with no other
change.

**Two weights, for every glyph.** Each glyph ships `regular` under Phosphor's name
and `fill` under its `-fill` suffix (`bell` / `bell-fill`) — Figma's
`Style=Regular` and `Style=Fill`. We may not use every one, but both are always
there, so a design that switches a glyph to its filled state never has to ask for
it. Fills are copied from `@phosphor-icons/core/assets/fill/` the same way as the
regulars; **when you add a glyph, add both**. Don't mix the two weights inside one
row. A story test fails if a regular glyph has no fill, or a fill no regular.

The exceptions are in-house glyphs whose fill Figma doesn't draw: `rectangle-stack`
(and `fire-solid`, a solid already). `rectangle-group-fill` and `smiley-plus-fill`
are Figma's own fills, exported; `caret-triple-up-fill` is built the same way as
its regular.

**Figma overrides Phosphor.** The General Design Library redraws a few glyphs, and
where it does the design's version wins — same name, so nothing changes at the call
site: `user`, `user-check`, `user-plus`, `user-minus`, `user-sound`, `users`,
`users-three` and `fire`, each Regular and Fill (6 Oct 2026 review of #144). They
are exported from the library's 48 boxes and scaled onto the 256 viewBox, and live
in `CUSTOM_ICONS`; the Phosphor copies of the five we already shipped are removed.
`user-plus`, `user-minus` and `user-sound` are new to the set. Before adding any
People or Weather glyph, check the Figma library first — if it has its own, take
that one. (`fire-solid` is a separate, older exception: the Urgent flame.)

**Assigned** uses `user-check` — the design replaced its old `Assigned Added Value`
layer with it, so the in-house `assigned-value` glyph is gone.

## In-house glyphs

Where Phosphor has no equivalent, VCP draws its own. They live in `CUSTOM_ICONS`
in `icons.ts`, are listed by `CUSTOM_ICON_NAMES`, and are otherwise
indistinguishable to callers — same `name` API, same sizes, same colour inheritance.

Current in-house glyphs:

| Name | Why | Used by |
|---|---|---|
| `caret-triple-up` | Phosphor stops at `caret-double-up` | Planning table "raise to top" |
| `fire-solid` | Figma's Urgent flame is Heroicons' mini `fire`, drawn for 20; Phosphor's `fire` (outline) and `fire-fill` (a solid blob) don't read the same at that size. Kept as the design's geometry — an exception to Phosphor-only, decided 5 October 2026 | `UrgencyTag` (Urgent) |
| `smiley-plus` | Phosphor's `smiley` has no plus mark; the design's glyph (General Design Library `SmileyPlus`, Regular) carries it in the top-right corner | `EmojiReactionPicker`'s add-reaction button |

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

`archive` · `archive-fill` · `arrow-down` · `arrow-down-fill` · `arrow-left` · `arrow-left-fill` · `arrow-right` · `arrow-right-fill` · `arrow-u-up-left` · `arrow-u-up-left-fill` · `arrow-u-up-right` · `arrow-u-up-right-fill` · `arrow-up` · `arrow-up-fill` · `arrows-down-up` · `arrows-down-up-fill` · `arrows-split` · `arrows-split-fill` · `bank` · `bank-fill` · `bell` · `bell-fill` · `calendar-blank` · `calendar-blank-fill` · `calendar-dots` · `calendar-dots-fill` · `calendar-x` · `calendar-x-fill` · `caret-double-down` · `caret-double-down-fill` · `caret-double-left` · `caret-double-left-fill` · `caret-double-right` · `caret-double-right-fill` · `caret-double-up` · `caret-double-up-fill` · `caret-down` · `caret-down-fill` · `caret-left` · `caret-left-fill` · `caret-right` · `caret-right-fill` · `caret-triple-up` · `caret-triple-up-fill` · `caret-up` · `caret-up-down` · `caret-up-down-fill` · `caret-up-fill` · `chat-centered-text` · `chat-centered-text-fill` · `chat-dots` · `chat-dots-fill` · `chats-circle` · `chats-circle-fill` · `check` · `check-circle` · `check-circle-fill` · `check-fat` · `check-fat-fill` · `check-fill` · `check-square` · `check-square-fill` · `circle` · `circle-fill` · `circle-notch` · `circle-notch-fill` · `clock` · `clock-fill` · `cloud-arrow-up` · `cloud-arrow-up-fill` · `cloud-check` · `cloud-check-fill` · `code` · `code-fill` · `database` · `database-fill` · `dots-six-vertical` · `dots-six-vertical-fill` · `dots-three` · `dots-three-fill` · `dots-three-vertical` · `dots-three-vertical-fill` · `download-simple` · `download-simple-fill` · `equals` · `equals-fill` · `eye` · `eye-fill` · `eye-slash` · `eye-slash-fill` · `file` · `file-fill` · `film-reel` · `film-reel-fill` · `fire` · `fire-fill` · `fire-solid` · `flask` · `flask-fill` · `function` · `function-fill` · `funnel-simple` · `funnel-simple-fill` · `git-branch` · `git-branch-fill` · `globe` · `globe-fill` · `globe-simple` · `globe-simple-fill` · `graph` · `graph-fill` · `handshake` · `handshake-fill` · `hourglass-low` · `hourglass-low-fill` · `house-line` · `house-line-fill` · `image` · `image-fill` · `info` · `info-fill` · `layout` · `layout-fill` · `lightbulb` · `lightbulb-fill` · `link` · `link-fill` · `list` · `list-bullets` · `list-bullets-fill` · `list-dashes` · `list-dashes-fill` · `list-fill` · `list-numbers` · `list-numbers-fill` · `magnifying-glass` · `magnifying-glass-fill` · `megaphone` · `megaphone-fill` · `minus` · `minus-circle` · `minus-circle-fill` · `minus-fill` · `note-pencil` · `note-pencil-fill` · `package` · `package-fill` · `paint-brush` · `paint-brush-fill` · `palette` · `palette-fill` · `paperclip` · `paperclip-fill` · `pen-nib` · `pen-nib-fill` · `pencil-simple` · `pencil-simple-fill` · `plus` · `plus-circle` · `plus-circle-fill` · `plus-fill` · `rectangle-group` · `rectangle-group-fill` · `rectangle-stack` · `rocket` · `rocket-fill` · `rows` · `rows-fill` · `seal-check` · `seal-check-fill` · `smiley` · `smiley-fill` · `smiley-plus` · `smiley-plus-fill` · `sort-ascending` · `sort-ascending-fill` · `sort-descending` · `sort-descending-fill` · `thumbs-up` · `thumbs-up-fill` · `trash` · `trash-fill` · `trash-simple` · `trash-simple-fill` · `user` · `user-check` · `user-check-fill` · `user-fill` · `user-minus` · `user-minus-fill` · `user-plus` · `user-plus-fill` · `user-sound` · `user-sound-fill` · `users` · `users-fill` · `users-three` · `users-three-fill` · `warning` · `warning-circle` · `warning-circle-fill` · `warning-fill` · `x` · `x-circle` · `x-circle-fill` · `x-fill`

In-house glyphs are marked in the table above and listed by `CUSTOM_ICON_NAMES`.
