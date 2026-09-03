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
| `tone` | `brand \| success \| warning \| danger` | `brand` | Consumption status — the caller's judgment |
| `size` / `thickness` | `number` | `140` / `16` | SVG geometry — a chart is measured, not stepped |
| `half` | `boolean` | — | The half-donut gauge (Cycle Summary treatment) |
| `label` | `ReactNode` | derived `%` | Replaces the centred text. Visual only |
| `caption` | `ReactNode` | — | Line under the number — "of 40 pts". A string doubles as `aria-label` |
| `className` | `string` | — | On the wrapper |

## Auto-escalation is gone

The export turned amber at 75% and red at 90% on its own, and its `tone`
accepted arbitrary colour strings. Both removed: **thresholds are domain
knowledge** (docs/progress-bar.md carries the ruling), and colours are
tokens. The Tones story shows the caller walking `brand → warning → danger`
by its own rules. If the same thresholds appear at three call sites, that is
a pattern to write.

## Tokens

The ProgressBar set, stroke-flavoured: track `surface.track`, fills
`surface.brand.strong` and the `accent.{success,warning,danger}.filled`
surfaces. Centre numeral in the numeric face (`font.family.numeric`,
semibold), scaled with the ring — geometry, not the type ramp; caption
`label-sm` `text.tertiary`. No new tokens. Fill-vs-track contrast is measured
per tone in docs/progress-bar.md (floor 3.84:1, dark danger) and applies
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
