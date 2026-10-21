# CommentComposer *(component)*

Where a comment or a reply is written: the writer's avatar, a `MentionInput`, and the two
buttons under it, "Reply" and "Cancel" (or "Save" and "Cancel" when editing).

Read off Figma's `Notification_Popover_Comment_Reply` (`Replying` and `Editing Reply`) and
the comment section's `New_Comment`.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `MentionInput` | component | The field, with @-mentions |
| `Avatar` | atom | The writer, 24 (`sm`) |
| `Button` | atom | The primary and the outlined button, `sm` |

## When to use

| Use | For |
|---|---|
| `CommentComposer` | Writing a new comment or reply, or editing one (pass `defaultValue` and `submitLabel="Save"`) |
| `CommentCard` | Showing one that is posted |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `user` | `{ name, src? }` | required | Who is writing |
| `members` | `{ id, name }[]` | required | Who can be mentioned |
| `value` / `onChange` | `MentionSegment[]` | — | Controlled |
| `defaultValue` | `MentionSegment[]` | `[]` | Starting content: the reply being edited |
| `submitLabel` | `string` | `Reply` | `Save` when editing |
| `onSubmit` | `(value, mentionedIds) => void` | required | Sent. The ids are who to notify |
| `onCancel` | `() => void` | required | Cancel, and Escape |
| `cancelLabel`, `fieldLabel`, `placeholder`, `autoFocus` | | | |

## Behaviour

The primary button is disabled until there is text. **Ctrl or Cmd + Enter** sends.
**Escape** cancels, but a member list that is open takes the first Escape and closes.

## Tokens

The field is `MentionInput`'s. The buttons are `Button` `sm` (36 tall), primary and
`secondary`, 8 apart and 12 below the field; the avatar 8 to the left. No new tokens.

## Accessibility

- The field is named "Write a reply" (change it with `fieldLabel`); it has no visible label.
- The disabled primary button is a real `disabled` button, so it is skipped by Tab and
  announced as unavailable.
- Focus does not move for you. Pass `autoFocus` when the composer opens in answer to a click
  on "Reply" or "Edit", so the user can type at once.

## Don't

- **Don't leave out `onCancel`.** A composer you cannot leave is a trap.
- **Don't store the field's HTML.** Store the segments, or the text and the ids.
