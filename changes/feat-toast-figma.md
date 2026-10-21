---
bump: minor
---
### `Toast` — the Figma design: a neutral card, tone in the icon and timer bar (October 2026)

The tinted card is gone. A Toast is a white `surface.elevated` card with a `stroke.subtle` border, 16 padding, the `md` radius and 8 gaps (all the Banner's), and it hugs its content up to `max-w-sm`. The tone shows only in the filled glyph and the solid timer bar (the accent's `outline.border.default`): `info-fill`, `check-circle-fill`, `warning-circle-fill` for warning and `warning-fill` for danger. Title is 14 semibold `text.primary`, the message is 14 medium `text.secondary`. The action is the standard small secondary Button, top-aligned just left of the close control, which is a neutral round icon button. Adds the `info-fill` and `warning-circle-fill` glyphs.

Also: `ToastViewport` packs the stack against the edge it is anchored to (flush right for the right positions, centred for the centred ones). A short toast no longer sits at the left of the 384px column, and toasts of mixed widths line up.

Also: a toast with only a title (or only a message) centres its row, so the glyph, text, action and X share a midline. With both a title and a message the controls stay on the first line.

Also: a blank `title`, message or `actionLabel` (absent, `false` or an empty string) renders nothing, so clearing a control in Storybook no longer leaves an empty description box. No new props.
