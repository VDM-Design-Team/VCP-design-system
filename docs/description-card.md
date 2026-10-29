# DescriptionCard

One numbered entry in an Added Value's description: the problem, the solution,
the deliverable, the outcome the requester wants. A coloured number block on the
left and the paragraph in a quiet panel beside it.

Read off the Figma `Description_Card` set (`3969:4115`), four types.

## When to use

| Use | For |
|---|---|
| `DescriptionCard` | An entry in an AV's description, where the colour says which kind it is |
| `Banner` | A message about the page, not content of the record |
| `DetailRow` | A label and a value, not a paragraph |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `'problem' \| 'solution' \| 'deliverable' \| 'desired-outcome'` | `problem` | Decides the number block's colour |
| `position` | `number` | `1` | Its place in the list |
| `children` | `ReactNode` | — | The paragraph |
| `className` | `string` | — | Merged via `cn()` |

A card is one row. The list around it is the caller's: wrap several in an `ol`
when the numbering matters to a screen reader.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Number block, `problem` | `accent.critical.filled.surface.default` | `bg-accent-critical-filled-surface-default` |
| Number block, `solution` | `accent.success.filled.surface.default` | `bg-accent-success-filled-surface-default` |
| Number block, `deliverable` | `accent.info.filled.surface.default` | `bg-accent-info-filled-surface-default` |
| Number block, `desired-outcome` | `surface.neutral.stronger` | `bg-surface-neutral-stronger` |
| Number | `text.inverted.primary`, `type.label-sm-bold` | `text-text-inverted-primary text-label-sm-bold` |
| Panel | `surface.neutral.subtle`, `stroke.subtle` | `bg-surface-neutral-subtle border-stroke-subtle` |
| Paragraph | `text.primary`, `type.body-sm-regular` | `text-text-primary text-body-sm-regular` |
| Radius | `shape.radius.sm` | `rounded-sm` |
| Padding, min height | Tailwind numeric scale | `p-3` (panel), `px-1 py-2` (number), `min-h-12`, `min-w-5` |

**Two colours are stand-ins.** The design draws `deliverable` in a cyan that is on no
colour ramp, so it uses `info` until design picks a tone; and `desired-outcome` is drawn
in the darkest slate, which has no surface token, so it uses `surface.neutral.stronger`,
the strongest neutral fill. Both are one-line changes here when the tokens exist.

## Accessibility

- The number block is decorative (`aria-hidden`); the paragraph is the content. A list
  that needs its numbering announced is an `ol`, which numbers its own items.
- The colour is never the only signal: the type is the caller's heading or surrounding
  context, and the white number sits at 4.5:1 or better on all four fills in light and dark.

## Don't

- **Don't use the colour as a status.** It says what kind of entry this is, not how it is going.
- **Don't put controls in the panel.** It is a read-only paragraph; an editable one is a field.
- **Don't recolour a type per page.** The four colours are the types' identity.
