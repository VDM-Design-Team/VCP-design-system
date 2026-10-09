---
bump: minor
---
### `Sidebar` — the domain selector is Figma's dropdown, built on `Menu` (October 2026)

The domain switcher was a native `Select`, bordered like a form field. It is now Figma's `_Domain_Selection_Dropdown`: a filled, borderless trigger with an up-down caret that opens the system's `Menu` at the trigger's width. The props (`showDomainSelector`, `domain`, `domains`, `onDomainChange`) are unchanged. The trigger's accessible name is now "Domain: <current>. Change domain".
