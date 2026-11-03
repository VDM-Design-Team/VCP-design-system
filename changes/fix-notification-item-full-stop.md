---
bump: patch
---
### `NotificationItem` — one full stop, and the Light and dark story reads (November 2026)

Fix: a subject that already ends in its own punctuation no longer gets a second full stop. A title "Is this ready?" read "… Is this ready?. A few seconds ago"; it now reads "… Is this ready? A few seconds ago". The same holds for a status at the end of the sentence.

Stories: *Light and dark* and *Markers clear 3:1* were squeezed into the 384px column every NotificationItem story sits in (a story's `decorators: []` adds to the meta's instead of replacing it), so the two halves of Light and dark overlapped. The column now steps aside for full-screen stories, and Light and dark stacks its halves below 1024px. No API change.
