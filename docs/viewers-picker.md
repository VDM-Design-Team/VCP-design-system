# ViewersPicker *(component)*

Who can see an Added Value without working on it, and the way to change that. The small pill with an eye and the count, with the list of viewers on hover and a picker on press.

Built to Figma's `Detail_Card_Edit_Viewers` (`State`: Default / Hover / Clicked), `_Detail_Card_Edit_Viewers_Dropdown` (Hover, Empty Search, Filled Search, No Viewers, No Viewers Search) and `_Detail_Card_Edit_Viewers_Menu_Item` (`Is Assigned Viewer`).

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Icon` | sub-atomic |
| `Input` | atom |
| `RemoveButton` | atom |
| `Tooltip` | atom |
| `Popover` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ViewersPicker` | The viewers pill on an Added Value's detail card (`DetailCard`'s `viewers`), or anywhere a short list of people is viewed and changed from a pill |
| `AssigneeSelectionDropdown` | Choosing the person who works on an AV, with their availability |
| `AvatarGroup` | Showing people, with nothing to change |

## How it works

| | Figma | Here |
|---|---|---|
| **Hover or focus the pill** | Hover | A list: "3 Viewers" over each person. With nobody, "No viewers yet", and, if it can be changed, "Click to manage viewers" |
| **Press the pill** | Clicked (Empty Search) | A panel: the **Search by name** field, then "3 Viewers" with each person. Hover a row (or tab to it) for its remove button |
| **Type in the search** | Filled Search | The people who match and are **not viewers yet** come first; press one to add them |
| **Nobody is viewing** | No Viewers / No Viewers Search | "No viewers yet" |
| **Nobody matches** | not drawn | "No one matches" (ours) |

It holds no data. The page passes `viewers` and `candidates` and changes them in `onAdd` and `onRemove`. After an add or a remove the search clears (an add) and **focus returns to the search field**, so it never lands on a row that has gone.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `viewers` | `ViewerPerson[]` | required | Who is viewing, in the order to show. `{ id, name, src? }`; without `src` the initials |
| `candidates` | `ViewerPerson[]` | `[]` | Everyone who could be added. Those already in `viewers` never show as a match |
| `onAdd` | `(person) => void` | — | A match was pressed. Leave out, with `onRemove`, for a read-only list |
| `onRemove` | `(person) => void` | — | A viewer's remove button was pressed |
| `className` | `string` | — | On the wrapper |

## Tokens

The pill is the neutral outline control (`neutral.outline.*`, the same as the placeholder it replaces), 24 high, `caption-md-medium`. The panel is `Popover`'s (`surface.elevated`, `shadow-menu`), `md` wide, scrolling at 300 high. People are `Avatar` `sm` (24) with `body-sm-regular` names; the headings are `label-sm-semibold` in `text.secondary`. A viewer's row has **no highlight**, as Figma's `Is Assigned Viewer=Yes` is `surface.elevated` in every state: only the remove button appears. A person to add is highlighted (`surface.brand.faint` on hover, `surface.brand.subtle` pressed), as `Menu`'s rows are. The remove button is `RemoveButton` `tonal`; on a pointer it appears when the row is hovered or holds focus (Figma's hover state), and on a touch screen it is always shown.

## Accessibility

- The pill is a button named by its count ("3 viewers"), and it announces `aria-expanded` when it opens a panel. The hover list is its description, so the people are named on focus as well as on hover.
- The search field is named "Search people by name". The people to add are buttons named by the person ("Adam Reyes: add as a viewer"); each remove button says who: "Remove Liam Carter as a viewer".
- Escape closes the panel and hands focus back to the pill (`Popover`). The panel does not trap focus.
- Read-only, the pill takes focus (so the list can be read) and does nothing on press.

## Don't

- Don't use it to show people with nothing to read or change: `AvatarGroup`.
- Don't pass a `candidates` list that holds only the people who are not viewers yet: pass everyone; the picker leaves the viewers out.
- Don't hide the remove button on a touch screen: it shows on hover or focus for a pointer, and always on touch (`pointer-coarse`), as `Chip` and the missed-it card do.
- Don't keep the people in the picker. Pass them in, and change them in `onAdd` and `onRemove`.
