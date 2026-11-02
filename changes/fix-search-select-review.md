---
bump: patch
---
### `SearchSelect` — a pick keeps its name with server search; the label focuses (November 2026)

Fix: with `onSearch`, a pick that dropped out of the current `options` (the search moved on, or the panel reopened and the page reset its list) showed its raw value in the field and its tag, "carl" for Carl Baker. The field now remembers every option it has been given, so the name and the tag's tone stay. For a value set before any search, include its option in the first `options`.

Clicking a `Field` label now focuses SearchSelect without opening the panel, as it does a native `Select` (the label used to pass its click on to the button and open it).

Stories: a visible *Sizes, full width and loading* story shows `size`, `fullWidth` and `loading`, which were only in hidden tests; *Rows* is wide enough for its switcher to read in full; *Light and dark* fills the page side by side instead of overflowing the 240px frame. The docs no longer call server search a future option. No API change.
