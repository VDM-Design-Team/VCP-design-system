# NotificationItem *(component)*

One line in a list of notifications: who did what to which Added Value, when, and
whether it has been read.

Read off Figma's `Notification_Item` (`2428:4412`): Default, Hover and Focused,
each with and without a comment preview. The message is `_Message_Content`, its
thirteen kinds of event; `_Alert_Dot` is the unread dot and `_Mark_Read_Unread` the
hover button.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Avatar` | atom | The actor, 36 (`lg`), initials or a photo, with the avatar's white outline (`ring`) as Figma's `Profile_Initials` draws it |
| `Button` | atom | "Show more" / "Show less" on a long comment preview (`tertiary`, `sm`), and Reply / Save / Cancel in the composer |
| `Tooltip` | component | Names the mark-read button after a half-second rest: "Mark as read" or "Mark as unread" |
| `EmojiReactionPicker` | component | The reactions row: thumbs-up, the palette and the pills |
| `MentionInput` | component | The field a reply is written in, with @-mentions, and the `MentionTag` a posted reply draws |
| `Icon` | atom | The check-circle in the mark-read button |

## When to use

| Use | For |
|---|---|
| `NotificationItem` | A row in the notification popover, or in any list of events about Added Values |
| `Toast` | A transient message about something the user just did. A notification is a record that stays until read |

## The thirteen kinds

**The component owns the sentence**, the way `StatusTag` owns status → tone, so no
call site writes "John moved … to the backlog" itself. Bold is the design's 700;
the subject is regular.

| `kind` | Reads as |
|---|---|
| `commented` | **John commented on** *Title* |
| `mention` | **John mentioned you in a comment on** *Title* |
| `moved` | **John moved** *Title* **to Status** (`status`) |
| `pending` | **John submitted** *Title* **for approval. Pending** |
| `accepted` | **John accepted** *Title* |
| `updated` | **John made an update to** *Title* |
| `rejected` | **John rejected** *Title* |
| `rejected-feedback` | **John rejected** *Title* **with feedback** |
| `assigned` | **John assigned you** *Title* |
| `backlog` | **John moved** *Title* **to the backlog** |
| `handoff` | **John handed off** *Title***. Ready for Review** |
| `completed` | **John accepted & completed** *Title* |
| `viewer` | **John added you as a viewer to** *Title* |

None of the sentences ends in a full stop, so a one-sentence line and a two-sentence one end the same way.

Then the time, 12 regular `text.tertiary`, at the end of the same line. The text is
English; to localise, wrap the component and pass your own sentence, not edit call
sites.

### Who gets it

Which kinds notify whom is the product's rule, not the component's: the component only draws the row
it is given. For the kinds the design has specified:

| `kind` | Sent to | Red dot | Prior status | Why |
|---|---|---|---|---|
| `pending` | Admin(s) | Yes | Draft | Admins know an Added Value in Pending is waiting to be accepted or rejected |
| `handoff` (Ready for Review) | Initiator(s), Assignee(s), Admin(s) | Yes | Design Review | The Added Value moved to Review: the Initiator(s) (not the assignee) or an Admin can accept or reject it. Assignees are informed but have no review action |
| `completed` | Initiator(s), Assignee(s), Admin(s) | Yes, except for Admin(s) | Review | The Added Value was accepted and copied over to the Dev domain |
| `viewer` | Anyone added as a viewer | Yes | — | Tells them they can now see it |

The other kinds are not specified yet.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `kind` | `NotificationKind` | required | Picks the sentence |
| `actor` | `{ name, src? }` | required | Who did it. The avatar is decorative; the name is in the sentence |
| `subject` | `string` | required | The Added Value's title |
| `status` | `string` | — | Required for `moved` (the status it moved to), not accepted by any other kind |
| `time` | `string` | required | Already formatted: "5 minutes ago" |
| `unread` | `boolean` | `false` | The dot, and "Unread:" in the row's name |
| `onToggleRead` | `() => void` | — | Renders the mark-read / mark-unread button. Omit for a list that cannot be marked |
| `href` | `string` | — | The whole row is a link |
| `onSelect` | `() => void` | — | The whole row is a button, when it does not navigate |
| `preview` | `string` | — | The comment, as the design's preview card |
| `reactions` | `EmojiReaction[]` | — | Under the preview, as `EmojiReactionPicker` takes them |
| `onToggleReaction` | `(emoji) => void` | — | A pill, or the thumbs-up button, was pressed |
| `onSelectEmoji` | `(emoji) => void` | — | An emoji was chosen from the palette |
| `reply` | `{ author, value }` | — | The one reply to the comment, when there is one. `value` is `MentionSegment[]` |
| `onReply` | `(value, ids) => void` | — | Turns replying on: renders "Reply" and the composer it opens. Receives who was mentioned |
| `onEditReply` | `(value, ids) => void` | — | Renders "Edit" on the reply; fires when the edit is saved |
| `onDeleteReply` | `() => void` | — | Renders "Delete" on the reply |
| `members` | `{ id, name }[]` | `[]` | Who can be mentioned in a reply |
| `currentUser` | `{ name, src? }` | the actor | Who is replying: the composer's avatar |
| `defaultReplyShown` | `boolean` | `false` | Show the reply from the start. It is hidden by default |
| `className`, `ref`, rest | | | On the root `<div>` |

## Tokens

Row `surface.elevated`; hover `neutral.outline.surface.hover`, focused
`neutral.outline.surface.pressed`; 16 padding, 16 between avatar and text. The
sentence is `body-sm-bold` for the bold runs and `body-sm-regular` for the subject,
`text.primary`; the time is `caption-md-regular` `text.tertiary`. The unread dot is
8, `surface.brand.strong` (Figma binds `text.brand.medium`, the same blue). The
trailing 40 box (pulled back 8 on every side, so the icon sits where a 24 box would put it) holds a 20 check-circle in `stroke.focused`, `text.brand.strong` on
hover (a darker blue in light, a lighter one in dark): **outlined** on an unread row (the mark-read button, which the dot dissolves
into on hover and focus) and **filled** on a read row (the mark-unread button, which
dissolves in on hover and focus; the box is empty at rest), as `_Mark_Read_Unread` draws
it. Every change in that box, and the row's fill, is a 200ms dissolve (none under
reduced motion). The preview is `surface.elevated` with a 1 `stroke.default` border, `radius.md`, 12 / 8 padding, `body-sm-regular`
`text.primary`, indented 52 on the left (past the avatar) and 24 on the right (past the
dot). While "Show more / less" follows, the text has no bottom padding, so the two sit
close; with no button the text keeps its 8.

## Accessibility

- **The whole row is one target**, a real `<a>` or `<button>` named from the
  sentence: "Unread: John commented on *Title* a few seconds ago". The unread state
  is in the name as text, not only as a dot.
- **The mark-read button is a separate control**, named "Mark as read: *Title*" or "Mark
  as unread: *Title*" (so a list of them is not a list of identical names), reachable by Tab even when it is not visible. On an unread row it
  dissolves in when the row is hovered or the button focused, in the dot's place; on a read row it dissolves in as the filled
  check. The right side is empty at rest on a read row. The row never shifts.
- **The check and the dot clear 3:1 in both themes**, against the row at rest and against
  its hover and pressed fills (`stroke.focused` 6.18 / 5.64 / 5.01 in light, 6.33 / 4.48 /
  3.28 in dark; the dot is the same blue). Figma binds the check to `stroke.brand.medium`,
  which in dark is `#1a56db`: 2.37:1 on the row and 1.68:1 on its hover fill, so the icon
  all but vanished. `stroke.focused` is the lightest blue that holds in both themes; in
  light it is darker than Figma's default, which is the cost.
