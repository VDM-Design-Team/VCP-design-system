---
bump: patch
---
### `DataTable` `bare` keeps rounded corners (November 2026)

A `bare` table (inside a `TableCard`) draws no border or fill but now keeps `radius.md` (8) corners, so its header band and hovered rows are rounded rather than square against the card's padding.

`TableCard` padding is now 24 all round (was 16); the gap between its filters, table and pagination stays 16. Every table drawn in a `TableCard` gets the roomier card.
