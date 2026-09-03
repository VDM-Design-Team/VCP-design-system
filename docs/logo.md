# Logo

The Value Chain Plus mark: the full lockup, or the diamond alone for the
collapsed rail.

## When to use

| Use | For |
|---|---|
| `Logo` | The product mark — TopBar, auth screens, email headers |
| `Logo collapsed` | The collapsed navigation rail |
| `Icon` | Everything that is not the brand |

There is exactly one brand mark. If a surface wants a variation the component
doesn't offer, that is a brand conversation, not a prop.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `sm \| md \| lg` | `md` | The Figma Small/Medium/Big variants → 16/28/44 tall; width follows the aspect |
| `collapsed` | `boolean` | — | The diamond alone |
| `decorative` | `boolean` | — | `aria-hidden` — for when a wrapping home link carries the name |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<SVGSVGElement>` | — | The `<svg>` |

## Where the asset finally came from

The export's Logo pointed at `/assets/logo-valuechainplus.png` and
`/assets/vcp-logo-vector.svg` — files that were never vendored anywhere. The
vectors here were pulled from the Figma **"VCP logo" component set** (VCP
Design Library, node `166:1226`, Navigation page) and live in
`logo-paths.ts` as generated path data — re-export from Figma to update,
never hand-edit.

## Tokens — the dark hack is gone

The export "themed" the logo by CSS-inverting a PNG. Two new tokens replace
that, mirroring the Figma variants exactly:

- **`text.logo`** — the wordmark: brand navy (`color.brand.navy`, a new core
  value with deliberately no ramp) in light, plain white in dark.
- **`text.logo-accent`** — the diamond: the brand blue in **both** themes;
  the accent does not theme, exactly as the Figma dark variant keeps it.

Both are Figma-variables debt alongside `surface.track` and the dark
`stroke.focused` fix. Minor bump.

## Accessibility

- `role="img"` named "Value Chain Plus" by default.
- Inside a home link, pass `decorative` and put the name on the link
  ("Value Chain Plus — home") — one announcement, not two. This is TopBar's
  usage, shown in the InAHomeLink story.
- The wordmark is white in dark via the token — no filters, no second asset,
  and contrast is the wordmark's own (navy on light surfaces 17+:1, white on
  dark surfaces 15+:1).

## Don't

- **Don't recolour it.** The mark's colours are the two logo tokens; a
  differently-coloured logo is a brand decision made in tokens, not a
  `className`.
- **Don't stretch it** — height via `size`, width follows.
- **Don't use the diamond as a generic icon** — it means "Value Chain Plus",
  nothing else.
- **Don't re-add image-file variants** — inline SVG is what makes the
  theming and crisp scaling work.
