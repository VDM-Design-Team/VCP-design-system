# DomainLabel *(component)*

The small pill that says which domain something came from: a glyph and two letters ("DS"), beside a
deliverable link or on the corner of an attached file.

Read off Figma's `_Domain_Label` set (`7119:82657`): six domains, abbreviated, with or without a tooltip.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `Tooltip` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DomainLabel` | Showing which domain added or owns something: a link, a file |
| `StatusTag` | A status, not a domain |
| `Badge` | Any other classification |

## The six domains

**The component owns the mapping**, the way `StatusTag` owns status → tone, so a link and a file cannot draw
the same domain two ways.

| `domain` | Glyph | Code | Tooltip |
|---|---|---|---|
| `design` | pen nib | DS | Added by Design |
| `development` | code | DV | Added by Development |
| `governance` | bank | GV | Added by Governance |
| `content` | image | CN | Added by Content |
| `partners` | handshake | PT | Added by Partners |
| `qa` | file magnifying glass | QA | Added by Quality Assurance |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `domain` | `DomainKey` | — | One of the six. Sets the glyph, the code and the name |
| `code`, `icon` | `string`, `IconName` | — | A code outside the six, when there is no `domain` |
| `tooltip` | `boolean` | — | "Added by {domain}" on hover. Only with `domain` |
| `decorative` | `boolean` | — | No words for a screen reader, where the surrounding text already names the domain (`FileAttachment`'s corner badge) |
| `className`, `ref`, rest | | | On the pill |

## Tokens

A pill: `radius.pill`, 8 either side and 2 above and below, 4 between the glyph and the code, `caption-sm-medium`,
`neutral.tonal.surface.default` / `neutral.tonal.content.default`, a 1 `stroke.inverse` border, a 12 glyph. The
colour is the same for every domain. No new tokens.

## Accessibility

- It is not a control: no click, no focus. The tooltip is a hover aid only.
- The words are always in the page for a screen reader, "Added by Design.", unless `decorative`.
- The glyph and code are decorative to a screen reader; the sentence carries the meaning.

## Don't

- **Don't recolour a domain.** The colour is the same for all six; the glyph and letters tell them apart.
- **Don't put it where it could be mistaken for a control.** It does nothing when pressed.
