---
bump: minor
---
### `DetailCard` — read-only fields while editing (November 2026)

New `readOnly` prop (a list of fields). In the editing and new cards, those dropdowns and dates show their value but can't be opened or changed, using each control's disabled state. Figma's multipart part edit page (`1404:132644`) needs it: a part's Projects, AV Category, Type and Urgency come from its parent.
