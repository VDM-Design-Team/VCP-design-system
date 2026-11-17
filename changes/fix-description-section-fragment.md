---
bump: patch
---
### `DescriptionSection` — cards passed in a Fragment are no longer stuck together (November 2026)

Passing the cards as `<><DescriptionCard … /><DescriptionCard … /></>` left them as one child, so they shared one list item and sat touching, with no gap and without the section's position or remove labels (the `AVPage` editing story showed it under Problems, Solutions and the rest). Fragments are now opened, so each card is its own item, 16 apart, numbered and labelled by the section.
