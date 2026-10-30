# SourceTag

Where an Added Value came from, as the source's name in a blue tag — a component,
and a `Tag` wearing one fixed look.

Read off the Figma `Source_Tag` (`6809:39656`, Tags page).

## Composed of

| Piece | Tier |
|---|---|
| `Tag` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `SourceTag` | Showing an AV's source: detail cards, tables |
| [`CycleTag`](cycle-tag.md) | The cycle an AV belongs to, which sits beside it |
| `Badge` / `Tag` | Generic classification with no VCP meaning |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `source` | `string` | — | Required. The source's name, shown as given |
| `className` | `string` | — | Merged via `cn()` |
| `ref`, rest | | | On the `<span>` |

**Sources are data, not vocabulary.** They are whatever systems and suppliers the
account has, so unlike `StatusTag` or `UrgencyTag` there is no mapping in this
file, and the text is not changed. The design's example, "BESA DIGITAL", is in
capitals because that is the source's name; the tag applies no `uppercase`.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Fill | `accent.info.tonal.surface.default` | `bg-accent-info-tonal-surface-default` |
| Text | `accent.info.tonal.content.default` | `text-accent-info-tonal-content-default` |
| Border | `accent.info.outline.border.default`, 1 | `border border-accent-info-outline-border-default` |
| Shape and type | `Tag` `md`: 28 tall, 8 padding, `radius.sm`, `label-sm-medium` | from `Tag` |

None of `Tag`'s four styles is a fill **and** a border, so this is the tonal info
`Tag` with the border colour added. Nothing new is needed in `Tag` for it.

Contrast: text on the fill **5.6:1** light, **7.29:1** dark. The border is
decoration (the name says everything): 3.08:1 in light, 1.98:1 in dark.

The dark theme comes for free — every colour above is a semantic token.

## Accessibility

- The tag is plain text in a `<span>`: it takes no focus and fires no events. The
  name is announced once.
- Meaning is in the words, never the colour alone.

## Don't

- **Don't make it clickable.** If a source must be filtered by or removed, that
  is a `Chip`.
- **Don't map sources to colours at a call site.** Every source looks the same,
  as in the design.
- **Don't uppercase it in the tag.** Pass the name as the source writes it.
