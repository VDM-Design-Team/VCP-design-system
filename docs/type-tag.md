# TypeTag

An Added Value's type, as a glyph and a word — an atom, and the owner of VCP's
type vocabulary: this file and its `.tsx` are where the type → glyph/colour
mapping lives, and nowhere else.

Read off the Figma `Type_Tag` set (`3491:6845`), audit batch 5,
11 September 2026.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | sub-atomic |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `TypeTag` | Showing an AV's type: tables, cards, detail panels |
| `UrgencyTag` | An AV's *urgency*, which is a different scale with its own glyphs |
| `Badge` | Generic classification with no VCP vocabulary |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `AVType` | — | Required. Three values; a typo is a compile error |

`AV_TYPES` exports the vocabulary heaviest-first, the order the design ranks
them in.

## The mapping

| Type | Glyph | Glyph colour |
|---|---|---|
| Type 1 | `caret-triple-up` | `accent.critical.outline.content.default` |
| Type 2 | `caret-double-up` | `accent.warning.outline.content.default` |
| Type 3 | `caret-up` | `text.brand.medium` |

The **label** is `neutral.outline.content.default` for all three, same reason
as `UrgencyTag`: the glyph carries the scale so the column reads as a ranking.

**The vocabulary is closed, unlike `StatusPill`'s.** Statuses have a per-domain
middle this repo does not own; types do not — the design draws exactly three
and the numbering *is* the meaning. A fourth gets a row here, which is a
deliberate compile error at every call site rather than a silent fall-through.

One Figma deviation, zero-pixel, raised with design on 11 September 2026:
Figma paints the Type 3 caret with `action.secondary.border.default`, a control
token used as a decorative foreground. `text.brand.medium` is the same value
(the brand navy, `#1a56db`) in the right family and is what ships.

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
assembled on any screen. When one is needed, add a `variant` here rather than a
second component.
