---
bump: minor
---
### `UserMenu` — the signed-in person and their account menu; `TopBar` renders it (October 2026)

New component, to Figma's `User_Menu`: the user's avatar, name and a caret, opening the system's `Menu` of account links. The trigger is `TopBar`'s existing reviewed user chip, moved into a shared piece; the rows are yours (`items`, `onSelect(key)`), so what Logout does and which links an admin sees stay with the app.

`TopBar` takes `userMenuItems` and `onUserMenuSelect`: with them the user chip becomes a `UserMenu`. `onUserMenu` still works as before for an app that opens its own menu, and is ignored when `userMenuItems` is given.
