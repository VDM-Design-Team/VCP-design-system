# TagManagement *(pattern)*

The Admin Panel tab of Settings: the lists an admin keeps (Domains, Global Tags, Domain Tags, Roles, Status, Assignee Types, Projects) as a grid of
cards, and the dialogs behind them. Built to Figma's `Tag_Management` (`921:126353`, Pages & Flows) and its three states: Add New Tag, Add New Domain
and Delete Domain.

## Composed of

| Piece | Tier |
|---|---|
| `ConfirmDeleteModal` | pattern |
| `DomainCard` | pattern |
| `TagManagementModal` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `TagManagement` | The Admin Panel tab: all the lists, with their dialogs |
| `DomainCard` | One list on its own, with your own dialogs |
| `TagManagementModal` | One of the dialogs, opened from somewhere else |

## The page passes the lists

```tsx
<TagManagement
  lists={[
    { id: 'domains', title: 'Domains', kind: 'domain', items: domains },
    { id: 'global-tags', title: 'Global Tags', items: globalTags },
  ]}
  onAdd={(list, name) => api.add(list.id, name)}
  onRename={(list, item, name) => api.rename(list.id, item.id, name)}
  onDelete={(list, item) => api.remove(list.id, item.id)}
  onReorder={(list, ids) => api.reorder(list.id, ids)}
/>
```

**Which lists a person sees is the page's choice.** Super Admin has Domains and Global Tags; Design Admin has the other five. Pass only those.

It is **controlled**: `lists` is the truth, and the four callbacks only ask. Leave a callback out and its control goes: no `onAdd`, no **Add New**; no `onRename`,
no pencil; no `onDelete`, no bin.

## What it does

| Press | Dialog |
|---|---|
| **Add New** on a tag list | "Add a new Tag": one Tag Name field, Submit |
| **Add New** on a `kind: 'domain'` list | "Add a new Domain" |
| A row's pencil | The same form, "Rename Tag", starting as the current name, Save |
| A tag's bin | "Are you sure you want to delete this tag?" (`ConfirmDeleteModal`, with the tag's name) |
| A domain's bin | "Are you sure you want to delete this domain?" (`TagManagementModal`) |

Draggable rows (Status) reorder as in `DomainCard`: by pointer, or Space, arrow keys, Space on the grip. `onReorder` gets the whole new order of that list.

## A request may take time, and fail

A callback may return a promise. The dialog's button spins until it settles; the dialog **closes when it succeeds** and **stays open when it rejects**, so the
page can say why (a toast, say) and the person can try again. A callback that returns nothing closes the dialog at once. While a request is out, the dialog
cannot be closed.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `lists` | `TagManagementList[]` | required | `{ id, title, items, kind?, addLabel? }`; `kind` is `tag` (default) or `domain` |
| `onAdd` | `(list, name) => void \| Promise` | — | A name was submitted. Leave out: no Add New |
| `onRename` | `(list, item, name) => void \| Promise` | — | A new name was saved. Leave out: no pencils |
| `onDelete` | `(list, item) => void \| Promise` | — | A deletion was confirmed. Leave out: no bins |
| `onReorder` | `(list, ids) => void` | — | A list's draggable rows moved |

## Layout

Cards sit in a grid: one column on a phone, two from a card width of 48rem, three from 72rem, 12 apart (Figma: three 420 wide, 12 apart). Cards in a row are
the same height. It responds to its own width, not the screen's, so it fits wherever the tab is placed.

## Differences from Figma, on purpose

- Figma draws only the **domain's** delete question. A tag's bin asks the same question in the system's one delete confirmation, worded for a tag. Figma
  does not draw the **rename** dialog either: it is the add form, reused (see `TagManagementModal`).
- The seven card titles in Figma are placeholders ("Tag"); the names are the ones `DomainCard` documents.

## Accessibility

- Each card is a labelled section named by its heading; every row's buttons name their row ("Edit Bug", "Delete Bug", "Move In Progress").
- **Focus is never dropped.** A closed dialog gives focus back to what opened it. A deleted row takes that with it, so after a delete focus goes to the card's
  **Add New**.
- Both delete questions are alert dialogs with no ✕, and a backdrop click does nothing, so a stray click cannot delete anything.

## Don't

- Don't pass lists a person may not manage: leaving a list out is how you hide it, not a prop.
- Don't open the dialogs yourself; they are this pattern's. If you need one elsewhere, use `TagManagementModal` directly.
- Don't use a domain's delete question for a tag (its wording says "domain"): give the list its `kind`.
