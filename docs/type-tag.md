# TypeTag

An Added Value's type, as a glyph and a word — a component, and the owner of
VCP's type vocabulary: this file and its `.tsx` are where the type →
glyph/colour mapping lives, and nowhere else.

Read off the Figma `Type_Tag` set (`3491:6845`), audit batch 5,
11 September 2026.

## Composed of

| Piece | Tier |
|---|---|
| `Tag` | atom |
| `Tooltip` | atom |
| `Icon` | sub-atomic |

Generated from the real imports — `npm test` fails if this list drifts.
`TypeTag` composes `Tag` (`variant="textual"`, `tone="neutral"`) rather than
hand-rolling its own shell — which is also why this piece lives in
`src/components/`, not `src/atoms/`: composing another piece of the system
moves it down a tier, per CLAUDE.md's composition rule.

## When to use

| Use | For |
|---|---|
| `TypeTag` | Showing an AV's type: tables, cards, detail panels |
| `UrgencyTag` | An AV's *urgency*, which is a different scale with its own glyphs |
| `Badge` | Generic classification with no VCP vocabulary |

## Variants

`variant` is `textual` (the default: the glyph and word alone), `tonal` (a pale fill in the glyph's hue family), `faint` (Figma's "Faint Fill": a white fill with a light grey edge, `stroke.default`, lighter than the neutral outline border because a tag is not a control; the Detail card uses it) or `outline` (a bordered pill, same hue): the Type_Tag set's four styles. The label stays neutral on a fill or a border; the glyph carries the colour. `size` takes `Tag`'s.
`info` adds the ⓘ the design draws after the word on the filled and bordered looks; it is decorative, and the page provides the explanation.

**The ⓘ is one step below the tag's glyph, and never below 16: 16 in the default 28 tag (beside its 20 glyph), 20 in the 32 (beside its 24), 16 in the smaller two. A deliberate exception to Figma, which draws it 20×20 in both its sizes.** Why: ⓘ is 16 everywhere else in the system (`InfoHint`, and the column hints in a table header), so the same glyph read two sizes depending on where it sat; at 20 it took a lot of the tag's width and weight for something decorative (the tag's tooltip carries the meaning); and it did not follow the tag's size like the leading caret does, so in a small tag (caret 16) the ⓘ was the larger of the two. In the default 28 tag the caret stays 20 beside the 16 ⓘ, and the largest tag steps the same way (24 and 20). If the design wants 20 back, it is the `INFO_SIZE` table in `TypeTag.tsx`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `AVType` | — | Required. Three values; a typo is a compile error |
| `tooltip` | `boolean` | `true` | Says what the type means on hover — "Type 3: Non-critical, no meaningful KPI impact" — as the design's tag does. The tag is not focusable, so this is a pointer nicety: the same meanings are on the Type column's header ⓘ, which keyboards reach. Turn it off where the meaning is already on screen |

`AV_TYPES` exports the vocabulary heaviest-first, the order the design ranks
them in. `AV_TYPE_MEANING` holds what each type means — the one place that copy lives — and
`TYPE_COLUMN_HINT` is the Type column's header tooltip built from it (the three meanings, the type in bold).

## The mapping

| Type | Glyph | Glyph colour |
|---|---|---|
| Type 1 | `caret-triple-up` | `accent.critical.outline.content.default` |
| Type 2 | `caret-double-up` | `accent.warning.outline.content.default` |
| Type 3 | `caret-up` | `text.brand.medium` |

The **glyph is 20 × 20** (`Icon` `md`) — the system's standard for the glyph in a `md` (28 tall) `Tag`; it was 24.

The **label** is `neutral.outline.content.default` for all three, same reason
as `UrgencyTag`: the glyph carries the scale so the column reads as a ranking.

**The vocabulary is closed, unlike `StatusTag`'s.** Statuses have a per-domain
middle this repo does not own; types do not — the design draws exactly three
and the numbering *is* the meaning. A fourth gets a row here, which is a
deliberate compile error at every call site rather than a silent fall-through.

One Figma deviation, zero-pixel, raised with design on 11 September 2026:
Figma paints the Type 3 caret with `action.secondary.border.default`, a control
token used as a decorative foreground. `text.brand.medium` is the same value
(the brand navy, `#1a56db`) in the right family and is what ships.

**A trap worth naming:** the repo's type ramp and Figma's share names but not
values. Figma draws the label at its `label-sm`, which is 14px; this repo's
`label-sm` is 11px. The label ships as `label-lg` — 14px medium — which is the
same pixels under a different name. Read a spec off the canvas by value.

## Accessibility

- **Colour is never the only cue.** One more caret stroke per step, so the
  ranking survives greyscale and every kind of colour blindness (WCAG 1.4.1).
- The glyph is `aria-hidden`; the word beside it already names the type. The
  `AnnouncesOnce` story is the check.
- Label contrast on `surface.elevated`: **7.46:1** light, **9.34:1** dark.

## Don't

- **Don't re-derive the mapping at a call site.**
- **Don't colour the label by type.**
- **Don't invent a Type 4.** Three is the design's vocabulary.
- **Don't make it clickable.**

## Still open

Figma draws tonal, faint-fill and outline styles for every type. None is
assembled on any screen. `Tag` (the piece this composes) already supports all
four styles — when one is needed here, pass `variant` through to the `Tag` this
renders rather than building a second component.
