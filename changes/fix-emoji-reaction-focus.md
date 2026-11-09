---
bump: minor
---
### `EmojiReactionPicker` — "+N" expands the row, three names in the tooltip, focus stays (November 2026)

- **"+N" is a button now** (decided 9 Nov 2026): it shows every pill in the row, and "Show less" folds them again.
  Named "Show N more reactions", with `aria-expanded`; the same button both ways, so focus stays on it.
- **Who reacted names up to three people, then "and N others"** ("You, Marvin Ode, Ali and 2 others"), Figma's copy.
  It named two before.
- **Focus no longer drops** when you take back the last reaction on a pill: it moves to the pill that took its place,
  or to Add reaction.
