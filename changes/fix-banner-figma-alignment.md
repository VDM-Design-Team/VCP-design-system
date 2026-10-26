---
bump: minor
---
### `Banner` — aligned with Figma (October 2026)

Read off the General Design Library's `Banner` (`3494:1336`), design review.

- **Title 16 semibold** (`title-sm-semibold`; was 14 medium); body stays 14 regular. **Padding 16 all round** (was 14 / 12), **8** between the icon
  and the text (was 12), 2 between title and message (was 4).
- **Icons are `fill`, 20 × 20**, and the tones follow Figma's shapes: **warning is the exclamation in a circle** (`warning-circle-fill`, was
  the triangle), **danger/critical is the exclamation in a triangle** (`warning-fill`, was the cross-circle), info is `info-fill`, success keeps
  `check-circle-fill`. New icons: `info-fill`, `warning-circle-fill`.
- **The glyph is the tone's `outline.border.default`** (Figma's bright colour; was the dark text colour) and is **vertically centred on the title line**
  (`mt-0.5`: 20 glyph on a 24 line). It is below 3:1 on the tint (1.78–3.12:1 light, 1.98–2.95:1 dark): a recorded exception, see `docs/banner.md`.
- **The stroke is Figma's `outline.border.default`** (was `outline.content.default`): red-500, yellow-500, blue-500, green-500. It is cosmetic, and
  no longer clears 3:1 on the page; `docs/banner.md` has the figures.
- **New `showIcon` prop** (default `true`): the tone glyph is optional. Off, the tone word is announced from visually hidden text, so assistive tech keeps it.
- **Storybook:** the Default story has *icon*, *action button* and *dismiss button* controls, so both optional elements can be added or removed live.
  The component API is unchanged — they are still optional (`actionLabel` + `onAction`, `onDismiss` + `dismissLabel`).
