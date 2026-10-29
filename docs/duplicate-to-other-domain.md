# DuplicateToOtherDomain

The card on an Added Value that offers to copy it into the other domains: a title
and one checkbox per domain, "Initiate to Development assignment". The domains are
the caller's and never include the one the AV is already in.

Read off the Figma `Duplicate_To_Other_Domain` set (`6820:65275`), whose six variants are
the same card for each domain with that domain left out.

## Composed of

| Piece | Tier |
|---|---|
| `Checkbox` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DuplicateToOtherDomain` | Choosing which other domains an AV is copied to |
| `Checkbox` | A single yes/no, or your own list |
| `SearchSelect` | A long list of choices that needs searching |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `{ value, name, disabled? }[]` | — | **Required.** The domains it can go to. `name` fills "Initiate to {name} assignment" |
| `value` / `onChange` | `string[]` / `(value) => void` | — | Controlled: the ticked values, in the order of `options` |
| `defaultValue` | `string[]` | `[]` | Uncontrolled: ticked to begin with |
| `title` | `ReactNode` | `Duplicate to other Domains` | The card's title |
| `disabled` | `boolean` | — | Disables every option |
| `className` | `string` | — | Merged via `cn()` |

The sentence is the design's and is not a prop. Which domains exist, and which is current,
is the product's: build the list for the AV's domain and pass it in.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Card | `surface.elevated`, `shape.radius.md` | `bg-surface-elevated rounded-md` |
| Padding, gap | Tailwind numeric scale | `p-4` (16), `gap-3` (title to options); options sit edge to edge, no gap |
| Title | `text.primary`, `type.title-sm-semibold` | `text-title-sm-semibold text-text-primary` |
| Options | `Checkbox` | its own box, label and focus ring |

## Accessibility

- **Target size over the drawn spacing.** Figma draws the options 16 apart; `Checkbox` pads each to a 40+ target (rule 5), so the rows are taller and sit edge to edge rather than being squeezed under the minimum.
- A `fieldset` with the title as its `legend`: a screen reader says "Duplicate to other
  Domains, group" before the first option.
- Each option is a real checkbox with a visible label; the label is the target.
- `disabled` on the card disables every option and is announced by the fieldset.

## Don't

- **Don't pass the current domain.** The card lists where it can go, not where it is.
- **Don't hard-code the sentence per domain.** Pass the domain's `name`.
- **Don't use it for a single domain.** One yes/no is a `Checkbox`.
