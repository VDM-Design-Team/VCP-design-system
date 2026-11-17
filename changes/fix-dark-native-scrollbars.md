---
bump: patch
---
### Dark theme — native scrollbars and controls follow it (November 2026)

The browser draws its own scrollbars, form controls, date and colour pickers and native select menus from `color-scheme`, not from our tokens, so under `.dark` they stayed light: a white scrollbar on a dark panel. The dark tokens (`dist/tokens.dark.css`, imported by `theme.css`) now open with `color-scheme: dark`. With `.dark` on `<html>` (as Storybook's toolbar and the usual setup do) the page's own scrollbar goes dark too; on a wrapper element it darkens every scroll container and control inside it. Added in the token build (`style-dictionary.config.mjs`, a wrapper around GDL's mode-overrides format), since `dist/` is generated. A Foundations story checks it. Nothing changes in the light theme.
