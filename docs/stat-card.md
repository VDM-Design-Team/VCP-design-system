# StatCard

One number that matters, on a card: label, value in the numeric face,
optional unit, delta and footer. Dashboards tile these.

## When to use

| Use | For |
|---|---|
| `StatCard` | A headline figure with at most one comparison |
| `Card` | Anything with real content — headings, body, actions |
| `DonutChart` in a StatCard | A consumed-of-total figure that wants a gauge (see the WithADonut story) |
| `DataTable` | The numbers behind the headline |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `ReactNode` | required | What the number is. A `<span>`, deliberately not a heading |
| `value` | `ReactNode` | required | The figure — or a node (a small `DonutChart` works) |
| `unit` | `ReactNode` | — | Beside the value — "pts", "of 40" |
| `delta` | `ReactNode` | — | The change, **sign included** — "+12%", "−0.3" |
| `deltaTone` | `positive \| negative \| neutral` | `neutral` | **Judgment, not direction** — see below |
| `icon` | `ReactNode` | — | Corner glyph, decorative |
| `footer` | `ReactNode` | — | Context — "vs last cycle" |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The card |

## Delta is judgment, not direction

The export's `deltaTone` was `up`/`down` and painted up green — but "handling
cost +12%" going up is bad news. The caller passes the *verdict*
(`positive`/`negative`/`neutral`); the sign in the delta text carries the
direction; the colour never carries it alone. Where the verdict comes from a
threshold, the threshold is domain knowledge — same ruling as ProgressBar.

## Tokens

Card: `surface.elevated` on `stroke.subtle`, `radius.md`, `shadow.card` —
Card's own dress. Label/unit/footer `body-sm` `text.tertiary`; value in
`font.family.numeric` at `heading-lg` (the ramp has no display-size numeric
step; 24/semibold Inter is the nearest honest fit for the export's 28/600);
delta in the numeric face at `caption-md`. No new tokens.

| Pair | Light | Dark |
|---|---|---|
| Value on the card | **20.17:1** | **14.63:1** |
| Label on the card | **7.58:1** | **9.85:1** |
| Positive delta | **9.05:1** | **10.44:1** |
| Negative delta | **8.36:1** | **12.00:1** |

## Accessibility

- The label is a `<span>`, not a heading — eight stat tiles must not
  contribute eight `<h3>`s to the outline; the dashboard section's heading
  owns them. (This is also why it does not compose `Card`, which renders a
  real heading.)
- Reading order is label → value → unit → delta → footer, which is the
  sentence: "Open claims, 128, +12%, vs last cycle".
- The delta's sign is in the text, so the verdict colour is never the only
  signal.
- The corner icon is decorative and hidden.

## Don't

- **Don't map direction to tone mechanically** — `deltaTone={delta > 0 ?
  'positive' : …}` is exactly the bug this API exists to prevent.
- **Don't omit the sign from `delta`** and lean on colour — "12%" in red is
  invisible information to a colour-blind reader.
- **Don't put actions in it.** A stat that opens the detail wants a real link
  beside or under the tile, not a clickable card.
- **Don't tile twelve.** Past a handful, the headline figures stop being
  headlines; the rest is a table.
