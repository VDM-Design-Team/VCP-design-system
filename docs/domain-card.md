# DomainCard

One list in Tag Management: a titled card, an "Add New" button and a column of
`DomainItem` rows. Built to Figma's `Domain_Card` (`7464:93369`) on
`_Domain_Card_Base`.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `DomainItem` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DomainCard` | An admin list: Domains, Global Tags, Domain Tags, Roles, Status, Assignee Types, Projects |
| `DataTable` | Many columns, sorting, filtering |
| `TagManagementModal` | The add and delete dialogs the card's buttons open |

The seven cards in the design are one component. Which a user sees (Super Admin:
Domains and Global Tags; Design Admin: the rest) is the page's decision.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | required | The card's `<h2>`; also its accessible name |
| `items` | `{ id, label, variant? }[]` | required | You own it. `variant` is `DomainItem`'s |
| `onAdd` | `() => void` | — | Draws "Add New". Omit it and there is no button |
| `addLabel` | `string` | `Add New` | |
| `onEdit` / `onDelete` | `(item) => void` | — | Draw the pencil / bin on editable rows |
| `onReorder` | `(ids: string[]) => void` | — | The whole new order. The card never reorders itself |

## Reordering

Only `draggable` rows move, and only among themselves: a locked row never moves and a
draggable row never passes one (in Status, "In Progress" and "Design Review" swap; neither
crosses "Review").

- **Keyboard / assistive tech:** focus a row's grip, ↑ / ↓. Focus stays on the grip, and a
  polite live region announces "In Progress moved to position 2 of 2".
- **Pointer:** drag a draggable row onto another.

## Accessibility

- A `<section>` named by its heading; the rows are a `list`.
- Tab order: Add New, then each row's grip (if any), edit, delete.
- Nothing is announced by colour alone: a locked row says "Default".

## Don't

- **Don't put per-role logic in the card.** It has no `role` prop.
- **Don't reorder inside `onReorder` and also mutate `items`** — pass the new array back.
