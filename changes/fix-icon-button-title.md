---
bump: patch
---
### `IconButton`, `RichTextToolbar` — the name is heard once (November 2026)

Fix: an `IconButton` with no `Tooltip` carried its label twice, as `aria-label` and as `title`. A `title` the name
didn't come from is the description, so a screen reader heard "Add deliverable, button, Add deliverable".
`RichTextToolbar`'s buttons did the same. Now the `title` alone names the button and is still its hover hint;
under a `Tooltip` the name stays `aria-label`, with no `title`, as before. The story check
`vcp-description-repeats-name` now also fails a `title` that repeats an `aria-label`: it found this in 153 stories.

Nothing changes on screen, and the props are the same. A test that finds a bare `IconButton` by its `aria-label`
attribute (`[aria-label="…"]`, `getByLabelText`) finds it by role and name instead:
`getByRole('button', { name: '…' })`.
