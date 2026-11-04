# ChangelogItem *(component)*

One release in the System Changelog: its title and version, when it was posted, what it says, and the features and updates it brought.
Built to Figma's `_Changelog_Item`.

## Composed of

*Nothing — it is plain markup on tokens.*

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
| `version` | `string` | — | As it reads: "V.1.1" |
| `date` | `string` | — | **Already formatted**: "01/01/2026". The card adds "Posted on" |
| `dateTime` | `string` | — | "2026-01-01": wraps the date in a `<time>` |
| `message` | `string` | — | What the release says. Left out when empty |
| `features` | `string[]` | `[]` | One bullet each, under **Features/Updates:**. The heading and list go when empty |
| `headingLevel` | `2 \| 3 \| 4` | `3` | The title's element. Same look at every level |

## Tokens

`surface.elevated`, `radius.sm` (6, Figma's `radius-3`), `elevation-3`, `space.24` padding and `space.16` between parts. Title `body-lg-semibold`
`text.primary`; version and date `body-sm-regular` `text.tertiary`; message and bullets `body-md-regular` `text.secondary`; **Features/Updates:**
`body-sm-semibold` `text.primary`.

## Accessibility

- An `article` whose heading is the title; the list is a real list.
- Nothing depends on colour.

## Don't

- **Don't format the version or date here.** Pass them as they should read.
- **Don't use it for a one-at-a-time announcement.** That is `ChangeLogModal`.
