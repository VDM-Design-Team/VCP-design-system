# AnnouncementsPanel *(pattern)*

The Announcements tab of Settings: the overview (the total, the latest version, the last update), the list, and the dialogs behind it: create, edit and delete. It goes in
`SettingsPage`'s `announcements` panel.

Built to Figma's `Announcements` tab (`Announcement Tab` in the Admin Settings page) and its `Create Announcement` dialog.

## Composed of

| Piece | Tier |
|---|---|
| `AnnouncementModal` | pattern |
| `AnnouncementsOverview` | pattern |
| `AnnouncementsTable` | pattern |
| `ConfirmDeleteModal` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AnnouncementsPanel` | The Announcements tab: the overview, the list, and create / edit / delete |
| `AnnouncementsTable` on its own | The list inside something else, or a read-only list (the table always draws its buttons) |
| `SystemChangelog` | The System Changelog page that **View Changelog** goes to |

## The page passes the announcements; this runs the dialogs

```tsx
<AnnouncementsPanel
  announcements={announcements}
  overview={{ total: 11, latestVersion: 'v1.18.1', lastUpdated: '2026-05-20' }}
  onCreate={(draft) => api.create(draft)}
  onUpdate={(announcement, draft) => api.update(announcement.id, draft)}
  onDelete={(announcement) => api.remove(announcement.id)}
  onViewChangelog={() => navigate('/settings/changelog')}
  onRefresh={reload}
/>
```

| Press | What happens |
|---|---|
| **New Announcement** | Opens "Create Announcement" (`AnnouncementModal`) |
| A row's **Edit** | Opens "Edit Announcement", filled from that announcement |
| A row's **Delete** | Opens "Are you sure you want to delete this announcement?" (`ConfirmDeleteModal`, with its title). **Nothing is deleted until it is confirmed** |
| **View Changelog** | Calls `onViewChangelog`: going to the System Changelog is the page's |
| **Refresh** | Calls `onRefresh`: reloading is the page's. Set `refreshing` while it loads |

It is **controlled**: `announcements` is the truth, and the callbacks only *ask*. **All five are required**: the table always draws its buttons and its row menu, so a panel without them would show controls
that do nothing.

## A request may take time, and fail

A callback may return a promise. The dialog's button spins until it settles; the dialog **closes when it succeeds** and **stays open when it rejects**, so the page can say why (`errors` for the form's fields, a toast for the
rest) and the person can try again. A callback that returns nothing closes the dialog at once. While a request is out, the dialog cannot be closed. **The toast on success ("Announcement deleted") is the page's**: this holds none.

## Focus is never dropped

A closed dialog gives focus back to what opened it. A deleted row takes its menu button with it, so after a delete focus goes (the table's own rule):

| What is left | Focus goes to |
|---|---|
| A row after the deleted one | That row's menu button |
| It was the last row | The previous row's menu button |
| The list is empty | **New Announcement** |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `announcements` | `Announcement[]` | required | Whole records: Edit starts the form from them |
| `overview` | `AnnouncementsOverviewProps` | required | `total`, `latestVersion`, `lastUpdated`: the page's, since a list may be paged |
| `onCreate` | `(draft) => void \| Promise` | required | The create form was submitted |
| `onUpdate` | `(announcement, draft) => void \| Promise` | required | The edit form was submitted |
| `onDelete` | `(announcement) => void \| Promise` | required | A deletion was confirmed |
| `onViewChangelog` / `onRefresh` | `() => void` | required | |
| `loading` / `refreshing` / `empty` / `caption` | | | `AnnouncementsTable`'s |
| `errors` | `AnnouncementModalProps['errors']` | — | What the server said was wrong with the form, by field |

## Accessibility

- Each dialog keeps its own: the create and edit form is a labelled `dialog`; the delete question is an `alertdialog` with no ✕, and a backdrop click does nothing, so a stray click cannot delete anything.
- Focus returns as above; no press ever leaves it on `body`.
- The list and the overview keep their own names and keyboard behaviour.

## Don't

- Don't open the dialogs yourself: they are this pattern's. If you need one elsewhere, use `AnnouncementModal` directly.
- Don't pass a half-wired panel: leaving a callback out leaves a button that does nothing.
- Don't put the toast in the callbacks' failure path without also letting the promise reject, or the dialog will close on an error.
