# AnnouncementsTable *(pattern)*

The Announcements tab's list: **New Announcement**, **View Changelog** and **Refresh** above, and each announcement's version, title,
type, date and features, with **Edit** and **Delete** in a menu on every row. Built to Figma's `Actions` row and `Announcement Table`.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `IconButton` | atom |
| `Skeleton` | atom |
| `Tag` | atom |
| `DataTable` | component |
| `EmptyState` | component |
| `Menu` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AnnouncementsTable` | The Announcements tab's list |
| `AnnouncementsOverview` | The title card and three facts above it |
| `ConfirmDeleteModal` | What **Delete** should open first |
| `DataTable` | Any other table |

## The columns

| Column | What it is |
|---|---|
| **Version** | Plain text, "v1.18.1". Only Type is a tag, so a Feature row no longer has two identical blue tags |
| **Title** | The title; it gives way as the table narrows, ending in "…" |
| **Type** | A `Tag`: the kind's word (Experimental, Update, Feature) and tone (success, warning, info) from the one owner, `lib/changelog-kinds`. **This table maps nothing itself** |
| **Date** | ISO, shown dd/mm/yyyy or the person's locale (`useDateFormat`), in a `<time>` |
| **Features** | What shipped, joined with commas, cut with "…" |
| **Actions** | A "More actions" menu named for the row ("Actions for Faster search"): **Edit**, **Delete** — no icons. Delete is a `danger` item (red) with `icon: false`, so `Menu` leaves out its fallback warning glyph; the word and the hidden "destructive action" still say it, and the confirmation dialog guards it |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `AnnouncementRow[]` | required | An `Announcement` (`lib/announcement`): `id`, `title`, `version`, `kind`, `date` (ISO), `features` |
| `onNew` / `onViewChangelog` / `onRefresh` | `() => void` | — | The buttons above. They **ask** |
| `onEdit` / `onDelete` | `(row) => void` | — | From a row's menu. They **ask** |
| `loading` | `boolean` | — | Placeholder rows; buttons and headers stay; one status says "Loading announcements" |
| `empty` | `ReactNode` | `EmptyState` "No announcements yet." | |
| `caption` | `string` | `Announcements` | The table's accessible name |

## It is controlled, and does nothing itself

| Press | What the page does |
|---|---|
| **New Announcement** | Opens the Create Announcement dialog |
| **Edit** | Opens it filled |
| **Delete** | Opens `ConfirmDeleteModal` first — **nothing is deleted until it is confirmed** — then removes the row and shows a toast |
| **View Changelog** | Goes to the System Changelog |
| **Refresh** | Reloads the list |

## Tokens

The page's canvas shows around it: the table has `DataTable`'s own look. The title is `body-sm-medium` `text.tertiary`, the features `text.primary`;
the Type tag is `sm`, tonal. **View Changelog** and **Refresh** are the `neutral` `Button` (grey outline) with a clock and a
refresh glyph; **New Announcement** is primary with a plus. The ellipsis is the plain `IconButton`.

**Differences from Figma, on purpose.** Figma's label reads "New Announcements"; it is **New Announcement**. Figma draws no pagination, so there is none.

## Accessibility

- A real `<table>` named by `caption`.
- Every row's menu is named for its announcement, so a screen reader never meets six "More actions". The menu is `Menu`'s: arrow keys, Escape,
  focus returns to its button.
- Loading: `aria-busy` and one `status`; the skeletons are hidden from assistive tech.

## Don't

- **Don't delete on press.** `onDelete` asks; confirm first, then delete, then say so with a toast.
- **Don't format the date.** Pass the ISO date ("2026-05-20"); the table shows it the system's way.
- **Don't pick the type colour at the call site.** The mapping lives in `lib/changelog-kinds`.
