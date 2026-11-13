# DomainPage *(pattern)*

The main content of the Super Admin's Domain page: the title, then the lists the Super Admin keeps (Domains and Global Tags) as cards, with the dialogs behind them. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's `Domain Page` in Pages & Flows (the page, Add New Tag, Add New Domain and Delete Domain).

## Composed of

| Piece | Tier |
|---|---|
| `PageTitle` | component |
| `TagManagement` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DomainPage` | The whole page: **`<AppShell><DomainPage management={{ lists, onAdd, … }} /></AppShell>`** |
| `TagManagement` on its own | The same lists inside something else: the Admin Panel tab of Settings (`SettingsPage`) |

## What it lays out

The title (the page's one `h1`; Figma's frames say the placeholder "Page Title", and the sidebar calls the page "Domains"), then the cards, in a column **32 in from the sides** (`px-8 pb-8`), as `AVListPage` lays it out. The grid of cards, the dialogs for Add New, rename and delete, and the focus after a delete are `TagManagement`'s: see `docs/tag-management.md`.

## It is controlled and holds no data

The app owns the lists and changes them when `TagManagement` asks (`onAdd`, `onRename`, `onDelete`, `onReorder`). **Which lists show is the app's choice:** a Super Admin has Domains and Global Tags; a Design Admin has the other five, on the Admin Panel tab of Settings, not here.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `Domains` | The `h1` |
| `management` | `TagManagementProps` | required | `TagManagement`'s own props: `lists` and the callbacks |
| `className`, rest | | | On the wrapping `div` |

## Accessibility

The title is the page's one `h1`. Everything else is `TagManagement`'s own: labelled sections, named row buttons, focus handed back, and alert dialogs for deleting.

## Don't

- **Don't lay the page out again in the app.** Pass `management`; the title and the spacing are here.
- **Don't add a second `h1`.**
- **Don't pass lists a Super Admin may not manage.** Leaving a list out is how you hide it.
