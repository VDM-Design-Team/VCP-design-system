# AssigneeSelectionDropdown

Picking an assignee when availability matters. Built to Figma's `Dev_Assignee_Selection_Dropdown`
(`6515:65065`) and the Assignee Availability flow, on `SearchSelect`.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `AssigneeStatus` | atom |
| `Icon` | atom |
| `Tag` | atom |
| `SearchSelect` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AssigneeSelectionDropdown` | Assigning a person to work that has dates |
| `SearchSelect` `rows="avatar"` | Picking a person where availability is not a concern |
| `AssigneeWithStatus` | Showing one assignee's availability, not choosing |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `people` | `{ value, label, src?, availability, until? }[]` | required | `availability` is `available \| busy \| unavailable`; `until` is the pill's text ("May 17") |
| `availabilityKnown` | `boolean` | `true` | `false`: the unknown state — a notice and a plain list |
| `unknownText` / `busyText` / `unavailableText` | `string` | the design's copy | |
| `searchable` | `boolean` | `false` | The design has no search box (a team's list, not a directory). Turn it on for a longer one |
| `value`, `onChange`, `placeholder`, … | | | `SearchSelect`'s single-pick props |

## The states

| State | What you see |
|---|---|
| **Known — default view** | Available and Busy open, Unavailable folded. Each heading has its dot. Busy and Unavailable rows carry a date pill |
| **All collapsed / all expanded** | The user's folds. A folded group's rows leave the list and the arrow keys |
| **Unknown** | "Assignee availability is unknown. Select a start date or cycle first to view availability." over a plain list; anyone can be picked |
| **Picked, busy** | Amber border and "This assignee is busy during the selected dates, but can still be assigned." |
| **Picked, unavailable** | Red border and "This assignee is not available during the selected dates and cannot be assigned." |

**Unavailable people cannot be picked** — their rows are greyed, `aria-disabled`, and the keyboard
skips them. The last two states happen when the dates change *after* a pick; the form's submit
guard for them (the Figma flow's "Unavailable Assignee" toast) is the page's.

## Accessibility

Everything `SearchSelect` provides (see docs/search-select.md), plus: group headings are buttons
with `aria-expanded`; the dot is decorative beside its heading's text; the status is never colour
alone.

## Don't

- **Don't treat the unknown state as "all available".** The list is plain *because* nothing is known.
- **Don't recompute availability here.** The caller passes each person's status for the dates.
