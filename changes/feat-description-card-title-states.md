---
bump: minor
---
### `DescriptionCardTitle` — editing, disabled and multipart-child states; moved from atoms to components (November 2026)

The title card of an Added Value page now has Figma's other states: **Editing** (the Title field, empty with "Type in the title" or filled, with an `error`), **Disabled**, and a **Multipart Child** line ("Multipart Child of VCP-4321", the parent a link). The AV page built its own editing title next to the card and did not use the card to read either; it now uses the card in every state, so the page and the stories show one card.

Because the editing card holds a `Field` and an `Input`, it moved from `src/atoms` to `src/components` (the import from the package root is unchanged; Storybook's id is now `Components/Forms/DescriptionCardTitle`). `reference` is optional now (the editing card has none). The reading card's reference on the AV page is `text.primary` 16 regular as Figma draws it (it was `text.secondary` 16).
