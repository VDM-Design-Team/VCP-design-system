# CommentComposer

The box a comment is written in: an optional avatar, the mention field, and the send button
(with Cancel, when there is a way out) underneath. A component.

Read off the Figma `New_Comment`'s writing half (`2877:6757`). The same piece is the **reply box**
and the **edit box** under a comment: those are this without the avatar and with a Cancel, so there is
one box to learn, not three.

> Writing a comment list? Use [`CommentSection`](comment-section.md), which places this for you.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `CommentFormActions` | component |
| `MentionInput` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CommentComposer` | A new comment (`user` given), a reply (`variant="reply"`, `onCancel`), an edit (`defaultValue`, `variant="save"`, `onCancel`) |
| [`CommentSection`](comment-section.md) | A whole comment list |
| `MentionInput` | Just the field, with no send button |
| `Textarea` | Multi-line text with no mentions |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `user` | `{ name, src? }` | — | Draws their avatar beside the box. Leave it off for a reply or edit box |
| `members` | `{ id, name }[]` | required | Who can be mentioned |
| `value` / `onChange` | `MentionSegment[]` | — | Controlled content |
| `defaultValue` | `MentionSegment[]` | `[]` | Starting content when uncontrolled: an edit box starts with the comment |
| `onSubmit` | `(value) => void \| Promise<void>` | — | The button, or Ctrl or Cmd + Enter. May return a promise |
| `onCancel` | `() => void` | — | Fires when Cancel is clicked. Give it for `reply` and `save`, which draw a Cancel; a new comment has none |
| `loading` | `boolean` | `false` | A send you are tracking yourself. A promise from `onSubmit` is tracked for you |
| `placeholder` | `string` | `Type @ to mention and notify a member` | |
| `inputLabel` | `string` | `Add a comment` | The box's accessible name. Say what it is for: "Reply to John Smith" |
| `variant` | `'comment' \| 'reply' \| 'save'` | `comment` | Which box it is. It fixes the send button's words ("Add Comment", "Reply", "Save") and whether there is a Cancel. The words are not props |
| `autoFocus` | `boolean` | `false` | A reply or edit box wants it |
| `className`, `ref`, rest | | | On the root |

**The send button is dim while there is nothing to send**, as the design's Reply is; a box with only
a mention in it is not empty. Ctrl or Cmd + Enter sends; Enter makes a line break.

**`onSubmit` may be async, and the box is honest about it.** Return a promise and the button shows its
spinner until it settles. The box clears when it resolves and **keeps what was typed if it rejects**:
report the error in your handler, since the box only promises not to lose the text. Return nothing and it
clears at once. Control `value` yourself and none of this applies.

## Tokens

Nothing of its own: a 32 `Avatar` (with `border-stroke-default` and `text-text-tertiary`, the frame's
`Profile_Initials`), 16 across, a column of the field and its buttons 16 apart. See `MentionInput` and
`CommentFormActions`. The field's border is `stroke.strong`, not the frame's `stroke.subtle`.

## Accessibility

- The field is a `textbox` named by `inputLabel`, with the `@` list a combobox listbox (`MentionInput`).
- The avatar is decoration. Focus rings come from the pieces.

## Don't

- **Don't leave `inputLabel` at "Add a comment" for a reply or an edit box.** A screen reader should hear
  which comment it belongs to.
- **Don't clear the box yourself after a send.** Return the promise and it does it when it is safe.
