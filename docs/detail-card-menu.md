# DetailCardMenu *(component)*

The ⋮ button at the head of an Added Value page, and the menu it opens: Edit and Delete for
everyone, with the moves between Draft, Pending and Backlog that the person's role and the AV's
status allow.

Read off Figma's `Detail_Card_Menu` (the button: default, hover, pressed) and `AV_Options_Dropdown`
(five menus, by role and status). The admin's moves on a Rejected AV and on one that is accepted or
in progress are the live product's, adopted on 13 Nov 2026; Figma does not draw them yet.

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
| admin | Rejected | Move to Backlog, Move to Pending, Move to Draft · Edit · Delete |
| admin | Completed | Edit · Delete |
| admin | any other (Accepted, a domain step, Review) | Move to Backlog, Move to Draft · Edit · Delete |

The moves sit above a divider, then Edit, then Delete in the critical colour. Figma draws the
first five menus. The last three rows were decided on 13 Nov 2026 from what the live product
offers an admin:

- **Rejected is not final.** An admin can reopen a rejected AV (Move to Pending), park it or send
  it back to its initiator as a draft. This replaces the 9 Nov 2026 rule that a rejection could
  not be undone.
- **Work in progress can be parked or sent back to Draft.** A domain step (For QA, In QA…) is in
  progress like Accepted and Review.
- **Completed gets no moves.** The live product was not checked for it, so nothing is assumed.

A user's menu is unchanged: one move, on a Draft.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `role` | `'user' \| 'admin'` | `user` | Admins can move an AV between Draft, Pending and Backlog, reopen a Rejected one and park one in progress |
| `status` | `string` | — | A user gets a move only on a Draft; an admin on everything but Completed. Without a status there are no moves |
| `onEdit`, `onDelete` | `() => void` | — | Edit and Delete. It only reports; the page opens the editor or the confirm dialog |
| `onMoveToBacklog`, `onMoveToDraft`, `onMoveToPending` | `() => void` | — | The moves |
| `label` | `string` | `AV options` | The button's accessible name |
| `className`, `ref` | | | On the wrapper |

## Tokens

The button is an `IconButton` `neutral` (the outlined grey) with `shape="square"` (`radius.sm`), a
`dots-three-outline-vertical-fill` glyph (the filled dots), 32 to look at as Figma draws it (40 on a touch screen). The list has
no icons, as the design draws it; Delete turns its warning glyph off (`icon: false`) and keeps the critical colour and the
"destructive action" qualifier for a screen reader. The menu is `Menu`'s: `surface.elevated`,
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
- **Don't move to the Backlog without asking why.** Move to Backlog opens `MoveToBacklogModal`, whose feedback is required.
- **Don't add a second menu to the same page header.** This is the one for the AV.
