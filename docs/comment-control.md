# CommentControl *(component)*

The small text button under a comment: an icon and a word, such as "Reply", "Edit",
"Delete", "Show Reply" and "Hide Reply".

Read off Figma's `_Comment_Control_Button` (Default and Hover). The glyph for each action
is Figma's `_Comment_Control_Icon`: `ArrowUUpLeft` for reply, `PencilSimple` for edit,
`Trash` for delete, `CaretDown` and `CaretUp` for show and hide.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Icon` | atom | The 16 glyph for the action |

## When to use

| Use | For |
|---|---|
| `CommentControl` | An action on a comment, in the row under it |
| `Button` (`tertiary`) | Any other text action. `CommentControl` is that, shaped for a comment's row, with the glyph chosen for you |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `kind` | `reply \| edit \| delete \| show \| hide` | required | Picks the glyph |
| `label` | `string` | required | The word. "Show Reply", "Show 3 Replies" |
| `aria-expanded`, `aria-controls` | | | For Show / Hide: whether, and what, it opens |
| `className`, `ref`, rest | | | On the `<button>` |

## Tokens

36 tall, `radius.md`, a 16 glyph and a 14 regular label (`body-sm-regular`) 8 apart, in
`neutral.textual.content.default`; hover takes `text.link.default` (Figma binds
`text.brand.medium`, which is 3.88:1 on a dark surface). The focus ring is the system's.
No new tokens.

## Accessibility

- A real `<button>`, named by its label. The glyph is decoration.
- Where it expands something, give it `aria-expanded` (and `aria-controls`).
- 36 tall: under the 40 target, over the 24 floor (WCAG 2.5.8). Figma gives it no
  horizontal padding, so the label is the target's width.

## Don't

- **Don't use it for the main action.** Reply, Edit and Delete are secondary; a form's
  Save is a `Button`.
- **Don't name the glyph yourself.** Add a `kind` if a new action needs one.
