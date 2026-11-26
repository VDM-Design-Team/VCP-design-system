---
bump: patch
---
### `DomainCard` — dragging a row shows only the row (November 2026)

Dragging a status in the Admin Panel, the picture under the pointer was the whole section below the row: Chrome
took it from the screen, and inside the card's rounded, clipped box it took in the rest of the card. The card now
hands the browser a copy of the row alone, lifted (elevated surface, radius, menu shadow), held where the pointer
took it. The helper, `dragImageOfRow` in `src/lib/drag-image.ts`, is there for other draggable rows.
