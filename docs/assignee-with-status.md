# AssigneeWithStatus

An assignee's avatar with their availability dot on its bottom-right corner, and a tooltip that
says it in words. Built to Figma's `_Assignee_with_Status_Dev` (`6486:77499`) and the `Show
Tooltip` base.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `AssigneeStatus` | atom |
| `Tooltip` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AssigneeWithStatus` | The Assignee column of the Planning table; anywhere an assignee's availability is a glance, not a decision |
| `AssigneeSelectionDropdown` | Choosing an assignee, with availability on every row |
| `Avatar` | A person with no availability to show |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | required | |
| `status` | `available \| busy \| unavailable` | required | |
| `role` | `string` | `Assignee` | The role in the sentence |
| `src` | `string` | — | Photo; initials without |
| `size` | Avatar's | `md` | |
| `tooltip` | `boolean` | `true` | Off where the name is already beside it |

## Accessibility

- The tooltip reads "John Doe (Assignee, Busy)", and **the same sentence names the avatar** (`role="img"`),
  so a screen reader hears what a pointer user sees, without hovering. It hears it **once**: the
  tooltip is drawn with `describe={false}`, so it does not add the same sentence again as a
  description.
- With a tooltip the avatar is a tab stop, so keyboard users get the sentence on focus.
- The dot is `aria-hidden` here: the sentence carries the status.

## Don't

- **Don't show the dot without the sentence available** — colour alone.
