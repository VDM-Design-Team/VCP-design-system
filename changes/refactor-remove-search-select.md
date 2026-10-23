---
bump: major
---
### `SearchSelect` — removed (October 2026)

`SearchSelect` is gone. It was ported from the Claude Design export, which had no Figma component behind it, and nothing in the system used it: the design's searchable dropdowns (people, tags) are a different shape, a dropdown field that opens a panel with a search box, and a text input that clears itself after a pick could not show what was chosen. It is not exported from `src/index.ts` any more, and `docs/search-select.md` is deleted. Docs for `Select` no longer point at it.

Migration: replace `SearchSelect` with `Select` where the list is short enough not to need search (it takes `options`, `value` and `onChange(value: string)`; there is no `multiple`, no avatars and no search). If you need search or several picks, there is no searchable replacement merged yet: stay on the previous version, or keep your own copy of the component, until one ships. Nothing in this repository imported it.
