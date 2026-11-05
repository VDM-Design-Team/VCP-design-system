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
`brand → warning → critical` as points run down — but the threshold that decides
*when* is domain knowledge, so it belongs to the caller (or a future pattern),
never in here. If you find the same threshold copy-pasted at three call sites,
that is a pattern asking to be written.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | required | Clamped into `0…max` |
| `max` | `number` | `100` | The whole. The announced value stays in real units (34 of 40); only the painted width is a percentage |
| `tone` | `brand \| success \| warning \| critical \| info \| pending \| caution` | `brand` | See above — status, not decoration. `info` is `accent.info.filled.surface`, `pending` and `caution` are the bright orange and yellow shades (`accent.pending.outline.border`, `accent.yellow.medium`) and **fail 3:1 on the light track** — only beside a written value |
| `size` | `sm \| md` | `md` | 4 / 8 tall. `sm` for dense table rows |
| `labelSize` | `sm \| md` | `sm` | Type size of the label row: 12px caption, or 14px label (`md`) when the words are the main signal. Independent of `size` |
| `label` | `string` | — | Visible name beside the value, above the bar by default, wired via `aria-labelledby` |
| `showValue` | `boolean` | — | Rounded percentage at the row's end, in the numeric face |
| `valueLabel` | `string` | — | Words instead of a percentage ("Strong", "34 of 40 used"): painted at the row's end and announced as `aria-valuetext` |
| `role` | `progressbar \| meter` | `progressbar` | `meter` for a value within a range that is not progress toward finishing — a capacity, a strength |
| `labelPlacement` | `above \| below` | `above` | Which side of the bar the label row sits on. `below` is what Figma draws for the Domain Budget bar |
| `className` | `string` | — | Merged via `cn()`; the root is the wrapping `<div>` |

The export's `height?: number` became the `size` variant and its `showLabel`
split into `label` + `showValue` — the export conflated naming the meter with
showing its value, and the accessible name only needs the former.

## Tokens

Fills: `surface.brand.strong`, then the `accent.{success,warning,critical}.filled`
surfaces — the same strong family `Banner` uses. Track: **`surface.track`, a
token added for this component** (slate-200 light / slate-700 dark). No
pre-existing token worked: the closest, `surface.neutral.medium`, dropped the
critical fill to 1.25:1 in dark.

Fill against track, measured (3:1 is the bar for meaningful graphics):

| Tone | Light | Dark |
|---|---|---|
| `brand` | **5.01:1** | **4.48:1** |
| `success` | **4.01:1** | **3.22:1** |
| `warning` | **4.00:1** | **5.42:1** |
| `critical` | **3.87:1** | **2.72:1** ⚠ |
| `info` | **4.26:1** | **2.75:1** ⚠ |
| `pending` | **2.27:1** ⚠ | **2.91:1** ⚠ |
| `caution` | **1.28:1** ⚠ | **5.42:1** |

The trade: the track itself whispers against surfaces (1.23:1 light on white,
1.41:1 dark on `surface.elevated`, 1.72:1 on the dark canvas), so a bar or ring
shows its whole length on a card in both themes. Until November 2026 the dark
track was slate-800, the same colour as a dark card, which kept every fill
above 3.8:1 but made the track vanish there, and an empty gauge drew nothing at all.
slate-700 is the first step that shows, and it costs three dark fills their 3:1
against the track: `critical`, `info` and `pending`. Each still clears **3.84:1
against the card around the bar**, so the fill's extent reads, and the announced
value never depends on colour. A meter in one of those tones on a dark card
should print its value beside it.

## Accessibility

- `role="progressbar"` with `aria-valuemin/max/now` — real units, not the
  painted percentage.
- The visible `label` names the meter via `aria-labelledby`. **A bar with no
  `label` must get `aria-label`** — it lands on the meter itself, not the
  wrapper (fixed 10 Sep 2026) — because an unnamed meter announces as "64%… of
  what?".
- Colour is never the only signal: the value is announced, and `showValue`
  paints it. If tone changes meaning mid-flow (warning → critical), the caller
  should say so in text nearby, not rely on the hue shift.
- Not for waits: this never renders indeterminate. That is `Spinner`.

## Don't

- **Don't put the tone threshold in a component.** `tone={pts > 90 ? 'critical' :
  …}` repeated across call sites is a pattern (VCP vocabulary) to write once.
- **Don't ship an unnamed bar.** No `label` and no `aria-label` fails the first
  screen-reader pass.
- **Don't animate `value` on mount from 0.** The 300ms width transition is for
  real changes; a fake fill-up animation misreports progress.
- **Don't use it as a divider or a decorative accent line.** It announces a
  value.
