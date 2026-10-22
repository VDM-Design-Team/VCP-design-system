# MentionInput *(component)*

A text field where typing `@` opens a list of members, typing more letters filters
it, and choosing one turns the text into a tag inside the field, as in the comments.

Read off Figma's `_Multiline_Input` (the field and its placeholder, "Type @ to mention
and notify a member") and the `@User` chip in `Comment_Reply`. Figma draws the list as
a basic menu; there is no dedicated mention component, so this is built to the same
behaviour in the system's own look.

## Composed of

Nothing from the system. The field and its list render their own markup, and take
their look from tokens. `npm test` fails if that changes without this section
changing.

## When to use

| Use | For |
|---|---|
| `MentionInput` | Writing a comment or a reply where people can be mentioned and notified |
| `Textarea` | Any other multi-line text, with no mentions |
| `SearchSelect` | Choosing a member into a field (not into running text) |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `members` | `{ id, name }[]` | required | Who can be mentioned |
| `value` / `onChange` | `MentionSegment[]` | — | Controlled. The change is segments, below |
| `defaultValue` | `MentionSegment[]` | `[]` | Starting content when uncontrolled; how a saved comment is loaded back in |
| `placeholder` | `string` | `Type @ to mention and notify a member` | Shown while empty |
| `disabled` | `boolean` | `false` | Not editable, not in the tab order |
| `onSubmit` | `() => void` | — | Ctrl or Cmd + Enter. A plain Enter is a line break |
| `autoFocus` | `boolean` | `false` | Focuses with the caret at the end |
| `aria-label` / `aria-labelledby` | | | **One is required**: the field has no visible label of its own |
| `className`, `ref`, rest | | | On the editable field |

## The value is segments

```ts
type MentionSegment =
  | { type: 'text'; text: string }
  | { type: 'mention'; id: string; label: string };
```

`mentionedIds(value)` is who to notify (in order, no repeats); `plainText(value)` is the
words, with each tag as "@Label". `MentionTag` draws the same tag for a posted comment, so
a mention reads the same when written and when read. In the DOM a tag is

```html
<span data-type="mention" data-id="182" data-label="Anna" contenteditable="false">@Anna</span>
```

which is the markup TipTap's mention extension writes, so an app on TipTap reads the same
ids and labels from either.

## Behaviour

- **`@` opens the list** when it starts the text or follows a space. An `@` inside a word,
  like an email address, opens nothing.
- **Letters after it filter**: names that contain them, case-insensitive, those that
  start with them first, at most eight.
- **↑ ↓** move through the list, **Enter** or **Tab** choose, **Escape** closes the list
  and keeps the text. A click on an option chooses it.
- **A tag is one unit**: Backspace removes it whole.
- **Plain text and tags only.** No formatting, and a paste is always plain text.

## Tokens

Field: `surface.elevated`, `radius.sm`, a 1 `stroke.strong` border (the control boundary,
as `Input` uses; Figma's `stroke.subtle` is under 3:1), 16 padding, 100 tall at least,
`body-sm-regular` `text.primary`; the placeholder `text.subtle`; focus is a 2
`stroke.focused` outline. The tag: `surface.brand.faint` with `text.brand.strong`, 14
medium, `radius.sm`. The list: `surface.elevated`, `stroke.default`, `radius.md`,
`shadow.menu`, rows `label-sm-medium` with the `surface.brand.faint` highlight, as `Menu`.
No new tokens.

## Accessibility

- A `role="textbox"` (multiline) with `aria-activedescendant` and `aria-controls` while the
  list is open, and a listbox of options: focus never leaves the field, so a screen reader
  keeps reading what is being typed. The list opening is announced by a polite status
  ("2 members. Use the up and down arrow keys."), since `aria-expanded` is not allowed on a
  textbox.
- The tag is `contenteditable="false"`, so it is read as text, "@Jane Doe", and moved over
  as one unit.
- **Escape closes only the list.** Inside a `Modal` or `Popover` that listens for Escape on
  the document, the first Escape may still reach them: the field cannot stop a handler that
  runs before it.
- The tag's colours are `text.brand.strong` on `surface.brand.faint`, not Figma's
  `text.brand.medium`, which is 3.51:1 in dark.

## Known limits

A hand-rolled editor is where input quirks live. The cases below are tested; the rest is
not promised.

- Tested: typing and filtering, choosing by keyboard, Escape, an email's `@`, Backspace over
  a tag, loading saved content back in.
- **Not covered:** IME composition (Chinese, Japanese, Korean input) and some mobile
  keyboards can type around the field's own handling. Use a heavier editor if those matter.
- The list is under the field, not under the caret, and is not repositioned near the edge
  of the screen.
- Members are a list you pass in. There is no async search as you type.

## Don't

- **Don't store the field's HTML.** Store the segments, or the text and `mentionedIds`.
- **Don't use it as a rich-text editor.** It is text and tags only; the `RichTextToolbar`
  is a separate piece.
- **Don't leave out the accessible name.** The field has no visible label.
