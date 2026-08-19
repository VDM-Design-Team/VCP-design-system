# Textarea

Multi-line free text entry. Deliberately shares Input's shell — same radius,
border, padding and focus ring — so the two sit together in a form without a
visual seam.

## When to use

| Situation | Use | Why |
|---|---|---|
| The answer is a sentence or more (notes, rejection reasons, comments) | `Textarea` | Multi-line entry, visible line wrapping |
| The answer is one short value (name, email, reference) | `Input` | A single-line field sets the expectation of a short answer |
| The answer is one of a known set | `Select` | Don't make people type what they can pick |
| Rich formatting is required (bold, links, lists) | Not this component | `Textarea` is plain text only |
| The content is long-form and needs its own page | A full editor view | A field in a form is the wrong container past a few paragraphs |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `invalid` | `boolean` | `false` | Paints the critical border and sets `aria-invalid`. Pair with a visible error message |
| `fullWidth` | `boolean` | `true` | Form fields fill their column. Set `false` plus `cols` for an intrinsic width |
| `rows` | `number` | `4` | Visible rows before the field scrolls. Passed straight to the element |
| `disabled` | `boolean` | `false` | Dims the field and removes the resize handle |
| `className` | `string` | — | Merged through `cn()`, so later classes win |
| `ref` | `Ref<HTMLTextAreaElement>` | — | Forwarded to the underlying `<textarea>` |

Every other `<textarea>` attribute (`value`, `defaultValue`, `onChange`,
`placeholder`, `maxLength`, `name`, `required`, `readOnly`, `aria-describedby`)
passes through untouched.

### Resize behaviour

The field is `resize-y`: vertical only. Horizontal resize is off because a field
that can be dragged wider breaks the form's column grid and can push content out
of a modal. Disabled fields drop the handle entirely — there is nothing to reveal.
If a surface genuinely needs a fixed height, override with
`className="resize-none"`; `cn()` will drop the default.

### Character count

The component does not ship a counter. The count and the limit are form
concerns, not field concerns — the limit is business logic and the counter is
part of the field's description. Render it next to the field, point
`aria-describedby` at it, mark it `aria-live="polite"`, and mirror the
over-limit state onto `invalid`. See the "Controlled with character count" story.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Background | `surface.elevated` | `bg-surface-elevated` |
| Text | `text.primary` | `text-text-primary` |
| Placeholder | `text.subtle` | `placeholder:text-text-subtle` |
| Border, resting | `stroke.default` | `border-stroke-default` |
| Border, hover | `stroke.strong` | `enabled:hover:border-stroke-strong` |
| Border, invalid | `accent.critical.outline.border.default` | `border-accent-critical-outline-border-default` |
| Focus ring | `stroke.focused` | `focus-visible:outline-stroke-focused` |
| Disabled background | `surface.neutral.faint` | `disabled:bg-surface-neutral-faint` |
| Disabled text | `text.disabled` | `disabled:text-text-disabled` |
| Disabled border | `stroke.subtle` | `disabled:border-stroke-subtle` |
| Radius | `radius.md` | `rounded-md` |
| Type | `type.body-md` | `text-body-md` |
| Padding | Tailwind numeric scale | `px-3 py-2.5` |

## Accessibility

- **Label it.** A `Textarea` with no `<label for>` and no `aria-label` is unusable
  with a screen reader. Placeholder text is not a label — it disappears on the
  first keystroke.
- **Focus ring** is `outline-stroke-focused`, 2px with 2px offset, matching Button.
  Text fields always match `:focus-visible`, so the ring shows on click as well as
  on tab. Never remove it.
- `invalid` sets `aria-invalid` on the element. It must be accompanied by a
  visible error message referenced with `aria-describedby` — colour alone does not
  communicate the error.
- The error border (`accent.critical.outline.border.default`) is 3.81:1 and the
  focus ring (`stroke.focused`) is 6.18:1 against `surface.elevated`, both above
  the 3:1 floor for non-text contrast.
- The resting border (`stroke.default`) is **1.49:1** against `surface.elevated`
  and does not meet the 3:1 floor on its own. This is a system-wide gap shared
  with every other bordered control, not a `Textarea` decision — see the note in
  the component's PR. Always ship the field with a visible label above it so the
  control is identifiable without relying on the border alone.
- Disabled fields are exempt from the contrast minimums, but do not use `disabled`
  to present read-only content people still need to read — use `readOnly`, which
  keeps normal contrast and stays focusable.
- The resize handle is a pointer affordance only. Never make it the sole way to
  see all of the content — the field scrolls and is keyboard-navigable at any height.

## Don't

- Don't hardcode colours, sizes, or spacing. `className="border-[#e7000b]"` is a
  bug — use a token utility.
- Don't use a placeholder instead of a label.
- Don't set `invalid` without also rendering the reason.
- Don't turn on horizontal resize; it breaks the form column.
- Don't use `disabled` for read-only content — use `readOnly`.
- Don't reach for `rows` to control the field's width; that's `fullWidth` or `cols`.
- Don't nest a `Textarea` inside a control that already scrolls horizontally.
