# UrgencyTag

How urgent an Added Value is, as a glyph and a word — an atom, and the owner
of VCP's urgency vocabulary: this file and its `.tsx` are where the urgency →
glyph/colour mapping lives, and nowhere else.

Read off the Figma `Urgency_Tag` set (`3330:314`), audit batch 5,
11 September 2026.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | sub-atomic |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `UrgencyTag` | Showing an AV's urgency: tables, cards, detail panels |
| `Badge` | Generic classification with no VCP vocabulary |
| `TypeTag` | An AV's *type*, which is a different scale with its own glyphs |

**The tier rule, demonstrated.** This composes no piece of the system — only
`Icon`, which is sub-atomic decoration — so it is an atom, per CLAUDE.md's
composition test. The VCP vocabulary it carries doesn't change its tier; it
changes its *ownership*.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `urgency` | `AVUrgency` | — | Required. Four values; a typo is a compile error |

`AV_URGENCIES` exports the vocabulary least-urgent to most, for pickers,
filters, legends and tests.

## The mapping

| Urgency | Glyph | Glyph colour |
|---|---|---|
| Low | `caret-double-down` | `accent.success.outline.content.default` |
| Normal | `equals` | `neutral.outline.content.default` |
| High | `caret-double-up` | `accent.warning.outline.content.default` |
| Urgent | `fire` | `accent.critical.outline.content.default` |

The **label** is `neutral.outline.content.default` for all four. That is the
design's decision, not a simplification: four coloured words in a table column
read as four unrelated statuses, whereas same-weight words with a rising glyph
read as a scale.

Two Figma deviations, both zero-pixel and both raised with design on
11 September 2026:

- Figma paints the flame with `accent.critical.filled.surface.default`, a
  background token used as a foreground. `accent.critical.outline.content.default`
  is the same value in the right family and is what ships.
- Figma's `Urgency_Tag` labels use `neutral.textual.content.default`, a family
  this repo does not model yet. It resolves to slate-600, which is exactly
  `neutral.outline.content.default`. See issue #103 — modelling the full
  neutral families (`filled`, `tonal`, `outline`, `textual`) belongs with the
  General Design Library work, not here.

**A trap worth naming:** the repo's type ramp and Figma's share names but not
values. Figma draws the label at its `label-sm`, which is 14px; this repo's
`label-sm` is 11px. The label ships as `label-lg` — 14px medium — which is the
same pixels under a different name. Read a spec off the canvas by value.

## Accessibility

- **Colour is never the only cue.** Each urgency has a distinct glyph *shape*
  as well as a distinct hue, so the scale survives greyscale and every kind of
  colour blindness (WCAG 1.4.1).
- The glyph is `aria-hidden`. The word beside it already names the urgency, so
  labelling the glyph too would make every cell announce twice. The
  `AnnouncesOnce` story is the check that keeps it that way.
- Label contrast on `surface.elevated`: **7.46:1** light, **9.34:1** dark.
  Glyph contrast clears 3:1 in both themes (WCAG 1.4.11).

## Don't

- **Don't re-derive the mapping at a call site.** If you are writing
  `urgency === 'Urgent' ? 'fire' : …`, the line you want is already in
  `UrgencyTag.tsx`. That is the whole reason this component exists.
- **Don't colour the label by urgency.** It reads as four statuses, not a
  scale.
- **Don't add a fifth urgency without design.** The four are the design's
  vocabulary; a new one needs a glyph and a colour decided there first.
- **Don't make it clickable.** Changing an AV's urgency is an editor's job,
  not a tag's.

## Still open

Figma draws tonal and outline styles for every urgency. Neither is assembled
on any screen. They are not built here — when a screen needs one, add a
`variant` to this atom rather than a second component.
