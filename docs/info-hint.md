# InfoHint

The small "i" beside a card's title or a stat's label that explains it in a tooltip. It is the one place the system draws that control, so every card does it the same way.

A 16 `info` glyph in `text.tertiary`, a real button named "About {label}", the `Tooltip` opening below it, and a 40 press area around the glyph.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | sub-atomic |
| `Tooltip` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `InfoHint` | A short explanation of a card's title or a stat's label: what a number counts, why a list is there |
| `Tooltip` | Describing any other control (an icon button, an avatar) |
| Text under the title | Anything the person must read, or longer than a sentence: a hint is optional, so never put required information in one |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | What the hint is about; the button is named "About {label}". Plain text: the title or label it sits beside |
| `content` | `ReactNode` | required | The explanation. Never interactive (see `Tooltip`) |
| `placement` | `top \| bottom \| left \| right` | `bottom` | The preferred side; it flips when there is no room |
| `openDelay`, `defaultOpen`, `wide` | | | As `Tooltip` |
| `className` | `string` | | On the button (for spacing) |

## Size

**16, always.** It sits at the weight of the 14 to 18 text it follows. Until November 2026 the system drew it at 16 beside a card title and at 20 beside a stat label; one size is the precedent now. The pointer target is 40 (a `::after`, 12 beyond the glyph on each side), so the glyph can be small and the touch minimum still holds. Leave about 4 between the text and the icon (`gap-1`).

## Tokens

| Part | Token | Utility |
|---|---|---|
| Glyph | `text.tertiary`, hover `text.secondary` | `text-text-tertiary hover:text-text-secondary` |
| Focus ring | `stroke.focused` | `outline-stroke-focused` |
| Tooltip | `Tooltip`'s | |

No new tokens.

## Accessibility

- A real `button`, named "About {label}"; it is focusable, and the tooltip opens on focus as well as hover, and closes on Escape.
- The tooltip describes the button (`aria-describedby`); the name says what it is about, the tooltip says what it means.
- The glyph is decorative (`aria-hidden`); the 40 press area meets the touch minimum without making the icon bigger.
- Hover is not the only way in: a keyboard user tabs to it. Because a hint can be missed, nothing required goes in one.

## Don't

- Don't put a link, a button or anything interactive inside the content.
- Don't make it bigger than 16 to make it easier to hit; the press area already does that.
- Don't draw your own "i" button beside a title; use this.
- Don't label it "More info": say what it is about ("About Team Capacity").
