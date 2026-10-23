# SearchSelect

The system's dropdown for picking from a list that is too long, or too rich, for the native
`Select`: people, tags, statuses. **One field, one panel.** The field shows what is picked;
pressing it opens a panel with an optional search box over the rows.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Button` | atom |
| `Checkbox` | atom |
| `Icon` | atom |
| `Input` | atom |
| `Tag` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `SearchSelect` | A list that needs search, several picks, groups, avatars, icons or tags in the rows, or a Clear all / Apply step |
| `Select` | One value from a short list — the native popup wins |
| `RadioGroup` | One of 2 to 5 options worth seeing at once |
| `TagEditor` | Labels the user invents rather than picks |

**Do not build another dropdown with options.** A status filter, a tag filter, an assignee
picker and a watcher list are all this component with different props. If something is missing
(a new row type, a new footer), extend this component; do not fork a second one.

## Decisions — read before changing the shape

These were settled on purpose (October 2026). Each has a reason; if you want to reverse one,
bring a case the reason does not cover.

### 1. Search lives in the panel, never in the field

- **The designs draw it there.** Figma's Edit Viewers dropdown and the user menu put the search
  box inside the panel. No Figma component searches in the field.
- **The field has a better job.** It shows the value: a name, "3 selected", or a removable tag per
  pick. A field that is also the search box has to show a typed query *or* the value, never both.
  The previous `SearchSelect` was exactly that: it cleared itself after a pick, so it could not
  say who was chosen, and needed a count badge on the right to compensate.
- **Tags in the field and typing do not mix.** A caret between removable tags, a half-typed word
  and a ✕ you might hit by mistake is a worse control than a search box one step away.
- **One keyboard and ARIA model.** Every dropdown is a button that opens a panel. With search, focus
  moves into the search box (the combobox); without it the button itself is the select-only combobox.
  Two patterns, chosen by one prop, not two components.
- **What would justify a second pattern:** a list too large to hold in the browser (typing asks a
  server), or typing a *new* value into the list. Neither is in the designs. If one arrives, add an
  option here (`onSearch`, `creatable`); do not move search back into the field for the cases
  that work today.

### 2. One component, not one per kind of list

`MultiSelect` and a people-specific `UserSelect` were built first and turned out to be the same
component: a field with a panel over rows with a mark. They differed only in search, avatars,
groups and an Apply footer, all of which are options. Two near-copies means two keyboard models,
two sets of ARIA fixes and two looks to keep in step. People, tags and statuses are
configurations: `rows="avatar"` for people, `group` for tags, `confirm` for statuses.

### 3. What a row looks like is one prop with four presets, plus an escape hatch

Plain text is the default. A people list is not the default case, so avatars are never on unless
asked for (`rows="avatar"`). The four presets cover what we draw today: `text`, `avatar`
(initials or a photo), `icon` (a glyph and text) and `tag` (each row drawn as a `Tag` in the
option's `tone`, and the tags in the field wear it too). For anything else, `renderOption` draws a
row's content. The presets and `renderOption` only change the *content*: the checkbox or check, the
hover and pressed states, the keyboard model and the ARIA stay the component's, so a custom row can
never break accessibility. Do not add a boolean per kind of row (`avatars`, `icons`, `tags`…): that
grows into a pile of flags that can contradict each other. If a fifth kind of row is needed twice,
make it a preset; once, use `renderOption`.

### 4. One pick has a trailing check; several picks have checkboxes

- Hover and pressed tint the row (`brand.faint`, `brand.subtle`). A selected *fill* would collide
  with one of them, and selected-by-text-colour alone is too close to the resting text. A separate
  mark never blurs into the states.
- A checkbox says "you can tick several" before anyone clicks; a lone check does not. It is what
  Figma's status menu draws. A single pick has no box to tick, because picking closes the panel.
- The checkbox is `CheckboxMark` (the checkbox's own box and tick, no input), because an `<input>`
  inside an `option` is invalid.

### 5. The panel's look is the viewers dropdown's

The panel, search box and row sizes are taken from Figma's Edit Viewers dropdown
(`7457:91275`), so any dropdown with a search box looks the same. The numbers are in
"The panel" below; reuse them.

### 6. Why `SearchSelect` was rebuilt rather than removed

It was ported from the Claude Design export, which had no Figma component behind it, and was used
nowhere. We kept the *name* and replaced the *design*: the old one is not coming back.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `Array<string \| { value, label, group?, disabled?, src?, unassigned?, icon?, tone? }>` | `[]` | Strings are shorthand. `label` is a string: the field, tags, search and avatar initials all use it. `group` sections rows under a heading (in order first seen; ungrouped rows lead). Per-preset extras: `src` (a photo) and `unassigned` (the person glyph) for `avatar`; `icon` for `icon`; `tone` for `tag` |
| `multiple` | `boolean` | — | Several picks. Switches `value` and `onChange` to arrays |
| `value` / `onChange` | `string` / `(value: string) => void`; or with `multiple`, `string[]` / `(value: string[]) => void` | — | Uncontrolled when `value` is omitted. `''` shows the placeholder |
| `searchable` | `boolean` | `true` | The search box in the panel. Turn it off for a short list |
| `searchPlaceholder` | `string` | `Search` | Also the search box's accessible name. Say what is searched: "Search by name" |
| `rows` | `'text' \| 'avatar' \| 'icon' \| 'tag'` | `text` | What a row looks like: plain labels, an avatar, a glyph, or a `Tag` |
| `renderOption` | `(option, { selected, active }) => ReactNode` | — | Draws a row's content, replacing what `rows` would. The checkbox or check, states, keyboard and ARIA stay the component's — keep it to content, no buttons or links |
| `display` | `'summary' \| 'tags'` | `summary` | `multiple` only: "Amy Lee" / "3 selected", or a removable tag per pick |
| `confirm` | `boolean` | — | `multiple` only: ticks are a draft behind a Clear all / Apply footer. `onChange` fires on Apply; Escape or a click away discards |
| `applyLabel` / `clearLabel` | `string` | `Apply` / `Clear all` | — |
| `placeholder` | `string` | `Select…` | Shown in the field while nothing is picked |
| `emptyText` | `string` | `No matches` | What the panel says when there are no rows |
| `invalid` | `boolean` | — | Critical border + `aria-invalid`. Pair with a visible message |
| `disabled` | `boolean` | — | No opening; tags lose their ✕ |
| `id`, `aria-label`, `aria-labelledby` | | | On the trigger button, so a `Field` label's `htmlFor` reaches it |
| `className`, `ref`, rest | | | On the wrapper, which the panel positions against |

There is no built-in "clear" for a single pick. For "no one in particular" add an option that
says so ("Anyone", "Unassigned") — it is then a choice the user can see.

## The panel

| Part | Spec |
|---|---|
| Panel | `surface.elevated`, 1 `stroke.subtle`, `radius.md`, `shadow.menu`, 4 above and below |
| Search | The `Input` atom (40 tall) with a `magnifying-glass`, inside 12 of padding on every side |
| Rows | 40 tall, 12 either side; a 16 checkbox first when `multiple`, then the row's content (`text`: the name in `body-sm-medium` / `text.secondary`; `avatar`: a 24 avatar and the name; `icon`: a small glyph and the name; `tag`: a `Tag size="sm"`); a trailing check when single |
| Row states | rest `surface.elevated`; hover or keyboard-active `surface.brand.faint`; pressed `surface.brand.subtle` |
| Group heading | `caption-md-semibold` in `text.tertiary` over a `stroke.subtle` rule |
| Empty | `caption-md-semibold` in `text.tertiary`, outside the list |
| Apply footer | A `stroke.subtle` rule, then Clear all (secondary) and Apply (primary), small |

The field is `Select`'s shell (`stroke.strong` border, `surface.elevated`, at least 40 tall, growing
as tags wrap) with the picked name in `body-sm-medium` and the placeholder in `text.subtle`. Tags
are `Tag size="sm"` with `onRemove`. No new tokens.

Contrast, measured (4.5:1 for text, 3:1 for graphics), light / dark:

| Pair | Ratio |
|---|---|
| Name on a resting row | 10.35 / 11.87 |
| Name on a hovered row (`brand.faint`) | 8.90 / 10.73 |
| Name on a pressed row (`brand.subtle`) | 7.03 / 7.34 |
| Single's check on a resting / hovered / pressed row | 13.23 / 11.37 / 8.97 light; 9.93 / 8.97 / 6.14 dark |

## Accessibility

- The trigger is a `<button aria-haspopup="listbox">` with `aria-expanded` and `aria-controls`.
  **With search**, opening moves focus to the search box, which is the combobox (`aria-controls`,
  `aria-activedescendant`, `aria-autocomplete="list"`) over a `listbox` of `option`s
  (`aria-multiselectable` when `multiple`). **Without search**, the trigger is `role="combobox"`
  and keeps focus. A picked row has `aria-selected`.
- Keyboard: Enter, Space or ArrowDown on the trigger opens; arrows move (skipping disabled rows);
  Home and End jump (when the trigger has focus); Enter or Space picks the active row; Escape closes and
  puts focus back on the trigger; Tab closes; a click away closes. With `confirm`, Escape and a
  click away discard the draft.
- Rows pick on a prevented `mousedown`, so a click never blurs the field mid-pick.
- The checkbox squares, avatars and icons are decorative: each row is named by its label alone, and the
  row, not a nested input, is the control.
- With `display="tags"` each tag's ✕ is a real button named `Remove <label>`, beside the trigger and
  never inside it. While tags carry the value, the trigger's text says how many are picked.
- When there are no rows the message sits outside the listbox, which is hidden: a listbox may hold
  only options.
- The trigger is a `<button>` so a `Field` label can name it. Without one, pass `aria-label`.

## Differences from the designs

- **Picked rows are marked, not sectioned.** The viewers dropdown lists assigned people under a
  "3 Viewers" heading with a remove button on each, and searches *to add* people. A filter needs
  everyone visible with their state, so a check (single) or a checkbox (multiple) marks the picked
  rows. Assigning watchers is a separate feature built on top of this one.
- **The search box is the `Input` atom.** Figma fills it with an "elevated secondary" surface the
  system has no token for; the Input's `surface.elevated` is used.
- **Group headings do not collapse.** Figma's tags menu draws a caret on them.
- **The tags menu's blue highlighted row** (a single-pick look) is replaced by the checkbox,
  because the field now allows several tags.
- **The panel is not repositioned.** It opens under the field and clips inside an `overflow: hidden`
  ancestor. No flipping, same as `Popover`.

## Don't

- **Don't move search into the field.** See Decision 1.
- **Don't add a second dropdown-with-options component.** Extend this one (Decision 2).
- **Don't use it for a handful of plain options** — that is a `Select`.
- **Don't fetch as you type inside it** — search filters the `options` you pass. Async search means
  the page updates `options`, debounced, until a real `onSearch` exists.
- **Don't put who-may-be-picked rules in here** — eligibility is the page's business.
