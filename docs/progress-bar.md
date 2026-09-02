# ProgressBar

A determinate meter: how much of a known whole is used or done. Budget
consumption, upload progress, capacity.

## When to use

| Use | For | Promise |
|---|---|---|
| `ProgressBar` | A known fraction of a known whole | `aria-valuenow` — a real value |
| `Spinner` | A wait with no known end | `role="status"` — no value, ever |
| `Skeleton` | Content whose *shape* is known but not yet here | None — decorative |

**`tone` is consumption status, not decoration.** Budget dashboards walk it
`brand → warning → danger` as points run down — but the threshold that decides
*when* is domain knowledge, so it belongs to the caller (or a future pattern),
never in here. If you find the same threshold copy-pasted at three call sites,
that is a pattern asking to be written.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | required | Clamped into `0…max` |
| `max` | `number` | `100` | The whole. The announced value stays in real units (34 of 40); only the painted width is a percentage |
| `tone` | `brand \| success \| warning \| danger` | `brand` | See above — status, not decoration |
| `size` | `sm \| md` | `md` | 4 / 8 tall. `sm` for dense table rows |
| `label` | `string` | — | Visible name above the bar, wired via `aria-labelledby` |
| `showValue` | `boolean` | — | Rounded percentage at the row's end, in the numeric face |
| `className` | `string` | — | Merged via `cn()`; the root is the wrapping `<div>` |

The export's `height?: number` became the `size` variant and its `showLabel`
split into `label` + `showValue` — the export conflated naming the meter with
showing its value, and the accessible name only needs the former.

## Tokens

Fills: `surface.brand.strong`, then the `accent.{success,warning,danger}.filled`
surfaces — the same strong family `Banner` uses. Track: **`surface.track`, a
token added for this component** (slate-200 light / slate-800 dark). No
pre-existing token worked: the closest, `surface.neutral.medium`, dropped the
danger fill to 1.25:1 in dark.

Fill against track, measured (3:1 is the bar for meaningful graphics):

| Tone | Light | Dark |
|---|---|---|
| `brand` | **5.01:1** | **6.33:1** |
| `success` | **4.01:1** | **4.54:1** |
| `warning` | **4.00:1** | **7.66:1** |
| `danger` | **3.87:1** | **3.84:1** |

The trade: the track itself whispers against surfaces (1.23:1 light on base,
and in dark it matches `surface.base` exactly). That is deliberate — the
*fill* carries the boundary, in both themes, in every tone, and the announced
value never depends on either. `danger` in dark is the floor at 3.84:1.

## Accessibility

- `role="progressbar"` with `aria-valuemin/max/now` — real units, not the
  painted percentage.
- The visible `label` names the meter via `aria-labelledby`. **A bar with no
  `label` must get `aria-label`** — an unnamed meter announces as "64%… of
  what?".
- Colour is never the only signal: the value is announced, and `showValue`
  paints it. If tone changes meaning mid-flow (warning → danger), the caller
  should say so in text nearby, not rely on the hue shift.
- Not for waits: this never renders indeterminate. That is `Spinner`.

## Don't

- **Don't put the tone threshold in a component.** `tone={pts > 90 ? 'danger' :
  …}` repeated across call sites is a pattern (VCP vocabulary) to write once.
- **Don't ship an unnamed bar.** No `label` and no `aria-label` fails the first
  screen-reader pass.
- **Don't animate `value` on mount from 0.** The 300ms width transition is for
  real changes; a fake fill-up animation misreports progress.
- **Don't use it as a divider or a decorative accent line.** It announces a
  value.
