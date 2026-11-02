# CommentSection

A whole comment list: the "Comments" title with the sort switch, the box to write a new
comment, and every comment with its replies, each with the things you can do to it. A
pattern.

Read off the Figma `New_Comment`, `Comment_Reply` and `Comment_Reply_Thread` (Comment
Component section) assembled as the Pages & Flows "AV Comment Section" page assembles them.

## Use this one

**This is the piece to reach for.** `CommentComposer`, `CommentReply`, `CommentReplyThread`,
`CommentActions`, `CommentFormActions` and `CommentSortChip` are its building blocks. They are all
exported, but putting them together by hand means keeping track of which replies are open, which
comment is being replied to and which is being edited, and getting the thread lines and the
author-only buttons right. `CommentSection` does all of that: you give it **the comments as data**
and **what to do when someone adds, replies, edits, deletes or reacts**.

```tsx
import { CommentSection } from '@vcp/design-system';

<CommentSection
  currentUser={{ id: me.id, name: me.name, src: me.photo }}
  members={people}                                   // who can be @mentioned: { id, name }[]
  comments={comments}                                // the comments, replies nested inside each
  onAddComment={(body) => api.addComment(avId, body)}
  onReply={(parentId, body) => api.reply(parentId, body)}
  onEdit={(id, body) => api.edit(id, body)}          // Edit shows on the user's own comments
  onDelete={(id) => confirmThenDelete(id)}           // Delete shows on the user's own comments
  onReact={(id, emoji) => api.react(id, emoji)}      // the reaction buttons show when this is given
  getLink={(id) => `${location.origin}${location.pathname}#comment-${id}`}  // Copy Link shows when given
/>
```

That is the whole integration. A handler you leave out simply removes its button: no `onDelete`,
no Delete. Each comment in `comments` looks like this:

```ts
{
  id: 'c1',                                   // stable, unique across the whole list (replies too)
  author: { id: 'u-john', name: 'John Smith', src?: '…' },
  time: 'an hour ago',                        // as it should read
  createdAt: '2026-10-27T09:00:00Z',          // ISO; sorts the top level, and is the <time> value
  body: [{ type: 'text', text: 'Hi ' }, { type: 'mention', id: 'u-jane', label: 'Jane Doe' }],
  reactions: [{ emoji: '👍', count: 2, mine: true }],     // optional
  replies: [ /* more comments of the same shape */ ],   // optional; read oldest first (by createdAt, if they all have it)
}
```

`body` is what the comment box writes (text and mentions), so what `onAddComment` hands you is
what you store and what you give back. `mentionedIds(body)` is who to notify.

## What it does for you, and what is still yours

| It holds (screen state, never your data) | It works out | Stays yours |
|---|---|---|
| Which threads are open | Edit and Delete only on the current user's own comments (`author.id === currentUser.id`) | The data, and saving it |
| Which comment has a reply box open, which is being edited (one at a time) | A thread's reply count and its Show / Hide toggle | Sorting anything you page in from a server |
| The sort order, unless you control it | The thread line, which follows the replies | Confirming a delete: `onDelete` just says "delete this" |
| A reply that was just sent opens its thread, so it is seen | Top-level order by `createdAt`, and replies oldest first (by `createdAt` when every reply has it, otherwise as you give them) | Showing an error when a send fails |

**Handlers may be async.** Return a promise from `onAddComment`, `onReply` or `onEdit` and the box
shows its spinner until it settles. It clears when it resolves and **keeps what was typed if it
rejects**, so report the failure (a toast, a message) in your own handler. The box only promises not
to lose the text.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `currentUser` | `{ id, name, src? }` | required | The avatar by the new-comment box, and who may edit and delete |
| `members` | `{ id, name }[]` | required | Who can be mentioned |
| `comments` | `CommentData[]` | required | The tree above |
| `onAddComment` | `(body) => void \| Promise<void>` | — | A new, top-level comment |
| `onReply` | `(parentId, body) => …` | — | Giving it shows Reply |
| `onEdit` | `(id, body) => …` | — | Giving it shows Edit, on the user's own comments |
| `onDelete` | `(id) => void` | — | Giving it shows Delete, on the user's own comments |
| `onReact` | `(id, emoji) => void` | — | Giving it shows the reaction buttons. Fires for a pick and for a toggle; you decide what each means |
| `getLink` | `(id) => string` | — | Giving it shows Copy Link |
| `title` / `headingLevel` | `string` / `2 \| 3 \| 4` | `Comments` / `2` | The title is a real heading and names the section |
| `sort` / `defaultSort` / `onSortChange` | `newest \| oldest` | uncontrolled, `newest` | Controlled if you give `sort` |
| `defaultRepliesOpen` | `boolean` | `false` | Whether threads start open |
| `emptyState` | `ReactNode` | nothing | Under the box when there are no comments. The design has no empty state yet, so nothing is invented |
| `className`, `ref`, rest | | | On the `<section>` |

## Composed of

| Piece | Tier |
|---|---|
| `CommentComposer` | component |
| `CommentReplyThread` | component |
| `CommentSortChip` | component |
| `EmojiReactionPicker` | component |
| `MentionInput` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

`MentionInput` is here only for its types (`MentionSegment`, `MentionMember`): the box itself is `CommentComposer`.

## When to use the pieces on their own

| Use | For |
|---|---|
| `CommentSection` | A comment list on a page. Almost always |
| `CommentComposer` | A box to write in somewhere that is not a comment list (a feedback form) |
| `CommentReply` / `CommentReplyThread` | One comment, or one thread, shown by itself (a notification, a preview), where you control the state |
| `CommentActions`, `CommentFormActions`, `CommentSortChip` | The parts, when a design needs them somewhere else |

## Tokens

Nothing of its own: the title is `type.body-md-regular` in `text.tertiary` and the rows are 16
apart, as the frame. Every part is a piece of the system.

## Accessibility

- The section is named by its title, a real heading (`h2` by default), so a screen reader can jump
  to the comments. Give a second section on the same page its own `title`: two landmarks with one
  name are a violation.
- Each comment is an `<article>`, the replies are a `list`, and the toggle controls it
  (`aria-expanded`, `aria-controls`). The boxes open focused. The rest is the pieces'.
- Edit and Delete exist only on the user's own comments, not just hidden: the buttons are absent.

## Don't

- **Don't put the open threads or the reply box in your own state.** It is held for you; mirroring
  it is how the two drift apart.
- **Don't assemble the building blocks to make your own list.** If you need something this does
  not do, say so: the gap belongs here, where every page benefits.
- **Don't confirm in the handler by closing the box yourself.** `onDelete` is where to ask; the
  edit and reply boxes close when their promise resolves.
