# Timeline

A vertical run of events: node, title, timestamp, optional actor and detail.
An `<ol>`, because the order is the meaning.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `Timeline` | What happened to one thing, in order — an activity history |
| `DataTable` | Events you filter and sort — an audit *log* is a table |
| `StatusProgression` *(pattern, to port)* | Where something is in a fixed set of stages |

A timeline reads; a log queries. If users need "only comments from Marvin",
they need the table.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `TimelineItem[]` | required | `{ id?, title, timestamp?, actor?, detail?, tone?, icon? }` |
| `className` | `string` | — | Merged via `cn()`; the root is the `<ol>` |
| `ref` | `Ref<HTMLOListElement>` | — | — |

Per item: `tone` colours the node (default `neutral`); `icon` is the node's
glyph (default `clock`, typed to `IconName` so a glyph the system doesn't ship
is a compile error); `actor` renders an `Avatar size="sm"` and the name;
`id` defaults to the index — fine for static lists.

## Generic tones only

The export's `kind` took VCP lifecycle names — `accepted`, `handoff`,
`status`. Same ruling as Badge: **that vocabulary belongs to patterns.**
`tone` is `neutral | brand | info | success | warning | danger`, and the
future activity pattern owns the event-kind → tone/icon mapping. (Two of the
export's kinds also had no ramp behind them — the indigo and amber were raw
literals.)

## Tokens

Node: a ring and glyph in one colour per tone on `surface.elevated` — the
darker `accent.*.outline.content` step, **not** the mid `outline.border` the
export's look implied, because a yellow-500 ring on white measures 1.91:1.
Connector `stroke.subtle` (decorative). Title `label-md` `text.primary`,
timestamp `label-sm` `text.subtle`, actor/detail `body-sm` `text.tertiary`.
No new tokens.

| Tone (ring & glyph) | Light | Dark |
|---|---|---|
| `neutral` | **7.58:1** | **9.85:1** |
| `brand` | **9.04:1** | **6.33:1** |
| `info` | **5.25:1** | **3.89:1** |
| `success` | **4.95:1** | **6.60:1** |
| `warning` | **4.93:1** | **7.66:1** |
| `danger` | **4.77:1** | **5.06:1** |

Every tone clears the 3:1 UI-graphic bar in both themes; `info` in dark is
the floor at 3.89:1.

## Accessibility

- A real ordered list: "list, 4 items" *is* the shape of the history.
- Nodes and connectors are `aria-hidden` — decoration around the text that
  carries everything. Colour is never the only signal: the glyph differs per
  event, and the title says what happened.
- Timestamps are content, not `<time>` — pass a `<time dateTime>` in
  `timestamp` if machine-readable dates matter to the caller.

## Don't

- **Don't map VCP statuses to tones at call sites.** Three screens doing
  `tone={status === 'rejected' ? 'danger' : …}` is the activity pattern
  asking to be written.
- **Don't make items clickable by wrapping the `<li>`.** Put a real link in
  `title` or `detail`.
- **Don't use it as a stepper or progress indicator** — it records the past;
  `StatusProgression` (pattern) will show the fixed stages.
- **Don't interleave unrelated objects' events** — one timeline, one thing.
