# CommentCard *(component)*

A posted comment or reply: the author's avatar and the words in a bordered card, with the
actions (Edit, Delete) under it.

Read off Figma's `_Notification_Popover_Comment_Reply_Item` (`State=Replied`) and the
comment section's `Comment_Reply`.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Avatar` | atom | The author, 24 (`sm`) |
| `MentionInput` | component | Its `MentionTag`, so a mention reads as the same tag the field drew |

## When to use

| Use | For |
|---|---|
| `CommentCard` | A comment or reply that is already posted |
| `CommentComposer` | One being written or edited |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `author` | `{ name, src? }` | required | The avatar is decoration |
| `value` | `MentionSegment[]` | required | The words, as a `MentionInput` produces them |
| `actions` | `ReactNode` | — | Under the card: `CommentControl`s |
| `className`, `ref`, rest | | | On the root `<div>` |

`CommentText` is exported too, for the words alone.

## Tokens

The card: `surface.elevated`, a `stroke.default` border, `radius.md`, 12 / 8 padding,
`body-sm-regular` `text.primary`; the avatar 8 to its left; the actions 8 below, 16 apart.
No new tokens.

## Accessibility

- The author's name is **not** in the card: the avatar is decoration. Where a card sits in
  a thread, put the author's name in the surrounding text, or in a heading.
- A mention is read as text, "@Jane Doe".
- Line breaks in the comment are kept.

## Don't

- **Don't pass HTML.** Pass the segments; the card draws the tags itself.
