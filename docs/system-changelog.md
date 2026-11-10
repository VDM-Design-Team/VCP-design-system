# SystemChangelog *(pattern)*

The page that lists every release: a "System Changelog" title over one `ChangelogItem` card per release. Built to Figma's
`Admin System Changelog` (`Settings_Changelog_List`).

## Composed of

| Piece | Tier |
|---|---|
| `ChangelogItem` | atom |
| `Icon` | atom |
| `Pagination` | atom |
| `Skeleton` | atom |
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
| `releases` | `ChangelogRelease[]` | required | `id`, `title`, `kind?`, `href?`, `version?`, `date?` (ISO), `message?`, `features?`. The caller's order is the order shown (newest first). When paged, the releases of the page that is showing |
| `page` / `pageCount` | `number` | — | Shows `Pagination` under the cards when there is more than one page |
| `onPageChange` | `(page: number) => void` | — | A page was picked. Fetching it is the caller's |
| `itemCount` / `pageSize` / `pageSizeOptions` / `onPageSizeChange` | as `Pagination` | — | The range readout ("1-10 of 42") and the Items select, as on the tables |
| `title` | `string` | `System Changelog` | The page's title |
| `loading` | `boolean` | — | Three placeholder cards; one status says "Loading changelog" |
| `empty` | `ReactNode` | `EmptyState` "No releases yet." | |

## Kinds and links

A release's `kind` draws its glyph before the title, and its `href` makes the title a link to the changelog document (the URL the announcement
dialog collects), opening in a new tab. Both are `ChangelogItem`'s; the kinds are owned by `src/lib/changelog-kinds.ts`.

## Many releases

Paged with the existing `Pagination`, under the cards, and controlled like the tables: pass `page`, `pageCount` and `onPageChange`, and the releases
of the page that is showing. With one page (or no `page`) there is no pagination. It is hidden while loading and when there are no releases.

## Layout

A centred column, 896 wide at most, with 24 between cards. The title is `heading-lg-bold`.

## Accessibility

- A `section` named by the title (an `h2`); each card is an `article` with an `h3`.
- Loading: `aria-busy` and one `status`; the skeletons are hidden from assistive tech.
- Paging is `Pagination`'s `nav` ("Pagination"), with the current page marked. The page buttons stay where they are, so focus is kept when the page changes.

## Don't

- **Don't sort inside it.** Pass the order and the versions as they should read, and the dates as ISO (it shows them dd/mm/yyyy, or the person's locale).
