# StatCard

One number that matters, on a card: label, value in the numeric face,
optional unit, delta and footer. Dashboards tile these.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Icon` | atom | The `hint` info glyph |
| `Tooltip` | component | The `hint` explanation |

`npm test` checks this list against the real imports.

## When to use

| Use | For |
|---|---|
| `StatCard` | A headline figure with at most one comparison |
| A plain section with a heading | Anything with real content — headings, body, actions |
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
| `icon` | `ReactNode` | — | Glyph before the label, decorative |
| `accent` | `neutral \| info \| success \| critical \| warning` | `neutral` | The card's left edge |
| `hint` | `string` | — | Explanation behind an info glyph after the label. Omit it and there's no glyph |
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

`accent`'s five edges are `neutral.outline.border.default` and
`accent.{info,success,critical,warning}.outline.border.default` — the same
family `Input`'s `invalid` border and `IconButton`'s `neutral` variant
already reference individually, applied here as a `bg-*` fill on a 4px
decorative bar rather than as a `border-l`, so the edge colour can never
lose a CSS cascade fight with the card's own all-round
`border-stroke-subtle`. This is the first place all five sit side by side.

| Pair | Light | Dark |
|---|---|---|
| Value on the card | **20.17:1** | **14.63:1** |
| Label on the card | **7.58:1** | **9.85:1** |
| Positive delta | **9.05:1** | **10.44:1** |
| Negative delta | **8.36:1** | **12.00:1** |

## Accessibility

- The label is a `<span>`, not a heading — eight stat tiles must not
  contribute eight `<h3>`s to the outline; the dashboard section's heading
  owns them. It renders no heading of its own for that reason, and nothing it
  composes renders one either.
- Reading order is icon → label → hint → value → unit → delta → footer,
  which is the sentence: "Open claims, 128, +12%, vs last cycle" plus the
  hint button wherever it sits.
- The delta's sign is in the text, so the verdict colour is never the only
  signal.
- The icon and the accent edge are both decorative and hidden
  (`aria-hidden`) — the label text and the icon's own shape already carry
  which category a card belongs to, the same reasoning `Badge`'s tone
  colours lean on. Colour is confirmation, not the only signal.
- `hint` renders a real, focusable `button` (named "About &lt;label&gt;")
  wrapping the system `Tooltip`, not a `title` attribute — reachable by
  keyboard, not just hover.

## Don't

- **Don't map direction to tone mechanically** — `deltaTone={delta > 0 ?
  'positive' : …}` is exactly the bug this API exists to prevent.
- **Don't omit the sign from `delta`** and lean on colour — "12%" in red is
  invisible information to a colour-blind reader.
- **Don't put actions in it.** A stat that opens the detail wants a real link
  beside or under the tile, not a clickable card.
- **Don't tile twelve.** Past a handful, the headline figures stop being
  headlines; the rest is a table.
