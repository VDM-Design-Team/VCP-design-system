# InitiateToOtherDomain

The card on an Added Value that offers to initiate it into another domain: a title, then a radio group — **"Don't initiate to another domain"** (selected until a person picks
otherwise, as it is for most Added Values, a new one included) and one option per domain, "Initiate to Development assignment". One choice at a time. The domains are
the caller's and never include the one the AV is already in.

Read off the Figma `Duplicate_To_Other_Domain` set (`6820:65275`), whose six variants are the same card for each domain with that domain left out. The system calls it **Initiate**,
not Duplicate, as the options and the Detail Card's "Initiated" already do, and it is a radio group (one choice), not the checkboxes the Figma set draws: both are questions for the design lead, raised in the PR that made the change.

## Composed of

| Piece | Tier |
|---|---|
| `RadioGroup` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `InitiateToOtherDomain` | Choosing which other domain an AV is initiated to, or none |
| `RadioGroup` | Your own single choice |
| `SearchSelect` | A long list of choices that needs searching |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `{ value, name, disabled? }[]` | — | **Required.** The domains it can go to. `name` fills "Initiate to {name} assignment". `value` is not `''` |
| `value` | `string` | — | Controlled: the chosen domain's `value`, or `''` (`DONT_INITIATE`) for "don't initiate" |
| `onChange` | `(value: string) => void` | — | Fires when another option is chosen, with its `value` (`''` for "don't initiate"). Choosing a domain usually opens a section for it: derive it from `value` |
| `defaultValue` | `string` | `''` | Uncontrolled: what is chosen to begin with. "Don't initiate" unless told |
| `title` | `ReactNode` | `Initiate to other Domains` | The card's title |
| `noneLabel` | `string` | `Don't initiate to another domain` | The first option's words |
| `disabled` | `boolean` | — | Disables every option, the chosen one included. Use it for an Added Value that was handed off from another domain (Design to Development, say) and is edited in the second: the card is still there, with "Don't initiate" shown selected, but nothing can be changed from here. Figma's component has no Disabled variant yet |
| `className` | `string` | — | Merged via `cn()` |

The sentence is the design's and is not a prop. Which domains exist, and which is current, is the product's: build the list for the AV's domain and pass it in.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Card | `surface.elevated`, `shape.radius.md` | `bg-surface-elevated rounded-md` |
| Padding | Tailwind numeric scale | `p-4` (16) |
| Title | `text.primary`, `type.title-sm-semibold` | `text-title-sm-semibold text-text-primary` |
| Options | `RadioGroup` | its own radio, label and focus ring |

## Accessibility

- **Target size over the drawn spacing.** Figma draws the options 16 apart; `RadioGroup` pads each to a 40 target (rule 5), so the rows are taller than drawn.
- A `fieldset` with the title as its `legend`: a screen reader says "Initiate to other Domains, group" before the first option. Arrow keys move between the options, as in any radio group.
- Each option is a real radio with a visible label; the label is the target.
- `disabled` on the card disables every option and is announced by the fieldset.

## Don't

- **Don't pass the current domain.** The card lists where it can go, not where it is.
- **Don't hard-code the sentence per domain.** Pass the domain's `name`.
- **Don't use it for a single domain.** One yes/no is a `Checkbox`.
- **Don't add your own "none" option.** "Don't initiate to another domain" is the first option already.
