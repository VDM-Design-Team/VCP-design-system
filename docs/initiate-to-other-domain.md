# InitiateToOtherDomain

The card on an Added Value that offers to initiate it into another domain: a title and **one choice**, as radio buttons.
The first option is "Don't initiate to another domain", chosen by default (most Added Values, a new one included, go to no
other domain); after it come the other domains, "Initiate to Development assignment". The domains are the caller's and never
include the one the AV is already in.

Read off the Figma `Duplicate_To_Other_Domain` set (`6820:65275`), whose six variants are the same card for each domain with
that domain left out. The system calls it **Initiate**, not Duplicate, as its options and the "Initiated" status already do
(decided 16 November 2026; it was `DuplicateToOtherDomain` before).

**It is radio buttons, not Figma's checkboxes (design lead, 20 November 2026, reversing the 16 November decision to keep
checkboxes).** An Added Value is initiated to one other domain at a time, so a group of checkboxes offered a choice the
implementation does not have. Figma still draws checkboxes and has neither the "Don't initiate" option nor a Disabled variant:
those are ours, and the Figma set needs the same changes.

## Composed of

| Piece | Tier |
|---|---|
| `RadioGroup` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `InitiateToOtherDomain` | Choosing whether an AV is initiated to another domain, and which |
| `RadioGroup` | Your own list of one-of-several choices |
| `SearchSelect` | A long list of choices that needs searching |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `{ value, name, disabled? }[]` | — | **Required.** The domains it can go to. `name` fills "Initiate to {name} assignment". A `value` is never empty: the empty value is "don't initiate" |
| `value` | `string \| null` | — | Controlled: the chosen domain's `value`, or `null` for "don't initiate" |
| `onChange` | `(value: string \| null) => void` | — | Fires when the choice changes: the domain's `value`, or `null` for "don't initiate". Choosing a domain usually opens a section for it: read the value, or derive the section from `value` |
| `defaultValue` | `string \| null` | `null` | Uncontrolled: what is chosen to begin with. `null` is "don't initiate" |
| `title` | `ReactNode` | `Initiate to other Domains` | The card's title |
| `noneLabel` | `string` | `Don't initiate to another domain` | The first option's words |
| `disabled` | `boolean` | — | Disables every option, **shows "Don't initiate" chosen whatever `value` says**, and shows `disabledReason` under the title. Use it for an Added Value that came from another domain (Design to Development, say) and is edited in the second: nothing is initiated from here. Figma's set has no Disabled variant yet |
| `disabledReason` | `ReactNode` | "This Added Value came from another domain, so it can't be initiated to others from here." | The line a disabled card shows, so the dimmed radios are explained. Only drawn when `disabled` |
| `className` | `string` | — | Merged via `cn()` onto the card |

The sentence is the design's and is not a prop. Which domains exist, and which is current, is the product's: build the list
for the AV's domain and pass it in. The page decides what choosing one does (open that domain's assignment section, usually).

## Tokens

| Part | Token | Utility |
|---|---|---|
| Card | `surface.elevated`, `shape.radius.md` | `bg-surface-elevated rounded-md` |
| Padding | Tailwind numeric scale | `p-4` (16) |
| Title | `text.primary`, `type.title-sm-semibold` | `text-title-sm-semibold text-text-primary` |
| Disabled reason | `text.secondary`, `type.body-sm-regular` | `RadioGroup`'s `description` |
| Options | `RadioGroup` | its own radios, labels and focus ring |

## Accessibility

- **Target size over the drawn spacing.** Figma draws the options 16 apart; `RadioGroup` pads each to a 40 target (rule 5), so the rows are taller and sit edge to edge rather than being squeezed under the minimum.
- A `fieldset` with the title as its `legend`: a screen reader says "Initiate to other Domains, group" before the first option. The card's fill is on a wrapper around the fieldset, because a legend sits on its fieldset's top edge.
- Each option is a real radio with a visible label; the label is the target. The arrow keys move the choice, as in any radio group.
- `disabled` disables every option and is announced by the fieldset. **The reason is said, not only shown**: the line is the group's description (`aria-describedby`), and it keeps full text contrast because it is not itself disabled.

## Don't

- **Don't pass the current domain.** The card lists where it can go, not where it is.
- **Don't hard-code the sentence per domain.** Pass the domain's `name`.
- **Don't use it for a single domain.** One yes/no is a `Checkbox`.
- **Don't turn it back into checkboxes.** An Added Value is initiated to one domain at a time (design lead, 20 November 2026): the choice is one of "don't initiate" or one domain.
- **Don't drop the "Don't initiate" option.** It is how an Added Value stays in its own domain, and it is the default.
- **Don't disable the card without a reason.** Keep the default line or give your own `disabledReason`.
