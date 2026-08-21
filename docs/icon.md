# Icon

A Heroicons v2 outline glyph, stroked with `currentColor`.

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
| `name` | `IconName` | — | One of the 82 glyphs. See the list below, or import `ICON_NAMES`. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 16 / 20 / 24. Dense cells / inline / nav. |
| `label` | `string` | — | Give the glyph an accessible name. **Only** when it is the sole carrier of meaning. |
| `className` | `string` | — | Merged via `cn()`. This is where colour goes. |

Everything else passes through to the `<svg>`. Returns `null` for an unknown name.

## Tokens

Icon uses **no colour token of its own** — that is deliberate.

| Concern | How |
|---|---|
| Colour | `currentColor`. Set a text token on the icon or its parent: `text-text-tertiary`, `text-accent-critical-tonal-content-default`. Themes for free. |
| Size | Tailwind's numeric scale: `size-4` / `size-5` / `size-6`. |
| Stroke | 1.5, matching the Heroicons outline set the Figma library draws from. |

## Accessibility

- **Decorative by default.** With no `label`, the glyph is `aria-hidden="true"` and has no role, so assistive tech skips it. This is right when a visible label sits beside it — otherwise the label gets announced twice.
- **`label` when the icon stands alone.** It renders `role="img"` with `aria-label`. An icon-only button needs a name on *the button*; if you have already labelled the button, leave the icon decorative rather than naming both.
- **`focusable="false"`** is set explicitly: without it, IE/Edge legacy put SVGs in the tab order. Harmless elsewhere, and cheap.
- **Contrast.** The glyph inherits its colour, so contrast is the caller's responsibility. A meaningful icon is a UI component under WCAG 1.4.11 and owes **3:1** against its background; an icon that duplicates adjacent text is decorative and exempt. `text-text-tertiary` (slate-600) is 7.6:1 on `surface.base` and safe; `text-text-subtle` is 4.76:1 and still fine; anything lighter needs checking.
- **Never rely on the glyph alone** to convey status. Pair it with text, as the accent tokens' `content` pairs assume.

## Why the set is trimmed

Heroicons v2 is ~300 glyphs across three weights. Inlining all of them would put roughly 100KB of path data into every consumer's bundle for the sake of the ~80 the product uses, and tree-shaking does not reliably help when the lookup is dynamic (`ICON_PATHS[name]`) — which is exactly what a `name`-driven API needs.

So `icons.ts` carries the 82 glyphs the VCP Figma library actually references, verbatim from the Claude Design export. **To add a glyph**: copy its 24×24 outline path from heroicons.com into `icons.ts`, keeping the kebab-case Heroicons name. The `IconName` union derives from that object, so TypeScript picks it up with no other change.

## Don't

- **Don't hand-draw an `<svg>` in a component.** Add the glyph to `icons.ts`. The export's own guidance says the same: "Never hand-draw SVGs."
- **Don't set `fill` or `stroke`.** Colour comes from `currentColor` via a text token on the parent.
- **Don't pass `label` to an icon that sits next to its own visible text** — that produces a double announcement.
- **Don't use an icon-only control without a name** on the control itself.
- **Don't size with `width`/`height` or arbitrary classes.** Use `size`; it is on the spacing scale.
- **Don't rename glyphs.** They match Heroicons, which is how anyone finds them.

## Available names

`adjustments-horizontal` · `archive-box` · `arrow-down-tray` · `arrow-left` · `arrow-path` · `arrow-right` · `arrow-top-right-on-square` · `arrow-up-tray` · `arrow-uturn-left` · `arrows-pointing-out` · `arrows-up-down` · `bars-3` · `bell` · `bell-slash` · `bookmark` · `briefcase` · `building-office` · `calendar` · `chart-bar` · `chat-bubble-left-right` · `check` · `check-circle` · `chevron-down` · `chevron-left` · `chevron-right` · `chevron-up` · `clipboard` · `clipboard-document-list` · `clock` · `cloud-arrow-up` · `cog-6-tooth` · `currency-dollar` · `document` · `document-duplicate` · `ellipsis-horizontal` · `ellipsis-horizontal-circle` · `ellipsis-vertical` · `envelope` · `envelope-open` · `exclamation-circle` · `exclamation-triangle` · `eye` · `fire` · `flag` · `folder` · `funnel` · `hand-thumb-up` · `inbox` · `information-circle` · `key` · `life-buoy` · `link` · `lock-closed` · `magnifying-glass` · `megaphone` · `minus` · `minus-circle` · `no-symbol` · `paper-clip` · `pencil-square` · `photo` · `plus` · `presentation-chart-bar` · `queue-list` · `rectangle-stack` · `shield-check` · `sparkles` · `square-3-stack-3d` · `squares-2x2` · `squares-plus` · `star` · `table-cells` · `tag` · `trash` · `trophy` · `user` · `user-circle` · `user-group` · `user-plus` · `users` · `x-circle` · `x-mark`
