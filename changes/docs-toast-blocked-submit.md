---
bump: minor
---
### `Toast` — `announce: false`, and toasts on a blocked Submit (November 2026)

`toast()` takes a new option, `announce: false`. It shows a toast without
reading it out: the toast goes into a plain stack after the two live regions,
with no role and no `aria-live`. It is for a toast that repeats a message
already announced somewhere else, so a screen reader user hears it once.
`announce` defaults to `true`, so every existing toast behaves as before.

The one case in VCP is a blocked Submit on an Added Value. The product chose
the Figma behaviour (5 November 2026): a "Missing Input" toast for each missing
field, and the "Unavailable Assignee" toast, on top of the error under each
field. `docs/toast.md` now allows those toasts and says on what terms. The
field error stays the message and the one announcement, and the toasts are
raised with `announce: false`. The story **Blocked submit is said once** tests
it.
