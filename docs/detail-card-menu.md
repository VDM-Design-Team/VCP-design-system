# DetailCardMenu *(component)*

The ⋮ button at the head of an Added Value page, and the menu it opens: Edit and Delete for
everyone, with the moves between Draft, Pending and Backlog that the person's role and the AV's
status allow.

Read off Figma's `Detail_Card_Menu` (the button: default, hover, pressed) and `AV_Options_Dropdown`
(five menus, by role and status).

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |
| `Menu` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DetailCardMenu` | The actions on one Added Value, at the head of its page |
| `Menu` | Any other list of actions off a trigger |

## What it offers

**The component owns which actions appear**, the way `StatusTag` owns status → tone, so no page
decides it again.

| `role` | `status` | Menu |
|---|---|---|
| user | Draft | Move to Backlog · Edit · Delete |
| user | any other | Edit · Delete |
| admin | Draft | Move to Backlog · Edit · Delete |
| admin | Pending | Move to Backlog, Move to Draft · Edit · Delete |
| admin | Backlog | Move to Pending, Move to Draft · Edit · Delete |
| admin | any other | Edit · Delete |

The moves sit above a divider, then Edit, then Delete in the critical colour. The Figma draws
these five menus; the "any other status" rows are the assumption that nothing else changes. A
domain step (For QA, In QA…) is a status like any other.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `role` | `'user' \| 'admin'` | `user` | Admins can move an AV between Draft, Pending and Backlog |
| `status` | `string` | — | Only Draft, Pending and Backlog change the menu |
| `onEdit`, `onDelete` | `() => void` | — | Edit and Delete. It only reports; the page opens the editor or the confirm dialog |
| `onMoveToBacklog`, `onMoveToDraft`, `onMoveToPending` | `() => void` | — | The moves |
| `label` | `string` | `AV options` | The button's accessible name |
| `className`, `ref` | | | On the wrapper |

## Tokens

The button is an `IconButton` `neutral` (the outlined grey), a `dots-three-outline-vertical` glyph,
32 to look at as Figma draws it (40 on a touch screen). The menu is `Menu`'s: `surface.elevated`,
`shadow.menu`, rows `label-sm-medium`, Delete in `accent.critical.outline.content`. No new tokens.

## Accessibility

- The button is named ("AV options") and is a menu button (`aria-haspopup`, `aria-expanded`); the
  menu is `Menu`'s, with its arrows, type-ahead and Escape.
- Delete is in the critical colour and is last; `Menu` also gives it a screen-reader qualifier
  ("destructive action"), so colour is not the only thing that sets it apart. The page should still confirm it.
- 32 is under the 40 touch minimum, so a touch screen gets 40.

## Don't

- **Don't decide the menu's contents on the page.** Pass the role and the status.
- **Don't make Delete act at once.** It reports; confirm in a dialog.
- **Don't add a second menu to the same page header.** This is the one for the AV.
