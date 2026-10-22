# UserSelect

One person from a list you can search: an assignee, an initiator, a filter by user.
The field shows who is picked; the panel opens with a search field over avatar rows.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `UserSelect` | One person, found by name, with the choice shown in the field |
| `MultiSelect` | Several values ticked from a fixed list |
| `SearchSelect` | A text box that finds a match and then clears itself — it cannot show the choice |
| `Select` | One value from a short list — the native popup wins |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `Array<{ value, label, src?, unassigned? }>` | `[]` | `label` is a string: the field, search and the avatar's initials all use it. `src` is a photo. `unassigned: true` draws the person glyph instead of an avatar — the "Unassigned" row |
| `value` | `string` | `''` | The picked `value`. `''` shows the placeholder |
| `onChange` | `(value: string) => void` | — | Fires on a pick |
| `placeholder` | `string` | `Select user` | Shown while nothing is picked |
| `searchPlaceholder` | `string` | `Search…` | Also the search field's accessible name |
| `emptyText` | `string` | `No matches` | When the search finds no one |
| `invalid` | `boolean` | — | Critical border + `aria-invalid`. Pair with a visible message |
| `disabled` | `boolean` | — | — |
| `id`, `aria-label`, `aria-labelledby` | | | On the trigger button, so a `Field` label's `htmlFor` reaches it |
| `className`, `ref`, rest | | | On the wrapper, which the panel positions against |

There is no built-in "clear". For "no one in particular" add an option that says so
("Anyone", "Unassigned") — it is then a choice the user can see and the page can name.

## Tokens

The field is `Select`'s shell (`stroke.strong` border, `surface.elevated`, 40 tall) with the
picked name in `body-sm-medium` and the placeholder in `text.subtle`. The panel is
`surface.elevated` on `stroke.subtle` with `shadow.menu`; the search field rules off with
`stroke.brand.medium`, as Figma draws it; the picked row is `surface.brand.faint` with
`text.brand.strong`, the active row `surface.neutral.faint`. No new tokens.

## Accessibility

- The trigger is a `<button aria-haspopup="listbox">` with `aria-expanded` and `aria-controls`.
  Open, **focus moves to the search field**, which is the combobox (`aria-controls`,
  `aria-activedescendant`, `aria-autocomplete="list"`) over a `listbox` of `option`s. The picked
  row has `aria-selected`.
- Keyboard: Enter or Space on the trigger opens; arrows move; Enter picks and closes; Escape
  closes and puts focus back on the trigger; Tab closes; a click away closes.
- Rows pick on a prevented `mousedown`, so a click never blurs the search mid-pick.
- Avatars are decoration: each row is named by the person's name alone.
- When the search finds no one the message sits outside the listbox, which is hidden — a
  listbox may hold only options.

## Differences from the design

- **The search field has no border box.** Figma draws it as a plain line under the text; so
  does this, in `stroke.brand.medium`.
- **The panel is not repositioned.** It opens under the field, as `SearchSelect`'s does, and
  clips inside an `overflow: hidden` ancestor.
- **The avatars are `Avatar size="sm"`** (24) — initials, or a photo through `src`.

## Don't

- **Don't use it for a handful of non-people** — avatars would be empty circles; that is a `Select`.
- **Don't fetch as you type inside it** — search filters the `options` you pass; async search
  means the page updates `options`, debounced.
- **Don't put who-may-be-picked rules in here** — eligibility is the page's business.
