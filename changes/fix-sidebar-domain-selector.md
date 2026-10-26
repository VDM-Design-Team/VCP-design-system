---
bump: minor
---
### `Sidebar` — the domain selector is Figma's dropdown, built on `Menu` (October 2026)

The domain switcher was a native `Select`, bordered like a form field. It is now Figma's `_Domain_Selection_Dropdown`: a filled trigger with an up-down caret and a `neutral.outline.border` stroke (default, hover, pressed and disabled states). The caret follows the border's colour. The trigger opens the system's `Menu` at the trigger's width, and is 40px tall, the minimum target.

`Menu` gains a `selected` flag on its items, which renders `role="menuitemradio"` with `aria-checked` and a check icon, so the current choice is announced and shown without relying on colour. The Sidebar passes the current domain, so the open list marks it. It is additive: items that do not set it are unchanged.

The props (`showDomainSelector`, `domain`, `domains`, `onDomainChange`) are unchanged. The trigger's accessible name is now "Domain: <current>. Change domain".
