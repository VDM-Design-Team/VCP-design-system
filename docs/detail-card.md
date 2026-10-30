# DetailCard *(pattern)*

The facts about one Added Value, down the right of its page: who started it and who is on it, the
dates, the cycle, the status, how urgent it is, what kind, which projects and tags. Read it, or
edit it in place.

Read off Figma's `Detail_Card` (`6499:48858`: four types) and its `_Detail_Card_Item_*` rows.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Icon` | atom |
| `Input` | atom |
| `Tag` | atom |
| `Chip` | component |
| `CycleTag` | component |
| `DatePicker` | component |
| `DueDateTag` | component |
| `Popover` | component |
| `SearchSelect` | component |
| `StatusTag` | component |
| `TypeTag` | component |
| `UrgencyTag` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DetailCard` | The details column of an Added Value page |
| `DetailCardMenu` | The ⋮ menu above it: Edit, Delete and the moves between statuses. A separate piece: the page composes the two |
| `DetailRow` | Label/value facts about some other object, with the label beside the value |

## The four cards

**`type` picks the card, and the card is a fixed list of fields**, as the design draws them:

| Field | `viewing` | `duplicate` | `editing` | `new` |
|---|---|---|---|---|
| Initiator | ✓ | ✓ | ✓ (+) | ✓ |
| Assignee | ✓ | | ✓ (+) | |
| Start Date | ✓ | | ✓ | |
| Due Date | ✓ | | ✓ | |
| Cycle (Development only) | ✓ | | ✓ | |
| Duplicates | | ✓ | | |
| Status | ✓ | ✓ | | |
| Urgency | ✓ | ✓ | ✓ | ✓ |
| Type | ✓ | ✓ | ✓ | ✓ |
| Projects | ✓ | ✓ | ✓ | ✓ |
| AV Category | ✓ | ✓ | ✓ | ✓ |
| Tags | ✓ | ✓ | ✓ | ✓ |
| Capacity Points | ✓ | | ✓ | |
| Deployment Date | ✓ | ✓ | | |
| Date Initiated · Date Accepted | ✓ | ✓ | | |

**`domain`** trims it: **Design has no Cycle**; Development has every field. A field with no value is
left out of a read card.

Not built here, and tracked for later PRs: **UI Changes** (the Modify / New UI / No UI section),
**Estimated Duration** (drawn, but placed in no card), and **Edit Viewers** (the pill is a placeholder
that shows a count and reports a press).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `'viewing' \| 'duplicate' \| 'editing' \| 'new'` | required | Which card; fixes the fields |
| `domain` | `'design' \| 'development'` | `development` | Design has no Cycle |
| `value` | `DetailCardValue` | required | Every field optional; the card draws the ones its type has. Dates are ISO `yyyy-mm-dd` |
| `onChange` | `(value) => void` | — | Editing and new: the whole value, changed |
| `options` | `{ cycles, projects, categories, tags }` | — | The dropdowns' choices. A cycle carries its code and dates, so the read card draws a `CycleTag` |
| `errors` | `{ [field]: string }` | — | Editing and new: a message under the field, which marks it invalid |
| `onAddInitiator`, `onAddAssignee` | `() => void` | — | The + beside Initiator and Assignee while editing. The page opens its people picker |
| `viewerCount`, `onViewers` | `number`, `() => void` | — | The viewers pill (placeholder) on the read cards |
| `dueSoonWithinDays` | `number` | `3` | Due dates this near or nearer read as due soon |
| `className`, `ref`, rest | | | On the `<section>` |

## Tokens

`surface.elevated`, `radius.md`, **24** padding and 24 between fields (the Figma's), a field's label
`title-sm-semibold` `text.primary` with its value 8 under it. The muted dates are `text.tertiary`.
Everything else is the composed pieces' own. No new tokens.

## Accessibility

- A `<section>` named "Details"; each field is a group named by its label ("Initiator", "Due Date"),
  so a screen reader says what each value is.
- Editing fields are real controls with names (`SearchSelect`, `Input`, the date button), and a field
  with an `errors` entry is `aria-invalid` with the message tied to it.
- The + beside Initiator and Assignee is 20 to look at and 40 to press, named "Add initiator" and
  "Add assignee".
- Dates read as words ("October 1, 2025"); the due date's colour (soon, overdue) is also in `DueDateTag`'s
  own text.

## Don't

- **Don't pick fields on the page.** Choose the `type` and `domain`; the card knows what it has.
- **Don't put the ⋮ menu inside the card.** The page composes `DetailCardMenu` above it.
- **Don't compute the due-soon colour on the page.** Pass the date; the card does it.
