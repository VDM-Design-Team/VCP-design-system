# DonutChart

One fraction of one whole, as a ring — or a half-ring gauge. `ProgressBar`
bent into a circle, and deliberately its twin.

## When to use

| Use | For |
|---|---|
| `DonutChart` | The same fact as ProgressBar, where the layout wants a focal figure — a summary tile, a gauge |
| `ProgressBar` | The same fact inline — rows, cards, forms |
| Neither | **Parts of a whole across categories** — this component shows one value, not a breakdown |

If you need three segments in the ring, that is a different chart with a
legend and real per-segment accessibility — extend deliberately, don't stack
two of these.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | required | Clamped into `0…max`; announced in real units |
| `max` | `number` | `100` | — |
| `tone` | `brand \| success \| warning \| critical \| yellow` | `brand` | Consumption status — the caller's judgment. `yellow` is `accent.yellow.medium`, a light yellow softer than `warning`; it does not reach 3:1 on the track, so keep the number beside it |
| `size` / `thickness` | `number \| "icon"` / `number` | `140` / `16` | SVG geometry — a chart is measured, not stepped. `size="icon"` is the small decorative one for table rows: a 20 box around a 16 ring (thickness 2), no numeral |
| `half` | `boolean` | — | The half-donut gauge (Cycle Summary treatment) |
| `segmented` | `boolean` | — | Flat ends and a gap between the filled arc and the remainder (the gap is a quarter of `thickness`), instead of a round-capped fill over a full track. Pair with a thin `thickness` (8 on a 200 gauge) |
| `showValue` | `boolean` | `true` (`false` for `size="icon"`) | `false` draws the ring alone — no numeral, no caption — at any size. Still a meter: pass `aria-label` |
| `fillClassName` | `string` | — | Token `stroke-*` class for the filled arc; wins over `tone`. A token class, never a hex |
| `trackClassName` | `string` | — | Token `stroke-*` class for the track |
| `label` | `ReactNode` | derived `%` | Replaces the centred text. Visual only |
| `caption` | `ReactNode` | — | Line under the number — "of 40 pts". A string doubles as `aria-label` |
| `className` | `string` | — | On the wrapper |

## Auto-escalation is gone

The export turned amber at 75% and red at 90% on its own, and its `tone`
accepted arbitrary colour strings. Both removed: **thresholds are domain
knowledge** (docs/progress-bar.md carries the ruling), and colours are
tokens. The Tones story shows the caller walking `brand → warning → critical`
by its own rules. If the same thresholds appear at three call sites, that is
a pattern to write.

## Tokens

The ProgressBar set, stroke-flavoured: track `surface.track`, fills
`surface.brand.strong` and the `accent.{success,warning,critical}.filled`
surfaces. Centre numeral in the numeric face (`font.family.numeric`,
semibold), scaled with the ring — geometry, not the type ramp; caption
`label-sm` `text.tertiary`. No new tokens. Fill-vs-track contrast is measured
per tone in docs/progress-bar.md (floor 3.84:1, dark critical) and applies
unchanged.

## Accessibility

- `role="progressbar"` with real `aria-valuenow/min/max` — the same promise
  as ProgressBar, in the same units.
- **The meter needs a name.** A plain-string `caption` is used as
  `aria-label`; otherwise pass `aria-label` yourself — an unnamed gauge
  announces as "65% of nothing".
- The SVG and the centred text are hidden from assistive tech — the value is
  announced once, by the role, not three times.
- The 500ms sweep animates `stroke-dasharray` on change only; it does not
  loop, so no reduced-motion branch is needed.

## Don't

- **Don't re-implement auto-escalation in a wrapper** — set `tone` where the
  threshold lives, or write the pattern.
- **Don't use two of these for a comparison** — two gauges beside each other
  hide the difference; a bar pair shows it.
- **Don't put long text in `label`** — the centre fits a number; context goes
  in `caption` or beside the chart.
- **Don't animate `value` from 0 on mount** — the sweep is for real changes.
