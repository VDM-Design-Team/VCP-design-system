# CycleTag

The cycle an Added Value belongs to: its code and the dates it runs, "C18 (20/09/2025 -
02/10/2026)" — a component, and a `Tag` plus the one way VCP writes a
cycle.

Read off the Figma `Cycle_Tag` (`8562:11083`, Tags page).

## Composed of

| Piece | Tier |
|---|---|
| `Tag` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CycleTag` | Showing an AV's cycle: detail cards, tables |
| [`SourceTag`](source-tag.md) | The AV's source, which sits beside it |
| The cycle filter (`FilterBar`) | Choosing a cycle, not showing one |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `code` | `string` | — | Required. "C18" |
| `start` | `string` | — | Required. ISO `yyyy-mm-dd` |
| `end` | `string` | — | Required. ISO `yyyy-mm-dd` |
| `className` | `string` | — | Merged via `cn()` |
| `ref`, rest | | | On the `<span>` |

`formatCycleRange(start, end, locale?)` is exported: "20/09/2025 - 02/10/2026". Inside
a component, `useDateFormat().range` does the same and follows `DateFormatProvider`.
Any piece that lists cycles should use one of them, so the dates read the same
everywhere. (Until November 2026 cycles read "Sep 20, 2025 - Oct 02, 2026"; every date
now reads dd/mm/yyyy, decided 6 November.)

**The dates never pass through the machine's time zone.** With no locale the ISO
value is split; with one it is formatted in UTC. A cycle never shows the day before in
a western time zone, and a value that is not a date is shown as given.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Text | `neutral.outline.content.default` | from `Tag` `outline` / `neutral` |
| Fill | none (`neutral.outline.surface.default` is transparent) | from `Tag` |
| Border | `stroke.default`, 1 | `border-stroke-default` |
| Height, radius | 28, `radius.sm` | from `Tag` `md` |
| Type | `label-sm-medium`, 8 padding | from `Tag` |

**One difference from `Tag`, the design's.** The border is `stroke.default`, not
`neutral.outline.border.default`, which is a step darker: the border here is
decoration and the words carry everything, so the lighter stroke is as drawn.

**The size is `Tag`'s `md`, 28 — not the Figma frame's 32.** `Cycle_Tag` in Figma
was left at the `Tag` set's extra-large size (the scale is 20 / 24 / 28 / 32 there),
which is 32 tall with an 8 radius. Every other tag, `SourceTag` beside it
included, is the large 28, so the Figma component was wrong and not the design.
It is 28 here, and the Figma frame is to be corrected to match.

Contrast: text **7.58:1** on `surface.elevated` light, **9.85:1** dark. The
border is 1.48:1 in light and 1.93:1 in dark, which is fine for decoration — it
is not what tells you this is a cycle.

The dark theme comes for free — every colour above is a semantic token.

## Accessibility

- Plain text in a `<span>`: no focus, no events, and the cycle is announced as
  one string, "C18 (20/09/2025 - 02/10/2026)".
- Meaning is in the words, not the border.

## Don't

- **Don't build the string at the call site.** Pass `code`, `start` and `end` and
  let the tag write it.
- **Don't format the dates with `Date`.** That is what introduces the one-day
  time-zone error this avoids.
- **Don't make it clickable.** Picking a cycle is the filter's job.
