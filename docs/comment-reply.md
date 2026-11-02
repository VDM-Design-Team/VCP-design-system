# CommentReply

One posted comment: who wrote it and when, what it says, the row of things you can do to
it, and, when you are writing back or editing it, the box for that. A component.

Read off the Figma `Comment_Reply` (`2886:6586`, Comment Component section).

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `CommentActions` | component |
| `CommentComposer` | component |
| `MentionInput` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

The reaction buttons in the actions row are an `EmojiReactionPicker`, passed in as the
`reactions` slot. `MentionInput` is here for `MentionTag`, the posted mention.

> Building a comment list? Use [`CommentSection`](comment-section.md): this is one of its parts.

## When to use

| Use | For |
|---|---|
| `CommentReply` | A posted comment or reply, on its own or as a reply inside a thread |
| [`CommentReplyThread`](comment-reply-thread.md) | A comment *with* replies under it |
| [`CommentSection`](comment-section.md) | A whole comment list. **Almost always what you want**: it holds the open threads and the reply and edit boxes for you |
| [`CommentComposer`](comment-composer.md) | The box to write a comment in |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `author` | `{ name, src? }` | required | Drives the avatar's initials, or a photo with `src` |
| `time` / `dateTime` | `string` | required / — | "an hour ago", and the exact time for the `<time>` element |
| `body` | `MentionSegment[]` | required | What `MentionInput` writes; `CommentComposer`'s `onSubmit` hands it over |
| `members` | `{ id, name }[]` | required | Who can be mentioned in the reply and edit boxes |
| `replyCount` / `repliesOpen` / `onToggleReplies` / `repliesId` | | | The "Show / Hide N Replies" toggle, as `CommentActions` |
| `onEdit`, `onDelete` | `() => void` | — | **Only for the author.** No handler, no button |
| `link` / `onCopyLink` | | | What Copy Link copies, as `CommentActions` |
| `reactions` | `ReactNode` | — | An `EmojiReactionPicker` |
| `replying` | `boolean` | `false` | The reply box is open under the actions |
| `onReply` / `onCancelReply` | `() => void` | — | The action button runs one or the other depending on `replying` |
| `onSubmitReply` / `replyLoading` | `(value) => void` / `boolean` | — | Sends the reply with its segments. The box is yours to close |
| `editing` | `boolean` | `false` | The box takes the comment's place, filled with it |
| `onSubmitEdit` / `onCancelEdit` / `editLoading` | | | Save sends the new segments. The box is yours to close |
| `thread` | `none \| line` | `none` | The thread line under the avatar. `CommentReplyThread` sets it |
| `className`, `ref`, rest | | | On the `<article>` |

**The mode is yours to control.** `replying` and `editing` are props, not internal state,
because the same state decides what the actions row says ("Reply" or "Cancel Reply") and
the parent usually needs to know. Both boxes open **focused**, their send button is dim
while they are empty, and Ctrl or Cmd + Enter sends. After a send the box is yours to close.

**Mentions read the same either side of posting.** In `body` a mention draws as
`MentionTag`, the tag the box drew while it was written. Line breaks are kept.

## Tokens

Nothing of its own; the layout is the frame's.

| Part | Is |
|---|---|
| Rows | `gap-2` (8), `py-2` (8) above and below |
| Avatar and text | `gap-4` (16); the avatar is `Avatar` `md` with `border-stroke-default` and `text-text-tertiary` (the frame's `Profile_Initials`) |
| Author | `type.label-sm-medium`, `text.primary`; the time `type.body-sm-regular`, `text.tertiary`; 8 apart |
| Body | `type.body-sm-regular`, `text.primary`; mentions `MentionTag` |
| Thread line | 1 wide, `stroke.default`, at 16 (the middle of the avatar), from 4 under the avatar, down to the foot of the row (the replies' corners are `CommentReplyThread`'s) |

Differences from the frame, each settled elsewhere in the system:
- **The mention tag is `MentionTag`**, the one the box draws, where the frame's posted
  chip is 32 tall with 12 padding. A 32 tall chip in running text breaks the line, and a
  mention should read the same when it is written and when it is read.
- **The avatar's initials come from the name** (two letters), where the frame draws one.
- **The reply box's border is `stroke.strong`**, as `MentionInput`'s is, not the frame's
  `stroke.subtle`; and **Cancel is `secondary`**, as `CommentFormActions`'s is. See those docs.

## Accessibility

- Each comment is an `<article>`; the time is a `<time>` with `dateTime`.
- The boxes are named for what they do ("Reply to John Smith", "Edit comment") and open
  focused, so a keyboard user lands in the field they asked for.
- The actions and their names are `CommentActions`'. The thread line is decoration.
- Edit and Delete exist only when the handlers were given: leave them off for a comment
  that is not the person's own.

## Don't

- **Don't render a comment's text yourself.** Pass `body`, so mentions stay tags and the
  text is escaped as text.
- **Don't close the box before the send has succeeded.** Keep `replying` or `editing` on
  until it has, and use `replyLoading` or `editLoading` while it runs, so a failure leaves
  the text where it was.
- **Don't draw the thread line yourself.** Use `CommentReplyThread`, which knows whether
  replies are showing.
