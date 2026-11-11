# HolidayTypeTag *(component)*

What kind of holiday a Holiday Registry row is, as a glyph and a word — **Public** (a globe), **Team** (a group), **Individual** (one person). The owner of that vocabulary and its glyphs.
Read off Figma's `_Holiday_Registry_Type_Holiday` (`6155:73488`).

## Composed of

| Piece | Tier |
|---|---|
| `Tag` | atom |
| `Icon` | sub-atomic |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `HolidayTypeTag` | The Holiday Type column, and anywhere a holiday's type is named |
| `TypeTag` | An Added Value's Type 1–3 — a different vocabulary |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `'public' \| 'team' \| 'individual'` | required | The closed vocabulary. `HOLIDAY_TYPES` lists them in the design's order; `holidayTypeLabel(type)` gives the word (for a select's options) |
| rest, `ref` | `<span>` props | | |

## Tokens

A neutral tonal `Tag`, `sm` (24 tall), the glyph filled and 16. No new tokens.

## Accessibility

The word carries the meaning; the glyph is decoration, so the type never rides on colour or shape alone.

## Don't

- **Don't map the word to a glyph at the call site.** This file owns it.
- **Don't add a fourth type here without Figma** — it is a deliberate compile error at every `Record<HolidayType, …>`.
