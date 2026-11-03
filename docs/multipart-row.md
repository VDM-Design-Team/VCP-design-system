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
| `MultipartRow` | A part of a multipart AV, in a list of parts |
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

## Layout

Number, title (takes the spare room), avatar, points, "Due Date:" and the date, a rule, then the status in a cell of **fixed width, right-aligned**,
so the columns line up from row to row. A floor width (`min-w-160`) keeps it from crushing; the section scrolls sideways below it.

## Tokens

`surface.elevated`, `stroke.default` border, `radius.sm`; hover `surface.brand.base`. The number: `surface.neutral.subtle` on `text.secondary`, or
`accent.success.filled` when done. Title `body-sm-medium` `text.primary`; "Due Date:" `body-sm-regular` `text.tertiary`.

## Accessibility

- The title's name carries the part: "Part 2: Some title". The number disc is decoration.
- The assignee is named for a screen reader; the status is words, never colour alone.

## Don't

- **Don't format the date here.** Pass "October 1, 2025".
- **Don't pick a status colour at the call site.** `StatusTag` owns it.
