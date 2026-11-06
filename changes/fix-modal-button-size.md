---
bump: patch
---
### Dialog footer buttons are all `sm`, and a red answer has a grey Cancel (November 2026)

The critical `actions` row drew 36-high buttons while a hand-built footer (the Modal stories, and `ConfirmDeleteAVModal`'s red pair) used the default 40, so a delete dialog looked different from the others. Every footer button is now `sm` (36 high), and the hand-built destructive footers use the grey `neutral` Cancel beside the red answer, as `tone="critical"` does. `docs/modal.md` says so, and `CriticalTone` asserts the height.
