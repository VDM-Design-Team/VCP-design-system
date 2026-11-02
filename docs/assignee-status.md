# AssigneeStatus

The availability dot: green (available), amber (busy) or red (unavailable). Built to Figma's
`_Assignee_Status_Dev` (`6487:78350`): three statuses at two sizes.

## Composed of

None — an atom, a single self-contained element.

## When to use

| Use | For |
|---|---|
| `AssigneeStatus` | A status dot beside text that says the same thing — a group heading |
| `AssigneeWithStatus` | The dot on an avatar's corner, with a tooltip — the Planning table's assignee |
| A `StatusTag` | Where the status is the content of the cell, not a hint beside a person |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `status` | `available \| busy \| unavailable` | required | |
| `size` | `table \| menu` | `menu` | 10 on an avatar in a table, 12 beside a menu heading |
| `label` | `string` | — | Names the dot (as an image) when nothing beside it says the status. Left out, it is decorative |
| `className`, `ref`, … | | | The `<span>` |

`ASSIGNEE_STATUS_LABEL` exports the words ("Available", "Busy", "Unavailable"), so headings and
tooltips say them one way.

## Tokens

| Status | Token |
|---|---|
| `available` | `accent.success.outline.border` |
| `busy` | `accent.warning.outline.border` |
| `unavailable` | `accent.critical.outline.border` |

## Accessibility

- **Colour is never the only signal.** The dot is `aria-hidden` by default because the words sit
  beside it; `label` makes it an image with a name where it stands alone.
- The dot is a status hint, not a control: no focus, no events.

## Don't

- **Don't use the dot alone in a table cell** — a colour-blind user gets nothing. Put the sentence
  in a tooltip (`AssigneeWithStatus`) or beside it.
- **Don't re-map statuses to colours at the call site** — the mapping lives here.
