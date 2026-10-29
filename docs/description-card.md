# DescriptionCard

One numbered entry in an Added Value's description: the problem, the solution,
the deliverable, the outcome the requester wants. A coloured number block on the
left and the paragraph beside it. Read it, or edit it: the paragraph becomes a
text field that grows with what is typed.

Read off the Figma `Description_Card` set (`3969:4115`), four types, and its base
(`_Description_Card_Base`: the same row and the error state of its field).

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |
| `Textarea` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DescriptionCard` | An entry in an AV's description, where the colour says which kind it is, in reading or editing |
| `Textarea` | A free-standing multi-line field with no number block |
| `Banner` | A message about the page, not content of the record |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `'problem' \| 'solution' \| 'deliverable' \| 'desired-outcome'` | `problem` | Decides the number block's colour |
| `position` | `number` | `1` | Its place in the list |
| `children` | `ReactNode` | — | Reading: the paragraph. Ignored while `editing` |
| `editing` | `boolean` | — | The paragraph becomes a text field |
| `value` / `onChange` | `string` / `(value) => void` | — | Editing, controlled |
| `defaultValue` | `string` | `''` | Editing, uncontrolled |
| `placeholder` | `string` | — | Editing, while empty |
| `invalid` | `boolean` | — | Editing: the critical border and `aria-invalid`. Pair with a message of your own |
| `label` | `string` | "Problem 1" … | Editing: the field's accessible name |
| `onRemove` / `removeLabel` | `() => void` / `string` | — / `Remove` | Editing: a remove button beside the row. It only reports; the list is yours. Say which: "Remove problem 2" |
| `className` | `string` | — | Merged via `cn()` |

A card is one row. The list around it, the section's title, the add button and any
attached files are the caller's: wrap several cards in an `ol` when the numbering
matters to a screen reader.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Number block, `problem` | `accent.critical.filled.surface.default` | `bg-accent-critical-filled-surface-default` |
| Number block, `solution` | `accent.success.filled.surface.default` | `bg-accent-success-filled-surface-default` |
| Number block, `deliverable` | `accent.info.filled.surface.default` | `bg-accent-info-filled-surface-default` |
| Number block, `desired-outcome` | `surface.neutral.stronger` | `bg-surface-neutral-stronger` |
| Number | `text.inverted.primary`, `type.label-sm-bold` | `text-text-inverted-primary text-label-sm-bold` |
| Reading panel | `surface.neutral.subtle`, `stroke.subtle` | `bg-surface-neutral-subtle border-stroke-subtle` |
| Editing field | `Textarea`'s: `surface.elevated`, `stroke.strong`, invalid `accent.critical.outline.border` | squared on the number's side: `rounded-l-none border-l-0` |
| Paragraph | `text.primary`, `type.body-sm-regular` | `text-text-primary text-body-sm-regular` |
| Remove | `IconButton` `danger`, `x-circle` | `size="sm"` (36) |
| Radius | `shape.radius.sm` | `rounded-sm` |
| Padding, min height | Tailwind numeric scale | `p-3` (panel), `px-1 py-2` (number), `min-h-12`, `min-w-5`, `gap-2` (to the remove button) |

**Two colours are stand-ins.** The design draws `deliverable` in a cyan that is on no
colour ramp, so it uses `info` until design picks a tone; and `desired-outcome` is drawn
in the darkest slate, which has no surface token, so it uses `surface.neutral.stronger`,
the strongest neutral fill. Both are one-line changes here when the tokens exist.

## Accessibility

- The number block is decorative (`aria-hidden`); the paragraph is the content. A list
  that needs its numbering announced is an `ol`, which numbers its own items.
- While editing, the field is a real `textarea` with an accessible name ("Problem 1" by
  default, or your `label`), `aria-invalid` when `invalid`, and its own focus ring.
- The remove button is an `IconButton`: icon-only with a required name.
- The colour is never the only signal: the type is the caller's heading or surrounding
  context, and the white number sits at 4.5:1 or better on all four fills in light and dark.

## Don't

- **Don't use the colour as a status.** It says what kind of entry this is, not how it is going.
- **Don't put controls in the reading panel.** It is a read-only paragraph; edit it with `editing`.
- **Don't keep the list inside the card.** One card is one row; adding and removing are the list's job.
- **Don't recolour a type per page.** The four colours are the types' identity.
