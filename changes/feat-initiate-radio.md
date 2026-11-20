---
bump: major
---
### `InitiateToOtherDomain` — one choice, with "Don't initiate" first (November 2026)

The card is now a group of **radio buttons**: an Added Value is initiated to one other domain at a time (design lead, 20 November 2026, reversing the 16 November decision to keep checkboxes). The first option is **"Don't initiate to another domain"**, chosen by default, and after it come the other domains, "Initiate to Development assignment". `disabled` is unchanged in spirit (an Added Value handed off from another domain): every option is disabled and "Don't initiate" is shown chosen whatever `value` says. Built on `RadioGroup`, which gains an optional `description` (a line under the legend, wired to `aria-describedby`) for the disabled reason.

Migration: `value` and `defaultValue` were `string[]` and are now `string | null` (`null` is "don't initiate"); `onChange` was `(value: string[], { value, checked }) => void` and is now `(value: string | null) => void`. A page that opened a section for each ticked domain now opens one for the chosen domain, or none for `null`. An option's `value` must not be empty. Figma still draws checkboxes and has no "Don't initiate" option or Disabled variant, so the Figma set needs the same changes.
