# SearchSelect

A choice found by typing: people pickers, long supplier lists. Single or
multiple; options can lead with an `Avatar`.

## When to use

| Use | For |
|---|---|
| `SearchSelect` | Lists past a few dozen — search is how people find the option |
| `Select` | A handful to a few dozen known options — the native popup wins |
| `TagEditor` | Values the user *invents* rather than finds |
| `Menu` | Actions, not values |

This is the one place the custom-listbox tax is worth paying, so it is paid
in full — see Accessibility. Do not fork it into further custom dropdowns;
extend here.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `Array<string \| { value, label, avatar? }>` | `[]` | `label` is a `string` — filtering and Avatar initials both need the words |
| `value` | `string \| string[]` | — | Array iff `multiple` |
| `onChange` | `(value) => void` | — | String (single) or the next array (`multiple`) |
| `multiple` | `boolean` | — | Picks toggle, the list stays open, a count sits at the field's end |
| `avatars` | `boolean` | `true` | `false` for option sets that are not people; per-option `avatar: false` also works |
| `renderOption` | `(option, selected) => ReactNode` | — | Replaces a row's content |
| `placeholder` | `string` | `'Search…'` | — |
| `emptyText` | `string` | `'No matches'` | The no-hits row |
| `disabled` | `boolean` | — | — |
| `className` | `string` | — | On the wrapper (the panel positions against it) |

The accessible name comes from a `Field` label or `aria-label` — the
placeholder is not a name (same rule as Select).

## Tokens

The Input field shell (`stroke.field`, focus ring, disabled treatment) with
the `magnifying-glass` glyph in `text.tertiary`; the panel is
`surface.elevated` on `stroke.subtle` with `shadow.menu`. Selected rows
`surface.brand.faint` + `text.brand.strong` (11.37:1 light / 8.97:1 dark);
the active row `surface.neutral.faint` (or `surface.brand.subtle` when also
selected); the multiple-count in the numeric face. No new tokens.

## Accessibility

- Real combobox wiring: the input is `role="combobox"` with
  `aria-expanded`, `aria-controls` and **`aria-activedescendant`** — focus
  never leaves the input; the active option is announced from the id it
  points at. The list is a `listbox` of `option`s, `aria-multiselectable`
  when `multiple`.
- Keyboard: ArrowDown opens/moves, ArrowUp moves, Enter picks the active
  option, Escape closes, typing filters. Option rows pick on prevented
  `mousedown`, so a click never blurs the input mid-pick.
- The export was a bare input above a stack of buttons — none of this
  wiring; a screen reader user heard a text field and silence.
- The panel is positioned inline, **not** through `Popover` — Popover moves
  focus into its panel, and a combobox must not. Same no-flipping stance as
  Popover: near a viewport edge the panel clips rather than jumps.
- With `multiple`, the count is labelled ("3 selected"); the definitive list
  belongs to the caller's UI (the story renders it below).

## Don't

- **Don't use it for short lists** — a five-option SearchSelect is a Select
  with extra steps and worse semantics.
- **Don't fetch-as-you-type inside it** — filtering is over the `options`
  you pass; async search means the *caller* updates `options`, debounced.
- **Don't put VCP roles/eligibility rules in here** — who may be picked is a
  pattern's business (`WatchersList`, `DomainAccessTable`).
- **Don't render the chosen set only as the count** — with `multiple`, show
  the selection somewhere real (chips, a list) — the count is a hint, not
  the record.
