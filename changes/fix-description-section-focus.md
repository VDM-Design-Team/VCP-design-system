---
bump: patch
---
### `DescriptionSection`: where focus goes after a card is removed (November 2026)

Removing a card only reports it, so the page owns focus afterwards; left alone it fell to the page. `docs/description-section.md` now says where it goes — the next card's field, or the section's Add button when it was the last — and a new `RemovingACard` story shows it and asserts `document.activeElement`. No change to the component.
