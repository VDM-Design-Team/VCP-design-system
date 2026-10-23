# UserSelect

People from a list you can search: an assignee, an initiator, a filter by user. One
person (the default) or several (`multiple`). The field shows who is picked; the panel
opens with a search field over avatar rows.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Checkbox` | atom |
| `Icon` | atom |
| `Input` | atom |
| `Tag` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `UserSelect` | People, found by name, with the choice shown in the field |
| `MultiSelect` | Several plain values ticked from a fixed list |
| `SearchSelect` | A text box that finds a match and then clears itself — it cannot show the choice |
| `Select` | One value from a short list — the native popup wins |

## Single and multiple

| | Single (default) | `multiple` |
|---|---|---|
| A pick | Closes the panel and returns focus to the field | Toggles the person; the panel stays open |
| The field | The name, or the placeholder | "Amy Lee", then "3 selected"; or with `display="tags"` a removable tag per person |
| `value` | `string` (`''` = none) | `string[]` |
| `onChange` | `(value: string) => void` | `(value: string[]) => void` |
| The listbox | — | `aria-multiselectable` |

How a picked row is marked follows the system's rule: a list that picks **one** has a trailing check (as `SearchSelect`'s); a list that picks **several** has a leading checkbox (`CheckboxMark`, as `MultiSelect`'s and Figma's status menu). Hover and pressed tint the row, so the mark is a separate signal and the states never blur together.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `Array<{ value, label, src?, unassigned? }>` | `[]` | `label` is a string: the field, search and the avatar's initials all use it. `src` is a photo. `unassigned: true` draws the person glyph instead of an avatar — the "Unassigned" row |
| `multiple` | `boolean` | — | Several people. Switches `value` and `onChange` to arrays |
| `value` / `onChange` | see above | — | Multiple is uncontrolled (empty to start) when `value` is omitted |
| `display` | `'summary' \| 'tags'` | `summary` | Multiple only: how the field shows the picks |
| `placeholder` | `string` | `Select user` | Shown while nothing is picked |
| `searchPlaceholder` | `string` | `Search by name` | Also the search field's accessible name |
| `emptyText` | `string` | `No matches` | When the search finds no one |
| `invalid` | `boolean` | — | Critical border + `aria-invalid`. Pair with a visible message |
| `disabled` | `boolean` | — | Tags lose their ✕ |
| `id`, `aria-label`, `aria-labelledby` | | | On the trigger button, so a `Field` label's `htmlFor` reaches it |
| `className`, `ref`, rest | | | On the wrapper, which the panel positions against |

There is no built-in "clear" for the single variant. For "no one in particular" add an
option that says so ("Anyone", "Unassigned") — it is then a choice the user can see and the
page can name.

## The dropdown-with-search look

The panel is the system's reference for **any dropdown that has a search field**, taken from
Figma's Edit Viewers dropdown (`Detail_Card_Edit_Viewers`, `7457:91275`). Its parts:

| Part | Spec |
|---|---|
| Panel | `surface.elevated`, 1 `stroke.subtle`, `radius.md`, `shadow.menu`, 4 above and below |
| Search | The `Input` atom (40 tall) with a `magnifying-glass`, inside 12 of padding on every side. Focus is the Input's ring |
| Rows | 40 tall, 12 either side, 6 between the parts; a 16 checkbox first when `multiple`, then the avatar (24); name `body-sm-medium` in `text.secondary`; full width, no rounded corners |
| Row states | rest `surface.elevated`; hover or keyboard-active `surface.brand.faint`; pressed `surface.brand.subtle` |
| Empty | `caption-md-semibold` in `text.tertiary`, outside the list |

The next searchable dropdown should reuse these numbers (or this component) rather than
draw its own; if a second one arrives, the search block is the piece to lift out.

## Tokens

The field is `Select`'s shell (`stroke.strong` border, `surface.elevated`, at least 40 tall)
with the picked name in `body-sm-medium` and the placeholder in `text.subtle`. The single variant's
check is `text.brand.strong`; the multiple variant's boxes are `CheckboxMark`'s tokens. No new tokens.

Contrast, measured (4.5:1 for text, 3:1 for graphics), light / dark:

| Pair | Ratio |
|---|---|
| Name on a resting row | 10.35 / 11.87 |
| Name on a hovered row (`brand.faint`) | 8.90 / 10.73 |
| Name on a pressed row (`brand.subtle`) | 7.03 / 7.34 |
| Check on a resting / hovered / pressed row | 13.23 / 11.37 / 8.97 light; 9.93 / 8.97 / 6.14 dark |

## Accessibility

- The trigger is a `<button aria-haspopup="listbox">` with `aria-expanded` and `aria-controls`.
  Open, **focus moves to the search field**, which is the combobox (`aria-controls`,
  `aria-activedescendant`, `aria-autocomplete="list"`) over a `listbox` of `option`s. A picked
  row has `aria-selected`.
- Keyboard: Enter or Space on the trigger opens; arrows move; Enter picks (and, in single,
  closes); Escape closes and puts focus back on the trigger; Tab closes; a click away closes.
- Rows pick on a prevented `mousedown`, so a click never blurs the search mid-pick.
- Avatars are decoration: each row is named by the person's name alone.
- With `display="tags"` each tag's ✕ is a real button named `Remove <name>`, beside the trigger
  and never inside it. While tags carry the value, the trigger's text says how many are picked.
- When the search finds no one the message sits outside the listbox, which is hidden — a
  listbox may hold only options.

## Differences from the design

- **Picked rows are marked, not sectioned.** The viewers dropdown lists assigned people
  under a "3 Viewers" heading with a red remove button on each, and searches *to add* people.
  A filter needs everyone visible with their state, so a trailing check (single) or a checkbox (multiple) marks the picked rows. That
  feature (assigning watchers) is not built here.
- **The search field is the `Input` atom.** Figma fills it with an "elevated secondary" surface
  the system has no token for; the Input's `surface.elevated` is used.
- **The panel is not repositioned.** It opens under the field, as `SearchSelect`'s does, and
  clips inside an `overflow: hidden` ancestor.

## Don't

- **Don't use it for a handful of non-people** — avatars would be empty circles; that is a `Select`.
- **Don't fetch as you type inside it** — search filters the `options` you pass; async search
  means the page updates `options`, debounced.
- **Don't put who-may-be-picked rules in here** — eligibility is the page's business.
- **Don't build a second search-dropdown shape** — take the one above.
