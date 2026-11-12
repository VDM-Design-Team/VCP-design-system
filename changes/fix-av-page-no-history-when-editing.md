---
bump: patch
---
### `AVPage` — no Status History when editing (November 2026)

An editing page (a new Added Value, or one being edited) no longer draws Status History, even if `history` is passed: it is for reading only, like Comments. The left column when editing is now the Title, the four blocks, Multipart and Duplicate to other Domains. Figma's editing frames draw a collapsed Status History row there; this follows the design lead's call that it should not be on an editing page.