- **Focus** is the `stroke.focused` ring drawn inside the row, plus Figma's pressed
  fill. The fill alone (1.2:1 against the row) would not be a visible indicator.
- **The tooltip** (`Tooltip`, 500ms on hover, immediate on focus, opening to the left of the button) says the action in short: "Mark as read". The button's own name is longer (it adds the title), so the description is not a repeat.
- The mark-read target is 40, the system's touch minimum, with the 20 icon centred in it. On a
  touch screen there is no hover, so the button is invisible until focused but still tappable;
  the unread dot is what shows there.
- **The preview's** "Show more" is a real button with `aria-expanded` and
  `aria-controls`. It appears only when the comment really overflows three lines.
- Put items in a `<ul>` / `<li>`; the root is a `<div>` so it works in either.

## Reacting and replying

Under a comment preview, as Figma's `Notification_Popover_Comment_Reply` draws it:

| State | What shows |
|---|---|
| **No reply** | "↩ Reply" on the left; the reactions on the right |
| **Replying** | A composer in place of that row: the avatar, the field (with @-mentions), "Reply" and "Cancel" |
| **Replied, hidden** | "⌄ Show Reply" where "Reply" was, and the reactions. Hidden by default |
| **Replied, shown** | "⌃ Hide Reply", and the reply as a card with "Edit" and "Delete" under it |
| **Editing** | The composer, filled with the reply, with "Save" and "Cancel" |

There is **one reply** per comment. Sending a new reply starts it hidden; Cancel backs out
of either composer; Delete takes the reply away and brings "Reply" back. The reply and the
reactions are the caller's data, passed in; the component owns only which of these views is
showing, and reports what the user did (`onReply`, `onEditReply`, `onDeleteReply`,
`onToggleReaction`, `onSelectEmoji`).

The reply control, the composer and the reply card are **parts of this component, not
exported pieces**. They are drawn to the notification popover's own design (a 24 avatar and
a bordered card), which differs from the comment section's thread (a 32 avatar, a thread
line), so they are not called "comment" pieces: that would suggest the comments page can
use them. If that page is built and the designs converge, what they share can be pulled out
then, under a name that fits both. The field and the mention tag are the shared part, and
are `MentionInput`'s.

The reactions work as `EmojiReactionPicker` does: the thumbs-up toggles yours, the smiley
opens the palette, each pill toggles yours, and extras collapse into "+N".

"Show Reply" / "Hide Reply" carry `aria-expanded` and `aria-controls` for the reply card.

## The comment preview

The preview sits above the row's link, so a click anywhere on it does **not** open the item.
Only "Show more" / "Show less" respond. Everything else on the row is the target.

## Don't

- **Don't write the sentence yourself.** Add a `kind` here, so every list says it
  the same way.
- **Don't carry unread by colour alone.** The dot is decoration; the name says it.
- **Don't nest your own link or button in the row.** The row is the target; the only
  controls inside it are the mark-read button and the reply and reaction controls under a
  preview.
