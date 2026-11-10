# ChangelogItem *(atom)*

One release in the System Changelog: its title and version, when it was posted, what it says, and the features and updates it brought.
Built to Figma's `_Changelog_Item`.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

An atom: one card, plain markup on tokens, with `Icon` for the kind's glyph. The kinds themselves (glyph, colour, words) are owned by
`src/lib/changelog-kinds.ts`, which `ChangeLogModal` reads too.

## When to use

| Use | For |
|---|---|
| `ChangelogItem` | One release card in a list of releases |
| `SystemChangelog` | The whole page of them |
| `ChangeLogModal` | One announcement at a time, in a dialog, with arrows and dots |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | required | The release's title; the card's heading |
| `kind` | `experimental \| update \| feature` | — | The kind of announcement. Draws its glyph (flask, megaphone, rocket) before the title and says "Experimental feature", "Release" or "New feature" to a screen reader. Left out, no glyph |
| `href` | `string` | — | The release's changelog document. The title becomes a link to it, opening in a new tab |
| `version` | `string` | — | As it reads: "v1.18.1" |
| `date` | `string` | — | **ISO**, "2026-01-01": shown dd/mm/yyyy (or the person's locale, `useDateFormat`) inside a `<time>`. The card adds "Posted on" |
| `message` | `string` | — | What the release says. Left out when empty |
| `features` | `string[]` | `[]` | One bullet each, under **Features/Updates:**. The heading and list go when empty |
| `headingLevel` | `2 \| 3 \| 4` | `3` | The title's element. Same look at every level |

## Tokens

`surface.elevated`, `radius.sm` (6, Figma's `radius-3`), `elevation-3`, `space.24` padding and `space.16` between parts. Title `body-lg-semibold`
`text.primary`; version and date `body-sm-regular` `text.tertiary`; message and bullets `body-md-regular` `text.secondary`; **Features/Updates:**
`body-sm-semibold` `text.primary`. A linked title is `text.link.default` (underlined on hover). The kind's glyph is 20 in the kind's own colour
(`accent.green.strong`, `accent.yellow.medium`, `accent.info.outline.content.default`).

## Accessibility

- An `article` whose heading is the title; the list is a real list.
- **The kind is text, not just a glyph**: the glyph is hidden from assistive tech and the kind's name is read before the title.
- **A linked title is a real link** inside the heading, with a visible focus ring. It opens in a new tab and says so ("opens in a new tab").
- Nothing depends on colour.

## Don't

- **Don't pre-format the date.** Pass the ISO date; the version reads as given.
- **Don't use it for a one-at-a-time announcement.** That is `ChangeLogModal`.
- **Don't map a kind to a glyph or colour yourself.** Pass `kind`; `src/lib/changelog-kinds.ts` owns the mapping.
