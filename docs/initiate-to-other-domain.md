# InitiateToOtherDomain

The card on an Added Value that offers to initiate it into the other domains: a title
and one checkbox per domain, "Initiate to Development assignment". Several can be ticked.
The domains are the caller's and never include the one the AV is already in.

Read off the Figma `Duplicate_To_Other_Domain` set (`6820:65275`), whose six variants are
the same card for each domain with that domain left out. The system calls it **Initiate**,
not Duplicate, as its options and the "Initiated" status already do (decided 16 November 2026;
it was `DuplicateToOtherDomain` before). It stays a group of checkboxes, as Figma draws it.

## Composed of

| Piece | Tier |
|---|---|
| `Checkbox` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `InitiateToOtherDomain` | Choosing which other domains an AV is initiated to |
| `Checkbox` | A single yes/no, or your own list |
| `SearchSelect` | A long list of choices that needs searching |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `{ value, name, disabled? }[]` | — | **Required.** The domains it can go to. `name` fills "Initiate to {name} assignment" |
| `value` | `string[]` | — | Controlled: the ticked values |
| `onChange` | `(value: string[], change: { value, checked }) => void` | — | Fires on every tick or untick with all ticked values (in the order of `options`) **and the one that changed**. Ticking a domain usually opens a section for it: read `change.checked`, or derive the section from `value` |
| `defaultValue` | `string[]` | `[]` | Uncontrolled: ticked to begin with |
| `title` | `ReactNode` | `Initiate to other Domains` | The card's title |
| `disabled` | `boolean` | — | Disables every option and shows `disabledReason` under the title. Use it for an Added Value that came from another domain (Design to Development, say) and is edited in the second: the card is still there, but nothing can be ticked from here. Figma's set has no Disabled variant yet |
| `disabledReason` | `ReactNode` | "This Added Value came from another domain, so it can't be initiated to others from here." | The line a disabled card shows, so the dimmed boxes are explained. Only drawn when `disabled` |
| `className` | `string` | — | Merged via `cn()` |

The sentence is the design's and is not a prop. Which domains exist, and which is current,
is the product's: build the list for the AV's domain and pass it in.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Card | `surface.elevated`, `shape.radius.md` | `bg-surface-elevated rounded-md` |
| Padding, gap | Tailwind numeric scale | `p-4` (16), `gap-3` (title to options); options sit edge to edge, no gap |
| Title | `text.primary`, `type.title-sm-semibold` | `text-title-sm-semibold text-text-primary` |
| Disabled reason | `text.secondary`, `type.body-sm-regular` | `text-body-sm-regular text-text-secondary` |
| Options | `Checkbox` | its own box, label and focus ring |

## Accessibility

- **Target size over the drawn spacing.** Figma draws the options 16 apart; `Checkbox` pads each to a 40+ target (rule 5), so the rows are taller and sit edge to edge rather than being squeezed under the minimum.
- A `fieldset` with the title as its `legend`: a screen reader says "Initiate to other
  Domains, group" before the first option.
- Each option is a real checkbox with a visible label; the label is the target.
- `disabled` on the card disables every option and is announced by the fieldset. **The reason is said, not only shown**: the line is the group's description (`aria-describedby`), and it keeps full text contrast because it is not itself disabled.

## Don't

- **Don't pass the current domain.** The card lists where it can go, not where it is.
- **Don't hard-code the sentence per domain.** Pass the domain's `name`.
- **Don't use it for a single domain.** One yes/no is a `Checkbox`.
- **Don't make it a radio group or add a "Don't initiate" option.** An Added Value can go to several domains, and none ticked already means it goes to none (decided 16 November 2026).
- **Don't disable the card without a reason.** Keep the default line or give your own `disabledReason`.
