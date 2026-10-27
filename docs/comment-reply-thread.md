# CommentReplyThread

A comment and, under it, its replies. A component.

Read off the Figma `Comment_Reply_Thread` (`3506:10331`, Comment Component section): a
`Comment_Reply` with a `Replies` slot beneath. The design's own note on the slot reads:
"Insert a Comment Reply into this slot to build a comment thread. A new sub-thread is
made by inserting this Comment Reply Thread into the slot." So the replies are the
`children`, and a reply that has replies of its own is a `CommentReplyThread` in the slot.

## Composed of

| Piece | Tier |
|---|---|
| `CommentReply` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CommentReplyThread` | A comment that has, or may get, replies |
| [`CommentReply`](comment-reply.md) | A comment with none, and each reply inside the thread |

## Props

`CommentReply`'s props (see `docs/comment-reply.md`), except `thread` and `repliesId`,
which it sets, and:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `ReactNode` | — | The replies: a `CommentReply`, or a `CommentReplyThread` for one with replies of its own. `<>…</>` around several is fine |
| `replyCount` | `number` | the number of `children` | What "Show N Replies" says. Pass it when the replies are not all loaded |
| `repliesOpen` | `boolean` | `false` | Whether they show. The toggle in `CommentActions` flips it; the state is yours |
| `ref` | | | On the comment's `<article>` |

The replies show only while `repliesOpen`, in a `role="list"` whose `id` the toggle
controls (`aria-controls`), so the toggle and the list are connected.

## The thread line

The comment's line runs from its avatar down into the replies, and **each reply takes a
corner off it** to its own avatar, 32 across, with a corner of radius 8 (`radius.md`); the line goes on past every reply but the
last and stops at the last one's corner. The design draws one hook at the foot of the
comment: with a single reply that is the same picture, and with several the line has to
reach each of them, so that is how it is generalised here.

| State | Line |
|---|---|
| Replies hidden, nobody replying | none |
| Replies showing | `line` on the comment, a corner on each reply |
| Replying, with no replies showing | `hook`: the line turns right at its foot, where the reply will go |

It is drawn with the line's own `stroke.default`, 1 wide, at 16 (the middle of the avatar),
so the comment's line and the replies' corners land on the same pixel. A reply is indented 48
(the 32 avatar and 16 beside it).

## Tokens

Nothing of its own: `CommentReply`'s, plus the line (`bg-stroke-default`) and the 48 indent
(`pl-12`).

## Accessibility

- The replies are a `list` of `listitem`s, controlled by the toggle (`aria-expanded`,
  `aria-controls`), which `CommentActions` provides.
- The thread line is decoration, and a nested sub-thread is the same arrangement one level in.

## Don't

- **Don't put the replies in a wrapper that adds its own indent or border.** The thread
  line and the 48 indent are drawn here; another would double them.
- **Don't nest deeply.** Each level is 48 further in; on a narrow screen two levels is
  about the most a column of text can bear.
