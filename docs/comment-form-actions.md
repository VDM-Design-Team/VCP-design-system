# CommentFormActions

The buttons under a comment box: the one that sends it ("Add Comment", "Reply",
"Save") and, when there is a way out, "Cancel". A component.

Read off the Figma `_Comment_Controls` (Save, Reply Enabled, Reply Disabled) and
`_Comment_Button` (Add Comment, with its loading state).

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CommentFormActions` | Under a new-comment box, a reply box, or an edit box |
| `Button` | Any other button; this is only the one arrangement three comment screens share |
| `CommentActions` | The row under a *posted* comment |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `submitLabel` | `string` | `Add Comment` | "Add Comment", "Reply" or "Save" |
| `onSubmit` | `() => void` | — | |
| `disabled` | `boolean` | `false` | The design's "Reply Disabled": the send button dims, Cancel stays usable |
| `loading` | `boolean` | `false` | The send is in flight: a spinner, `aria-busy`, and no second click |
| `onCancel` | `() => void` | — | Draws Cancel. Leave it off for a new comment, which has nothing to cancel |
| `cancelLabel` | `string` | `Cancel` | |
| `className`, `ref`, rest | | | On the wrapper |

## Tokens

Nothing of its own: it is the system's small `Button` twice, 8 apart.

| Part | Is |
|---|---|
| Send | `Button` `size="sm"`, `primary`: 36 tall, 12 side padding, `radius.sm`, `action.primary.surface` (default `#1a56db`, disabled `#8caaed`) |
| Cancel | `Button` `size="sm"`, `secondary`: outlined in `action.secondary.border`, `action.secondary.content` text |
| Gap | `gap-2` (8) |

Three differences from the Figma frames, all the system's:
- **Cancel is `secondary`, an outlined button, where Figma draws plain blue text.**
  Beside a primary button the system's Cancel is `secondary` (`HandoffAVModal`,
  `RejectPendingAVModal`, `ReviewAVModal`). `docs/button.md` keeps `tertiary` for
  dense toolbars, icon-only actions and table rows, and the one place it is a Cancel
  is the lowest step of a three-button ladder. The `_Comment_Controls` frames in
  Figma should follow, so code and design agree.
- **The gap is 8, not 4.** Two outlined buttons need more room than a button and a
  text link, and 8 is a step on the system's scale (modal footers use 12).
- `loading` shows the system's spinner, where Figma draws an arrows glyph, so every
  button that waits looks the same.

## Accessibility

- Real buttons, with text names. `loading` sets `aria-busy` and disables the send
  button, so a second click cannot send twice.
- A disabled send button is out of the tab order, as any disabled button is. If the
  reason matters (an empty box), say it near the box and not on the button.

## Don't

- **Don't add a Cancel to a new comment.** There is nothing to cancel; leave `onCancel` off.
- **Don't disable Cancel** while the send is dim. The way out always works.
