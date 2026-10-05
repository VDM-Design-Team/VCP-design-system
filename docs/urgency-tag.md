# UrgencyTag

How urgent an Added Value is, as a glyph and a word — a component, and the
owner of VCP's urgency vocabulary: this file and its `.tsx` are where the
urgency → glyph/colour mapping lives, and nowhere else.

Read off the Figma `Urgency_Tag` set (`3330:314`), audit batch 5,
11 September 2026.

## Composed of

| Piece | Tier |
|---|---|
| `Tag` | atom |
| `Icon` | sub-atomic |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `UrgencyTag` | Showing an AV's urgency: tables, cards, detail panels |
| `Badge` | Generic classification with no VCP vocabulary |
| `TypeTag` | An AV's *type*, which is a different scale with its own glyphs |

**The tier rule, demonstrated — the other way this time.** This composes
`Tag`, a piece of the system, not just `Icon`'s sub-atomic decoration — so per
CLAUDE.md's composition test it is a *component*, not an atom, even though the
VCP vocabulary it carries doesn't change. (It was an atom before it composed
`Tag`, when it hand-rolled its own shell instead — see `docs/tag.md` for why
that changed.)

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
- Figma's `Urgency_Tag` labels use `neutral.textual.content.default`, a token
  family that still doesn't exist in `tokens/semantic/`. `Tag`'s `textual`
  variant (which this composes) works around that by reusing
  `neutral.outline.content.default` — the same value, slate-600 — rather than
  waiting on the token. See issue #103 for the token-family gap itself.

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
on any screen. `Tag` (the piece this composes) already supports all four
styles — when one is needed here, pass `variant` through to the `Tag` this
renders rather than building a second component.
