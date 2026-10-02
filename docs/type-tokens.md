# Type tokens — the ramp, and what replaced what

Usage guidance for the semantic typography tokens in
`tokens/semantic/type.json`, rebuilt 24 September 2026. See
[Foundations/Tokens](../src/foundations/Foundations.stories.tsx) in Storybook
for the tokens in context; this doc is the ramp itself and the migration from
the ramp it replaced.

## Naming

`text-{tier}-{size}-{weight}` — six tiers (`display`, `heading`, `title`,
`body`, `label`, `caption`), a tier-specific size, and a weight. Not every
size ships every weight; use the table below rather than guessing a
combination into existence.

All Poppins (`font.family.sans`). Components that need Inter for dense
numerics or tabular figures still add `font-numeric` alongside the size
utility (`StatCard`, `Chip`'s count, `DatePicker`'s grid) — that pairing is
unchanged by this ramp.

## The ramp

| Tier | Size | Weights |
|---|---|---|
| Display | `xl` 64px, `lg` 48px, `md` 40px | bold, semibold |
| Heading | `xl` 32px, `lg` 24px | bold, semibold, regular |
| Heading | `md` 20px | bold only |
| Title | `md` 20px, `sm` 16px | bold, semibold, regular (`sm` adds medium) |
| Body | `lg` 18px, `md` 16px, `sm` 14px | bold, semibold, medium, regular |
| Label | `md` 16px | semibold, medium, regular |
| Label | `sm` 14px | bold, semibold, medium, regular |
| Caption | `md` 12px, `sm` 10px | bold, semibold, medium, regular |

Pick by hierarchy first (which tier), then density (which size), then
emphasis (which weight) — not by "what looked closest to the old class".

## What replaced what

The ramp this replaced had one weight per size and drifted from Figma's own
values in several places (`docs/data-table.md` batch 5 recorded one: Figma's
`label-sm` reads 14, the old repo token was 11). This rebuild fixes that by
adopting the weight-per-size structure directly. Existing call sites were
migrated to the token carrying the **same rendered size and weight**, which is
why some map across tiers:

| Old class | New class | Size/weight |
|---|---|---|
| `text-display-xl` | `text-display-xl-bold` | 64/700, unchanged |
| `text-heading-lg` | `text-heading-lg-semibold` | 24/600, unchanged |
| `text-heading-md` | `text-title-md-semibold` | 20/600, unchanged |
| `text-heading-sm` | `text-title-sm-semibold` | 16/600, unchanged |
| `text-title-sm` | `text-title-sm-semibold` | 16/600, unchanged |
| `text-body-lg` | `text-body-md-regular` | 16/400, unchanged |
| `text-body-md` | `text-body-sm-regular` | 14/400, unchanged |
| `text-body-sm` | `text-caption-md-regular` | 12/400, unchanged (Body → Caption) |
| `text-label-lg` | `text-label-sm-medium` | 14/500, unchanged |
| `text-label-md` | `text-label-sm-medium` | 13→14/500, rounded |
| `text-label-sm` | `text-caption-md-medium` | 11→12/500, rounded (Label → Caption) |
| `text-caption-md` | `text-caption-md-medium` | 12/500, unchanged |
| `text-caption-sm` | `text-caption-sm-semibold` | 10/600, unchanged |

`display-lg` and `display-md` had no consumers, so there was nothing to
migrate for them; they're superseded by the new Display tier's `lg`/`md`
steps.

Two consolidations happened as a side effect of matching by value rather than
by name: `heading-sm` and the pre-existing `title-sm` were already the same
16/600 under two different names, and `label-lg`/`label-md` (14/500 and
13/500) collapse onto the one 14/500 step now that the ramp doesn't carry an
odd 13px rung. Neither changes what renders — those old pairs were already the
same size, or within a pixel of each other.

## Guidance for AI agents

- Match by size and weight, not by tier name, when porting a value from a
  spec or an older token — a "label" in one system can be a "caption" in
  another at the identical pixel value.
- `Skeleton`'s `textStyle` prop keeps its pre-existing key names
  (`'body-md'`, `'label-lg'`, …) — its internal line-height lookup was
  repointed at the matching new token in the table above, but the prop's own
  API did not change. Don't "helpfully" rename those keys to match the new
  ramp; that would be an unrelated breaking change.
- If a component needs a size/weight combination the table doesn't list,
  that's a real gap — add the token to `tokens/semantic/type.json` first
  (rule 1 in `CLAUDE.md`), don't approximate with the nearest existing one.
