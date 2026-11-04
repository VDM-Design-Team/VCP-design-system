# MultipartRow *(component)*

One part of a multipart Added Value: its number, title, assignee, capacity points, due date and status. Built to Figma's
`Multipart_Section` rows.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Badge` | atom |
| `DueDateTag` | component |
| `StatusTag` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MultipartRow` | A part of a multipart AV, inside a `MultipartRowGroup` |
| `MultipartSection` | The whole card of them, with progress |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `number` | `number` | required | The part's place: 1, 2, 3. A grey disc; **green when the part is completed** |
| `title` | `string` | required | Cut with "…" when long. The button that opens the part, when `onOpen` is given |
| `assignee` | `{ name, src? }` | — | Their avatar. Without one the place stays empty |
| `capacityPoints` | `number \| null` | — | "10 CP"; none reads "- CP" |
| `dueDate` | `string` | — | **Already formatted**: "October 1, 2025". None reads "-" |
| `dueProximity` | `default \| due-soon \| overdue` | `default` | `DueDateTag`'s |
| `status` / `customStatus` | `AVStatus` / `string` | — | A spine status, or a domain step's own words ("Ready for Deploy"). `StatusTag` owns the colour |
| `completed` | `boolean` | `status === 'Completed'` | Turns the number green |
| `onOpen` | `() => void` | — | The title was pressed. It **asks**: the page opens the part |

## Layout — rows share one grid

A row is a **subgrid** of its `MultipartRowGroup` (the list; `MultipartSection` uses it). The columns are: number, title, avatar, points,
"Due Date:", date, a rule, status. **Each column is as wide as its widest cell across all the rows**, so the points, the dates and the status
tags start in straight columns whatever their content, and the status column is only as wide as the widest tag. The title takes the spare room
(at least 16rem) and is cut with "…".

**Under 56rem wide (the group's own width, not the viewport's) the rows stack**: the number and title on top, the avatar, points, due date and
status beneath, left-aligned, with no rule. A row must be inside a `MultipartRowGroup`: `<MultipartRowGroup><MultipartRow … /></MultipartRowGroup>`.

## Tokens

`surface.elevated`, `stroke.default` border, `radius.sm`; hover `surface.brand.base`. The number (32): `surface.neutral.subtle` on `text.secondary`, or
`accent.success.filled` when done. Title `body-md-semibold` `text.primary`; "Due Date:" `body-sm-regular` `text.tertiary`.

## Accessibility

- The title's name carries the part: "Part 2: Some title". The number disc is decoration.
- The assignee is named for a screen reader; the status is words, never colour alone.

## Don't

- **Don't format the date here.** Pass "October 1, 2025".
- **Don't pick a status colour at the call site.** `StatusTag` owns it.
