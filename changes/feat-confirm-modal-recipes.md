---
bump: minor
---
### `ConfirmModal`, and the confirmations the Added Value pages ask (November 2026)

New `ConfirmModal`: `Modal` in its critical tone (an alert dialog, no ✕, no click-outside, a grey Cancel and a red **Confirm**) for the step that loses something and needs one more answer. The copy of the dialogs Figma draws is in `confirmations`: `deleteProblemSet`, `discardAV`, `removeLink`, `removeFile` and `leavePage`; spread one in. Two are built in, opt-in (off, nothing changes): `DeliverablesCard` gets `confirmRemove` (removing a link or file asks first) and `AVPage`'s `actions` gets `confirmDiscard` (Discard asks first). The problem set's remove and the unsaved-changes prompt stay the page's to show, since the second needs the app's router. Stories cover each; the docs say when to use it against `ConfirmDeleteModal` and a toast with Undo.
