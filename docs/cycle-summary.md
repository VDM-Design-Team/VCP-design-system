# CycleSummary

How a cycle went, in one card: the points committed, completed and carried over, and a half-ring gauge of the completion rate.
Built to Figma's `Cycle_Summary` (`7498:5354`), `_Cycle_Summary_Card_Base` and `_Cycle_Summary_Half_Donut_Chart`.

## Composed of

| Piece | Tier |
|---|---|
| `DonutChart` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CycleSummary` | The summary of one cycle on an admin dashboard |
| `StatCard` / `StatCardGroup` | Headline figures that are not a cycle's committed / completed / carried-over trio |
| `DonutChart` | One fraction as a ring or gauge, anywhere else |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `committed` / `completed` / `carriedOver` | `number` | required | Points |
| `completion` | `number \| null` | — | The rate, 0–100, **the caller's** — what it is a rate of (points, Added Values, weighted) is the product's to say. Leave it out before there is one |
| `title` | `string` | `Cycle Summary` | |
| `completionLabel` | `string` | `Completion` | The word under the percentage |

## The completion band

The gauge's colour is the band the rate falls in. **This card owns the bands, once** (`completionBand`):

| Rate | Band | Ring and percentage |
|---|---|---|
| 100 | `complete` | green |
| 90–99 | `high` | green |
| 70–89 | `medium` | amber |
| under 70 | `low` | red |
| none | `none` | an empty grey ring over "-%" |

(Figma draws 100% and 90%-and-above separately but alike.) `DonutChart`'s ruling still holds — thresholds are domain knowledge — and
this is where the domain's live.

## Layout

A container query, so the card reflows by **its own** width, not the screen's — in a sidebar or a modal as well as full width:

| Card width | Layout |
|---|---|
| wide (about 56rem and up) | four across, a divider before each figure and the gauge |
| medium (about 28rem to 56rem) | two by two, a divider before the second column |
| narrow | stacked, no dividers |

## Tokens

Figures: a 12 dot (`action.primary.surface` blue, `accent.success.outline.border` green, `accent.warning.outline.content` brown), the
title `label-sm-medium` in `text.secondary`, the value `heading-xl-bold`. Figma's value is 28 bold; the ramp has no 28, so this uses
the 32 (`heading-xl`) the system's other headline figures use. The gauge is `DonutChart` (half, segmented, 200, thickness 8).

## Accessibility

- A `<section>` named by its title. The gauge is a `progressbar` named "Completion 90%" (or "Completion: no rate yet").
- Colour is never the only signal: the percentage is written out, and the dots sit beside their titles.

## Don't

- **Don't compute the rate here.** Pass `completion`.
- **Don't re-derive the bands at the call site.** Use `completionBand` if you need the same thresholds elsewhere.
