---
bump: minor
---
### `font.family.emoji` — emoji take a colour emoji font (October 2026)

**New** (minor): the core token `font.family.emoji` (utility `font-emoji`) —
`Apple Color Emoji`, `Segoe UI Emoji`, `Noto Color Emoji`, `Twemoji Mozilla`, then
`sans-serif`. It names the colour emoji fonts first, so a platform's text-style fallback
cannot claim an emoji's code point before them.

`EmojiReactionPicker` uses it on the palette cells and on the pills' emoji. Why: in
Chromatic (which renders on Linux) the picker's 😄 😅 😂 😮 😊 rendered as monochrome
outline faces while the rest rendered in colour (design review of build 41 on #124).
macOS and Windows already chose a colour font, so it never showed locally. No API change.
