# SystemChangelog *(pattern)*

The page that lists every release: a "System Changelog" title over one `ChangelogItem` card per release. Built to Figma's
`Admin System Changelog` (`Settings_Changelog_List`).

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `Skeleton` | atom |
| `ChangelogItem` | component |
| `EmptyState` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `SystemChangelog` | The admin's full list of releases |
| `ChangelogItem` | One release card anywhere else |
| `AnnouncementsTable` | Where **View Changelog** is pressed |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `releases` | `ChangelogRelease[]` | required | `id`, `title`, `version?`, `date?`, `dateTime?`, `message?`, `features?`. The caller's order is the order shown (newest first) |
| `title` | `string` | `System Changelog` | The page's title |
| `loading` | `boolean` | — | Three placeholder cards; one status says "Loading changelog" |
| `empty` | `ReactNode` | `EmptyState` "No releases yet." | |

## Layout

A centred column, 896 wide at most, with 24 between cards. The title is `heading-lg-bold`.

## Accessibility

- A `section` named by the title (an `h2`); each card is an `article` with an `h3`.
- Loading: `aria-busy` and one `status`; the skeletons are hidden from assistive tech.

## Don't

- **Don't sort or format inside it.** Pass the order, the versions and the dates as they should read.
