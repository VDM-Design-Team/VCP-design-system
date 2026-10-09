---
bump: minor
---
### `Modal` — round close button, optional subtitle and footer (October 2026)

New `showDescription` and `showFooter` props (both default `true`) hide the subtitle and the footer actions. The gap between header and body is 12 under a subtitle or when the body opens with a control or card (a button, a form field, a selectable card), and 4 when running text follows a bare title. The title stays `title-md-semibold`.

Fix: the last field's focus ring was clipped at the bottom of the body. The body now keeps 4px of bottom padding with a footer, and the footer's top padding is 4px shorter, so the visible gap stays 20.
