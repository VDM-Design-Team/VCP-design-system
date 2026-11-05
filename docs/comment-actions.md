# CommentActions

The row of things you can do to a comment: show or hide its replies, edit it,
delete it, reply, copy its link, and react. A component.

Read off the Figma `_Comment_Control` set (Default, Cancel Reply, Copy Link) and
its parts, `_Comment_Control_Button`, `_Comment_Control_Button_Reply` and
`_Comment_Control_Icon`.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

The reactions at the end of the row are `EmojiReactionPicker`, passed in as the
`reactions` slot rather than imported, so this piece never needs to know what a
reaction is.

## When to use

| Use | For |
|---|---|
| `CommentActions` | Under a posted comment, on the comment page and in replies |
| `EmojiReactionPicker` | The reactions alone, wherever there is no comment around them |
| `CommentFormActions` | The Save / Reply / Cancel buttons under a comment *box* |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `replyCount` | `number` | `0` | The replies toggle shows when this is above 0 and `onToggleReplies` is given |
| `repliesOpen` | `boolean` | `false` | "Show 3 Replies" becomes "Hide 3 Replies", and the caret turns up |
| `onToggleReplies` | `() => void` | — | |
| `repliesId` | `string` | — | The id of the replies list, wired to the toggle as `aria-controls` while they show |
| `onEdit`, `onDelete` | `() => void` | — | **Pass only for the author.** No handler, no button |
| `replying` | `boolean` | `false` | A reply box is open: "Reply" becomes "Cancel Reply" |
| `onReply`, `onCancelReply` | `() => void` | — | Which one runs depends on `replying` |
| `link` | `string` | — | What Copy Link copies. Giving `link` or `onCopyLink` draws the button |
| `onCopyLink` | `(link) => void` | — | Fires after a successful copy. With no `link` there is nothing to copy: it fires on click with `''` and no success is claimed |
| `subject` | `string` | — | What the actions are about, for their names: "Amy Lee's comment" gives "Edit Amy Lee's comment", "Reply to …", "Copy link to …" |
| `copiedDuration` | `number` | `2000` | How long the green check stays, in ms |
| `reactions` | `ReactNode` | — | An `EmojiReactionPicker`, at the end of the row |
| `className`, `ref`, rest | | | On the row |

**An action shows when you give it a handler.** The design's `Your comment` switch
is exactly this: Edit and Delete are for the author, so a comment by someone else
gets no `onEdit` or `onDelete`, and there is no hidden state to forget to set.
Singular and plural are handled: "Show 1 Reply", "Show 3 Replies".

**Copy Link copies, then says so.** With a `link`, a click writes it to the
clipboard and, once that has worked, the glyph becomes the green check the design
draws. If the clipboard refuses (an insecure page, or permission denied) the glyph
becomes a warning and the live region says "Couldn't copy the link"; it never claims
success it did not have. With no `link` the click only fires `onCopyLink`. The label
stays "Copy Link", as drawn, and "Link copied" goes to a polite live region.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Text and glyph | `neutral.textual.content.default` | `text-neutral-textual-content-default` |
| Hover | `text.brand.medium`, text and glyph | `hover:text-text-brand-medium` |
| Pressed | `neutral.textual.content.pressed` | `active:text-neutral-textual-content-pressed` |
| Copied check | `accent.success.outline.content.default` | `text-accent-success-outline-content-default` |
| Type | `type.body-sm-regular`, 14 / 20 | `text-body-sm-regular` |
| Radius | `radius.md` | `rounded-md` |
| Size | 36 tall, no side padding, 8 between glyph and text, 16 between buttons | `min-h-9 gap-2 py-2`, `gap-x-4` |
| Touch | 40 on a coarse pointer | `pointer-coarse:min-h-10` |
| Focus ring | `stroke.focused` | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused` |

Figma paints the check with `accent.success.filled.surface.default`, a surface token
used as a foreground; `accent.success.outline.content.default` is the same green in
the right family, and is what ships.

Contrast of the text on `surface.base`: **7.58:1** light, **9.85:1** dark (7.24 and
12.02 on `surface.canvas`). Pressed: 14.63:1 light, 13.35:1 dark. The copied check on
`surface.base`: 4.95:1 and 6.6:1.

**Token gap, for design:** the hover colour is `text.brand.medium`, as drawn, and in
dark it measures **3.88:1** on `surface.base` (4.74:1 on `surface.canvas`), under the
4.5:1 text needs. It only shows while the pointer is over a button, and the label is
still readable, but a lighter step in dark would clear it.

The pressed text is `neutral.textual.content.pressed`, which is slate-800 here; Figma's
pressed text is slate-900. The two are near-identical dark colours, so the token ships
as is.

The row's widths come out a pixel or two wider than the frame: the type ramp adds
0.4px of letter-spacing to `body-sm-regular` that Figma's text style does not have.

## Accessibility

- Every action is a real `<button>`, with text, so the name is the visible words.
  The glyphs are `aria-hidden`.
- The replies toggle changes its words ("Show" to "Hide"), so it is an action button and
  does not also carry `aria-expanded`, which would announce the state twice. It has
  `aria-controls` while the replies are showing and you have passed `repliesId`.
- Give `subject` in a thread, so the buttons are not all named "Edit", "Delete", "Reply":
  the visible word still leads the accessible name.
- Copy Link announces "Link copied" (or "Couldn't copy the link") in a polite live
  region; the glyph is for sighted users and the live region is for everyone else.
- Targets are 36 tall by default and 40 on a coarse pointer. The design's 36 is under
  the system's 40, as `Button`'s small size is, for a dense pointer-driven row.
- Visible focus ring on every button.

## Don't

- **Don't show Edit and Delete on someone else's comment.** Leave the handlers off.
- **Don't put the reaction state in here.** `EmojiReactionPicker` owns its menu; this
  row only gives it a place.
- **Don't change a button's label to say what happened.** The glyph and the live
  region do that; the label stays.
