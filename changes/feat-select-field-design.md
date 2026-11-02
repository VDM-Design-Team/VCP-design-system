---
bump: minor
---
### `Select` — the field reads like `SearchSelect`'s; a new `error` prop (October 2026)

The placeholder is now `text.subtle` in regular weight and a chosen value is `text.primary` in medium, matching `SearchSelect`'s field (the grey is CSS only, via `:has(option[value=""]:checked)`). The native options get explicit surface and text tokens so the popup follows the theme where the browser allows. New optional `error` prop puts a message under the select in the critical colour and announces it with the select; inside a `Field`, keep using the `Field`'s `error`.

The open list stays the browser's, on purpose: `docs/select.md` records why, and points at `SearchSelect` (with `searchable={false}`) for the styled panel. Nothing breaks: the element is still a plain `<select>`, and the DOM is unchanged unless `error` is set.
