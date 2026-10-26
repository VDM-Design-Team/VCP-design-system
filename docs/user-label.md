# UserLabel

A person, named in place: their avatar, their name and, under it, their role.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `UserLabel` | Showing who: a table cell, a card header, a line in a list — avatar, name and an optional role |
| `Chip` (people recipes) | A person that can be pressed, edited or removed (Initiator, Assignee) |
| `Avatar` | Only the face, when the name is already on screen elsewhere |
| `UserMenu` | The signed-in user in the app bar, with their account menu |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | — | What the label says: "John", "Francis M." |
| `role` | `string` | — | The line under the name — "Assignee", "Initiator", "Admin". Left out, the label is avatar and name |
| `fullName` | `string` | `name` | The full name, when `name` is short: it drives the avatar's initials ("John Doe" → "JD") |
| `src` | `string` | — | A photo. Without one the avatar shows initials |
| `size` | `md \| sm` | `md` | Figma's Default and S |
| `className`, `ref`, rest | | | On the root `<span>` |

Figma's component also has Name and Role toggles. The role is the optional `role` prop; there is no
name-less variant — avatar alone is `Avatar`.

## Tokens

| Part | `md` (Figma Default) | `sm` (Figma S) |
|---|---|---|
| Avatar | `Avatar md` (32) | `Avatar sm` (24) |
| Gap, avatar to text | 8 (`gap-2`) | 4 (`gap-1`) |
| Name | `body-sm-medium`, `text.primary` | `caption-md-medium`, `text.primary` |
| Role | `caption-md-medium`, `text.tertiary` | `caption-sm-medium`, `text.tertiary` |
| Role position | 4 up under the name (`-mt-1`), as the design stacks it | same |

`text.primary` on `surface.elevated` is 20.17:1 light / 14.63:1 dark; `text.tertiary` is 7.58:1 / 9.85:1. No new tokens.

## Accessibility

- The visible name carries the person, so the avatar beside it is decoration (`aria-hidden`, as `Avatar`
  does when its name is on screen): one announcement, not two. A screen reader reads the name, then the role.
- The name and role truncate with "…" when the label is squeezed; the root is capped at its container's width.

## Differences from the design

- **The role is an optional prop, and there is no name-less variant.** Figma has Name and Role booleans; hiding
  the name leaves an avatar with a floating role, which is not a use the design draws.
- **Initials come from `fullName`.** Figma shows a photo; where there is none, the avatar draws initials, which
  need the full name when the label shows only a first name.

## Don't

- **Don't use it as a button.** It takes no focus and fires no events; a person you can press or remove is a `Chip`.
- **Don't repeat the name next to it** (an `aria-label` that says it again): the visible text is the name.
