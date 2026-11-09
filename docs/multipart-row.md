# MultipartRow *(component)*

One part of a multipart Added Value: its number, title, assignee, capacity points, due date and status. Built to Figma's
`Multipart_Section` rows.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Badge` | atom |
| `IconButton` | atom |
| `DueDateTag` | component |
| `StatusTag` | component |
| `TruncatedText` | component |
| `Tooltip` | atom |

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
| `dueDate` | `string` | — | **ISO**, "2025-10-01": shown dd/mm/yyyy (or the person's locale, `useDateFormat`). None reads "-" |
| `dueProximity` | `default \| due-soon \| overdue` | `default` | `DueDateTag`'s |
| `status` / `customStatus` | `AVStatus` / `string` | — | A spine status, or a domain step's own words ("Ready for Deploy"). `StatusTag` owns the colour |
| `completed` | `boolean` | `status === 'Completed'` | Turns the number green |
| `onOpen` | `() => void` | — | The title was pressed. It **asks**: the page opens the part |
| `onEditTitle` | `() => void` | — | The edit button after the title was pressed. It **asks**: the page opens `ChildPartModal` (`edit`). Left out, there is no button |

## The edit button

Hovering a row shows a 24 tonal pencil button 4 after the title (Figma's 2, plus 2 so the text never touches the disc) (Figma's `_Edit_Child_Part_Title_IconButton`; hover and pressed are the tonal `IconButton`'s). **It is also shown
while anything in the row has *keyboard* focus (`:focus-visible` — a mouse click does not hold it open once the pointer leaves), and always on a touch screen (`pointer-coarse`)**, where there is no hover. **It takes no room while hidden**: the title runs to the end of its cell and is cut there, and when the button shows the title gives way (a 24 button and a 4 gap). It is in the page the whole time, so a
keyboard user tabs to it; it is named "Edit title of part 2".

## Layout — rows share one grid

A row is a **subgrid** of its `MultipartRowGroup` (the list; `MultipartSection` uses it). The columns are: number, title, avatar, points,
"Due Date:", date, a rule, status. **Each column is as wide as its widest cell across all the rows**, so the points and the dates start in straight
columns whatever their content, and the status tags are **right-aligned** in a column only as wide as the widest tag (as Figma draws them). The title
takes the spare room (at least 7.5rem, Figma's 120) and is cut with "…".

**Under 48rem wide (the group's own width, not the viewport's) the rows stack**: the number and title on top, the avatar, points, due date and
status beneath, left-aligned, with no rule. A row must be inside a `MultipartRowGroup`: `<MultipartRowGroup><MultipartRow … /></MultipartRowGroup>`.

## Tokens

Measured off Figma's `Multipart_Section`. The row is `surface.elevated` with a `stroke.default` border, `radius.sm`, 16 across and 12 up and down (a 32 avatar,
so 58 high); rows are 12 apart; hover `surface.brand.base`. The number is a 24 disc, `caption-md-semibold`: `neutral.tonal` (`surface.default` /
`content.default`), or `accent.success.filled` when done. The title is `body-sm-medium` `text.primary`, 8 from the number. The points are a large `Badge` (32 high,
`label-sm-medium`); "Due Date:" is `label-sm-medium` `text.tertiary` beside a 28-high `DueDateTag`; the rule is 1 wide, the row's height; the status is a
28-high `StatusTag`. All of it is 16 apart.

## Accessibility

- The title's name carries the part: "Part 2: Some title". The number disc is decoration.
- The assignee is named for a screen reader; the status is words, never colour alone.

## Don't

- **Don't pre-format the date.** Pass the ISO date; the row shows it the system's way.
- **Don't pick a status colour at the call site.** `StatusTag` owns it.
