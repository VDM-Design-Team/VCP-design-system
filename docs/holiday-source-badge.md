# HolidaySourceBadge *(component)*

Where a Holiday Registry entry came from: **Manual Entry** (a pencil), **Google Calendar** (a calendar) or **In Hubstaff** (a link), each a `Badge` with its glyph before the word. The owner of that vocabulary and its look.
Read off Figma's `_Holiday_Registry_Source_Badges` (`8048:125076`, revised November 2026: Badges, not Tags).

## Composed of

| Piece | Tier |
|---|---|
| `Badge` | atom |
| `Icon` | sub-atomic |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `HolidaySourceBadge` | The Source column of the Holiday Registry |
| `SourceTag` | Where an *Added Value* came from — free text, a different thing |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `source` | `'manual' \| 'google-calendar' \| 'hubstaff'` | required | Closed vocabulary; the mapping lives in the `.tsx` |
| rest, `ref` | `<span>` props | | |

## Tokens

Tonal `Badge` (`md`: pill, 12 medium): Manual Entry in the info tone, Google Calendar and In Hubstaff in the success tone. No new tokens.

## Accessibility

The word carries the meaning; the glyph is decoration, so the source never rides on colour.

## Don't

- **Don't pick the tone or glyph at the call site.** This file owns the mapping.
