# NewComment

The top of a comment list: the "Comments" title with the sort switch, and under it
the box a person writes a new comment in, with their avatar beside it and the Add
Comment button below. A pattern.

Read off the Figma `New_Comment` (`2877:6757`, Comment Section page).

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `CommentFormActions` | component |
| `CommentSortChip` | component |
| `MentionInput` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `NewComment` | Writing a new, top-level comment on an Added Value |
| `MentionInput` + `CommentFormActions` | A reply or an edit, where there is no avatar or title: the box and its Reply or Save and Cancel |
| `Textarea` | Any other multi-line text, with no mentions |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `user` | `{ name, src? }` | required | Who is writing. Drives the avatar's initials, or a photo with `src` |
| `members` | `{ id, name }[]` | required | Who can be mentioned |
| `title` | `string` | `Comments` | |
| `headingLevel` | `2 \| 3 \| 4` | `2` | The title is a real heading, and names the section |
| `sort` / `onSortChange` | `newest \| oldest` / `(sort) => void` | — | Giving either draws the sort chip |
| `value` / `onChange` | `MentionSegment[]` | — | Controlled content. The change is segments, as `MentionInput` |
| `defaultValue` | `MentionSegment[]` | `[]` | Starting content when uncontrolled |
| `onSubmit` | `(value) => void` | — | Add Comment, or Ctrl or Cmd + Enter. Gets the segments |
| `loading` | `boolean` | `false` | The send is in flight: a spinner, and no second click |
| `placeholder` | `string` | `Type @ to mention and notify a member` | |
| `inputLabel` | `string` | `Add a comment` | The box's accessible name |
| `className`, `ref`, rest | | | On the `<section>` |

`mentionedIds(value)` is who to notify and `plainText(value)` the words (both from
`MentionInput`).

**It clears after a send unless you control the value.** Uncontrolled, the box empties
as `onSubmit` returns. Controlled, what happens is yours, so you can keep the text if
the send fails.

**Add Comment is dim while the box is empty**, as the design's Reply is. Figma draws it
live at rest; a button that sends nothing is worse than a dim one. A box with only a
mention in it is not empty.

## Tokens

Nothing of its own: every part is a piece of the system.

| Part | Is |
|---|---|
| Column, row | `gap-4` (16), as the frame; the title row is 32 tall (`min-h-8`) |
| Title | `type.body-md-regular`, 16 / 24 in `text.tertiary` |
| Avatar | `Avatar` `md` (32), with `border-stroke-default` and `text-text-tertiary`, as Figma's `Profile_Initials` |
| Box | `MentionInput`: min 100 tall, 16 padding, `radius.sm`, 14 regular |
| Button | `CommentFormActions`: the small primary `Button`, 36 tall |

Two differences from the Figma frame, both settled elsewhere in the system:
- **The box's border is `stroke.strong`**, as every form control's is (`MentionInput`,
  `Input`), where the frame draws `stroke.subtle` with a faint shadow: the subtle border is
  under the 3:1 a control boundary needs. See `docs/mention-input.md`.
- **The avatar's initials come from the name** (two letters, "JD"), where the frame draws
  a single "J". Pass nothing else, and every avatar reads the same; if the comments are to
  show one letter, that is a decision for `Avatar`, not for this pattern.

## Accessibility

- The section is named by its title, a real heading (`h2` by default), so a screen
  reader can jump to the comments. If a page has two comment lists, give each its own
  `title`: two landmarks with the same name are a violation.
- The box is a `textbox` named "Add a comment"; Enter makes a line break and
  Ctrl or Cmd + Enter sends. The `@` list is `MentionInput`'s, a combobox listbox.
- The avatar is decoration: the person's name is not otherwise on screen, but
  nothing here needs it announced.
- The sort chip names the current order ("Sort comments: Newest First").
- Focus rings come from the pieces; nothing here removes them.

## Don't

- **Don't clear the box yourself on a send you control and then fail it.** Keep the value
  until the send succeeds, and use `loading` while it runs.
- **Don't put two of these on one page without different `title`s.**
- **Don't use it for a reply.** A reply has no avatar or title; use the box and its buttons.
