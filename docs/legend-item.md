# LegendItem

One entry in a chart legend: a colour key and the word for it.

## When to use

| Use | For |
|---|---|
| `LegendItem` | Naming a colour a chart draws — "Completed", "Overdue", "Available" |
| `StatusTag` / `Badge` | Labelling a *thing* with its status, not keying a chart |

A legend is a row of these. Wrap them in a `<ul>` with `<li>` per item; the
component itself is an inline `<span>`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | The word for the colour. The accessible content |
| `tone` | `brand \| success \| warning \| critical \| info` | `brand` | `ProgressBar`'s and `DonutChart`'s tones (plus `info`), on the same tokens — pass the tone the chart draws |
| `size` | `sm \| md` | `md` | `md`: 12 swatch (rounded square) + 12 caption — dashboard charts. `sm`: 8 dot + 10 caption — under a Gantt chart |
| `className` | `string` | — | Merged via `cn()` |

Which tone means which status is the chart's call — "Overdue" is `critical`
because the chart that draws overdue work says so. A legend never decides.

## Tokens

Swatch: the `ProgressBar` fills — `surface.brand.strong` and
`accent.{success,warning,critical,info}.filled.surface`; their contrast against
the surface is the figures in `docs/progress-bar.md`. Label
`text.primary`, `caption-md-medium` / `caption-sm-medium`. Radius `xs` (4) on
the square, pill on the dot. No new tokens.

## Accessibility

- The swatch is `aria-hidden`; the label is the item. A screen reader hears
  "Completed", not a colour.
- **A legend cannot be the only link between a colour and a series.** The
  chart has to carry the name too (a tooltip, a direct label, a table) — that
  is the chart's job.
- The `filled` swatches are graphics at 3:1 or better, and the label sits right
  beside each one regardless.

## Don't

- **Don't make it interactive.** A toggle-the-series legend is a different
  control with its own states.
- **Don't invent a colour for a series.** Use a tone, or add a token first.
- **Don't put long text in `label`** — it is a key, not a caption.
