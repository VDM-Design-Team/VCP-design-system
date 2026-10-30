# UserLabel

A person, named in place: their avatar, their name and, under it, a description.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `UserLabel` | Showing who: a table cell, a card header, a line in a list — avatar, name and an optional description |
| `Chip` (people recipes) | A person that can be pressed, edited or removed (Initiator, Assignee) |
| `Avatar` | Only the face, when the name is already on screen elsewhere |
| `UserMenu` | The signed-in user in the app bar, with their account menu |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | — | What the label says: "John", "Francis M." |
| `description` | `string` | — | The line under the name — "Assignee", "Initiator", "Admin". Left out, the label is avatar and name. Called `description`, as `Chip`'s second line is, and not `role`, which is the ARIA attribute the span's own props carry |
| `fullName` | `string` | `name` | The full name, when `name` is short: it drives the avatar's initials ("John Doe" → "JD") |
| `src` | `string` | — | A photo. Without one the avatar shows initials |
| `size` | `md \| sm` | `md` | Figma's Default and S |
| `className`, `ref`, rest | | | On the root `<span>` |

Figma's component also has Name and Role toggles. The Role line is the optional `description` prop; there is no
name-less variant — avatar alone is `Avatar`.

## Tokens

| Part | `md` (Figma Default) | `sm` (Figma S) |
|---|---|---|
| Avatar | `Avatar md` (32) | `Avatar sm` (24) |
| Gap, avatar to text | 8 (`gap-2`) | 4 (`gap-1`) |
| Name | `body-sm-medium`, `text.primary` | `caption-md-medium`, `text.primary` |
| Role | `caption-md-medium`, `text.tertiary` | `caption-sm-medium`, `text.tertiary` |
| Role position | pulled up directly under the name: 6 (`-mt-1.5`) | 4 (`-mt-1`) |

`text.primary` on `surface.elevated` is 20.17:1 light / 14.63:1 dark; `text.tertiary` is 7.58:1 / 9.85:1. No new tokens.

## Accessibility

- The visible name carries the person, so the avatar beside it is decoration (`aria-hidden`, as `Avatar`
  does when its name is on screen): one announcement, not two. A screen reader reads the name, then the description.
- The name and description truncate with "…" when the label is squeezed; the root is capped at its container's width.

## Differences from the design

- **The description sits closer to the name than Figma's stack.** It is pulled up (6 on `md`, 4 on `sm`) so the two lines touch
  visually, as the Assignee chip's do; `cn()` drops a `leading-none` that sits beside a type class, so a margin does it.
- **The description is an optional prop, and there is no name-less variant.** Figma has Name and Role booleans; hiding
  the name leaves an avatar with a floating description, which is not a use the design draws.
- **Initials come from `fullName`.** Figma shows a photo; where there is none, the avatar draws initials, which
  need the full name when the label shows only a first name.

## Don't

- **Don't use it as a button.** It takes no focus and fires no events; a person you can press or remove is a `Chip`.
- **Don't repeat the name next to it** (an `aria-label` that says it again): the visible text is the name.
