---
bump: patch
---
### `TableCard` spacing and a rounded `bare` table (November 2026)

A `bare` table (inside a `TableCard`) draws no border or fill but now keeps `radius.md` (8) corners, so its header band and hovered rows are rounded rather than square against the card's padding.

`TableCard` padding is now 24 all round (was 16); so is the gap between its filters, table and pagination (was 16). Every table drawn in a `TableCard` gets the roomier card.

`MyValuesStats` padding is now 24 all round (was 16), to match the table card beside it on My Values.
