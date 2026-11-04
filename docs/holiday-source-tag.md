# HolidaySourceTag *(component)*

Where a Holiday Registry entry came from: **Manual Entry** (a pencil, after the word), **Google Calendar** (a calendar before it) or **In Hubstaff** (a link after). The owner of that vocabulary and its look.
Read off Figma's `_Holiday_Registry_Source_Badges` (`8048:125076`).

## Composed of

| Piece | Tier |
|---|---|
| `Tag` | atom |
| `Icon` | sub-atomic |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `HolidaySourceTag` | The Source column of the Holiday Registry |
| `SourceTag` | Where an *Added Value* came from — free text, a different thing |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `source` | `'manual' \| 'google-calendar' \| 'hubstaff'` | required | Closed vocabulary; the mapping lives in the `.tsx` |
| rest, `ref` | `<span>` props | | |

## Tokens

Tonal `Tag` (`md`, 28): Manual Entry in the info tone, Google Calendar and In Hubstaff in the success tone. No new tokens.

## Accessibility

The word carries the meaning; the glyph is decoration, so the source never rides on colour.

## Don't

- **Don't pick the tone or glyph at the call site.** This file owns the mapping.
