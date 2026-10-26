# UserMenu

The signed-in person and the menu behind them: their avatar and name with a caret,
opening a `Menu` of account links. By default the menu holds just **Settings** and **Logout**.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Icon` | atom |
| `Menu` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `UserMenu` | The account menu in the app bar: who is signed in, and where they can go |
| `Menu` | Any other list of actions behind a button |
| `TopBar` | The bar that hosts it: pass `userMenuItems` and it renders a `UserMenu` |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `user` | `{ name, src? }` | — | `name` is what the trigger says ("Francis M."); `src` is a photo URL shown in the avatar — without one, or if it fails to load, the avatar draws initials (see the `WithPhoto` story) |
| `items` | `MenuItem[]` | Settings, Logout | The menu's rows, exactly as `Menu` takes them: `key`, `label`, optional `icon`, `tone: 'danger'`, `disabled`, `{ divider: true }`. The default is exported as `DEFAULT_USER_MENU_ITEMS` |
| `onSelect` | `(key?) => void` | — | Fires with the activated row's `key`, after that row's own `onClick` |
| `align` | `'left' \| 'right'` | `right` | Which edge of the menu lines up with the trigger. The bar sits at the right of the page, so the menu opens leftwards |
| `open` / `defaultOpen` / `onOpenChange` | | | Controlled or uncontrolled, as `Menu` |
| `panelClassName`, `className`, `ref` | | | As `Menu` |

**The default is Settings and Logout; anything more is the page's.** Figma's menu also lists My Added
Values and Cycle Settings: pass those (the `CustomItems` story) where a page wants them. What Logout
does, and which rows an admin sees that a regular user does not, belong to the app: pass different
`items`. This component renders the trigger and the menu and reports the `key`.

**It hugs its content.** The trigger is as tall as its avatar and name (40), even inside a tall flex
row: `Popover`'s wrapper is `inline-flex`, which would stretch its child, so the component opts out.

## Tokens

The trigger is the look `TopBar`'s user chip has after design review, so the two never differ:
8 of padding at the sides and 4 above and below (so the caret and the avatar sit the same distance from the
edges, the caret's box pulled 3 into the padding), a 32 `Avatar`, the name in `label-sm-medium` and `text.primary` (cut with "…" past 10rem), a
`caret-down` in `text.tertiary` that turns 180° while the menu is open (as `SearchSelect`'s does; it reads
`aria-expanded` and is skipped under reduced motion), a `radius.md` hover wash of `surface.neutral.faint`, and the
`stroke.focused` ring. The panel and rows are `Menu`'s (`docs/menu.md`). No new tokens.

## Accessibility

- The trigger is a real `<button>` named "<name>, account menu". `Menu` adds `aria-haspopup="menu"`
  and `aria-expanded`, moves focus into the list on open and back to the trigger on close.
- Keyboard is `Menu`'s: Enter, Space or an arrow opens; arrows move; Home and End jump; type-ahead
  finds a row; Escape closes; Tab closes.
- The avatar and the caret are decoration; the name is in the button's name.

## Differences from the design

- **The trigger's avatar is 32, not 40.** Figma's `_User menu` uses `Profile_Image` at size L (40); the
  system's avatar steps are 16, 24, 32 and 36, and `TopBar`'s reviewed chip (32) is kept so the bar does
  not change.
- **The name is `label-sm-medium`, not semibold**, and the caret is the system's 16 `caret-down` rather than
  a 24 heroicons chevron. Both are `TopBar`'s reviewed values.
- **The menu is the system's `Menu`, not a bespoke box.** Figma draws a 192-wide white box with regular
  black text and no hover state; `Menu` gives the shared surface, rows, hover and keyboard model, as every
  other dropdown has.
- **No role badge**, as `TopBar` (design review, 3 Sep 2026: no design for it).

## Don't

- **Don't hard-code the rows in the component.** They arrive as `items`; roles and permissions are the
  page's.
- **Don't put a second menu behind the bar's user chip** (`onUserMenu` plus `userMenuItems`): pass
  `userMenuItems` and `UserMenu` is the chip.
