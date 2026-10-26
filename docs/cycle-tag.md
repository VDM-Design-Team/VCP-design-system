# CycleTag

The cycle an Added Value belongs to: its code and the dates it runs, "C18 (Sep 20,
2025 - Oct 02, 2026)" — a component, and a `Tag` plus the one way VCP writes a
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

`formatCycleRange(start, end)` is exported: "Sep 20, 2025 - Oct 02, 2026". Any
piece that lists cycles should use it, so the dates read the same everywhere.

**The dates are written from the string.** The ISO value is split, with no `Date`
and no time zone, so a cycle never shows the day before in a western time zone. A
value that is not a date is shown as given rather than as "undefined".

## Tokens

| Part | Token | Utility |
|---|---|---|
| Text | `neutral.outline.content.default` | from `Tag` `outline` / `neutral` |
| Fill | none (`neutral.outline.surface.default` is transparent) | from `Tag` |
| Border | `stroke.default`, 1 | `border-stroke-default` |
| Height, radius | 32, `radius.md` | `h-8 rounded-md` |
| Type | `label-sm-medium`, 8 padding | from `Tag` |

**Two differences from `Tag`, both the design's.** The tag is 32 tall with an 8
radius, where `Tag`'s `md` is 28 with 6 — the cycle's text is longer and sits
alone, so the design gives it more room. And the border is `stroke.default`, not
`neutral.outline.border.default`, which is a step darker: the border here is
decoration and the words carry everything, so the lighter stroke is as drawn.

Contrast: text **7.58:1** on `surface.elevated` light, **9.85:1** dark. The
border is 1.48:1 in light and 1.93:1 in dark, which is fine for decoration — it
is not what tells you this is a cycle.

The dark theme comes for free — every colour above is a semantic token.

## Accessibility

- Plain text in a `<span>`: no focus, no events, and the cycle is announced as
  one string, "C18 (Sep 20, 2025 - Oct 02, 2026)".
- Meaning is in the words, not the border.

## Don't

- **Don't build the string at the call site.** Pass `code`, `start` and `end` and
  let the tag write it.
- **Don't format the dates with `Date`.** That is what introduces the one-day
  time-zone error this avoids.
- **Don't make it clickable.** Picking a cycle is the filter's job.
