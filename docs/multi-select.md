# MultiSelect

Several choices from a fixed list. The field shows what is picked as removable chips or
a short summary; the panel is a list of checkbox rows, optionally under group headings.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `Chip` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MultiSelect` | Several values from a fixed list: tags, statuses, categories |
| `Select` | Exactly one value from a short list — the native popup wins |
| `SearchSelect` | A value found by typing: people, long supplier lists |
| `Chip` / `TagEditor` | Free-form labels the user invents |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `Array<string \| { value, label, group?, disabled? }>` | `[]` | Rows sharing a `group` sit under one heading, in the order first seen; ungrouped rows lead |
| `value` | `string[]` | — | Controlled. Uncontrolled (empty to start) when omitted |
| `onChange` | `(value: string[]) => void` | — | The next array. With `confirm`, only on Apply |
| `display` | `'chips' \| 'summary'` | `chips` | Chips for tags; summary ("In Progress", "3 selected") for compact filters |
| `confirm` | `boolean` | — | Ticks are a draft behind a Clear all / Apply footer |
| `applyLabel` / `clearLabel` | `string` | `Apply` / `Clear all` | — |
| `placeholder` | `string` | `Select…` | Shown while nothing is picked |
| `emptyText` | `string` | `No options` | The panel's line when `options` is empty |
| `invalid` | `boolean` | — | Critical border + `aria-invalid`. Pair with a visible message |
| `disabled` | `boolean` | — | No opening; chips lose their ✕ |
| `id`, `aria-label`, `aria-labelledby` | | | On the combobox button, so a `Field` label's `htmlFor` reaches it |
| `className`, `ref`, rest | | | On the wrapper, which the panel positions against |

## Tokens

The field is `Input`'s shell (`stroke.strong` border, the `stroke.focused` ring on focus-within,
the critical outline when `invalid`, the disabled surface), at least 40 tall and growing as chips
wrap. Chips are `Chip tone="neutral"` (`surface.neutral.subtle`, `text.primary`). The panel is
`surface.elevated` on `stroke.subtle` with `shadow.menu`; group headings `caption-md-semibold` in
`text.tertiary` over a `stroke.subtle` rule; the active row `surface.neutral.faint`; ticked boxes
`action.primary.surface.default`. No new tokens.

## Accessibility

- A select-only combobox: a `<button role="combobox">` with `aria-expanded`, `aria-controls` and
  `aria-activedescendant`. Focus never leaves it; the active row is announced from the id it
  points at. The list is a `listbox` (`aria-multiselectable`) of `option`s with `aria-selected`;
  headed rows are a `group` named by the heading.
- Keyboard: ArrowDown or ArrowUp opens, arrows move (skipping disabled rows), Home and End jump,
  Enter or Space ticks the active row (or opens when closed), Escape closes and keeps focus,
  Tab closes. With `confirm`, Escape and clicking away discard the draft.
- The checkbox squares are decorative — the row is the control and `aria-selected` its state — so
  there is no input nested in an option. Rows tick on a prevented `mousedown`, so a click never
  blurs the field mid-pick.
- The chips' ✕ buttons are siblings of the combobox, never inside it, each named `Remove <label>`.
  While chips carry the value, the button's text says how many are picked.
- The combobox is a `<button>` so a `Field` label can name it. Without one, pass `aria-label`.

## Differences from the design

- **Rows are checkboxes everywhere.** Figma's tags menu highlights the picked row in blue
  (a single-pick look); with chips in the field and several picks allowed, a checkbox says it.
- **Group headings do not collapse.** Figma draws a caret on them; they are plain headings here.
- **No search in the panel.** The tags and status menus are scrolling lists in Figma.
- **The panel is not repositioned.** It opens under the field, as `SearchSelect`'s does, and clips
  inside an `overflow: hidden` ancestor.

## Don't

- **Don't use it for one choice** — that is a `Select`.
- **Don't keep the chips *and* a count** — the chips are the record; the summary is for compact fields.
- **Don't put the Apply footer on a list the user ticks one item from** — `confirm` is for a set
  worth reviewing before it filters something.
