# Checkbox

An independent on/off choice inside a form that is explicitly submitted.

## When to use what

| Control | Use for | Applies |
|---|---|---|
| `Checkbox` | One or more independent choices; a single opt-in ("I agree to the terms") | On submit |
| `Checkbox` + `indeterminate` | The **parent row** of a partially selected group ("All regions") | On submit |
| `Toggle` | A single setting that takes effect the moment it is flipped | Immediately |
| `RadioGroup` | Exactly one choice out of a mutually exclusive set of 2–5 | On submit |

Rules of thumb:

- If flipping it saves straight away, it is a `Toggle`, not a `Checkbox`.
- If the options are mutually exclusive, it is a `RadioGroup`. Two checkboxes that
  can never both be ticked are a modelling bug.
- `indeterminate` is a state you *compute*, never one a user can select. A user
  clicking a mixed parent selects all children or clears them — it never cycles
  back to mixed.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `ReactNode` | — | Clickable text beside the box. Omit it only with `aria-label` |
| `checked` | `boolean` | — | Pass it to control the component; omit it for uncontrolled use |
| `defaultChecked` | `boolean` | `false` | Uncontrolled starting value |
| `indeterminate` | `boolean` | `false` | Mixed state. Set as a DOM property and as `aria-checked="mixed"` |
| `disabled` | `boolean` | `false` | |
| `fullWidth` | `boolean` | `false` | Makes the whole row a target — list and settings rows |
| `onChange` | `(checked: boolean) => void` | — | Gets the new value, not the event |
| `className` | `string` | — | Applied to the outer `<label>`, not the input |

Every other `<input>` attribute (`name`, `value`, `required`, `id`, `form`,
`aria-*`, …) is forwarded to the real input. `ref` points at that input, so
`ref.current.focus()` and `ref.current.indeterminate` both behave as expected.

Controlled and uncontrolled both work. `onChange` is always attached internally,
so passing `checked` without `onChange` produces a read-only checkbox rather than
a React warning — that is rarely what you want, so pass both.

## Tokens

| Part | State | Token |
|---|---|---|
| Box fill | unchecked | `surface.base` |
| Box fill | checked / mixed | `action.primary.surface.default` |
| Box fill | checked / mixed, hover | `action.primary.surface.hover` |
| Box fill | checked / mixed, pressed | `action.primary.surface.pressed` |
| Box fill | disabled, unchecked | `surface.neutral.faint` |
| Box fill | disabled, checked / mixed | `action.primary.surface.disabled` |
| Box border | unchecked | `stroke.stronger` |
| Box border | unchecked, hover | `stroke.brand.strong` |
| Box border | disabled, unchecked | `stroke.subtle` |
| Glyph | checked / mixed | `action.primary.content.default` |
| Label | default | `text.secondary` |
| Label | disabled | `text.disabled` |
| Focus ring | focus-visible | `stroke.focused`, 2px outline at 2px offset |
| Radius | — | `radius.sm` |
| Type | label | `body-md` |

Dark theme comes free — the component only uses semantic tokens, and
`tokens/semantic/color.dark.json` repoints them under `.dark`.

## Accessibility

- The control **is** a real `<input type="checkbox">`. It is visually hidden with
  `sr-only` — never `display:none` — so it stays in the tab order, announces its
  role and state, and takes <kbd>Space</kbd> natively. The visible box is a
  sibling styled entirely from `peer-*` selectors.
- The input is wrapped in its `<label>`, so the label text is the accessible name
  and clicking it toggles the box. With no `label`, you **must** pass `aria-label`.
- `indeterminate` is a DOM property, not an attribute. It is written in a layout
  effect and mirrored to `aria-checked="mixed"`, so assistive tech announces
  "mixed" rather than "checked"/"unchecked".
- The focus ring is drawn on the visible box (`outline-stroke-focused`, 2px at 2px
  offset), because the real input has no visible area of its own. Never remove it.
- **Touch target:** the box is 16×16 but the `<label>` carries `p-3`, which makes
  the smallest possible target 40×40 — the CLAUDE.md minimum. This is why an
  unlabelled checkbox looks like it has generous padding; do not strip it to make
  a dense table row. If the row is already ≥40px tall, use `fullWidth` so the
  whole row is the target instead.
- Contrast: the unchecked border is `stroke.stronger` (7.5:1 on `surface.base`)
  because it must clear 3:1 as a UI boundary — `stroke.default` and
  `stroke.strong` do not. The label is `text.secondary` (10.3:1), well past 4.5:1.
  Disabled text uses `text.disabled` and relies on the WCAG 1.4.3 exemption for
  inactive controls, so never let colour be the only signal that a row is off.
- Group related checkboxes in a `<fieldset>` with a `<legend>`.

## Don't

- Don't hardcode colors or spacing. `className="bg-[#336afa]"` is a bug — add a token instead.
- Don't use a checkbox for a setting that applies immediately. That's a `Toggle`.
- Don't use checkboxes for mutually exclusive options. That's a `RadioGroup`.
- Don't let a user click their way *into* `indeterminate`.
- Don't render a checkbox with no `label` and no `aria-label`.
- Don't swap the input for a `<div role="checkbox">` to get a custom look — the
  box is already fully styleable from tokens.
- Don't remove the label's padding to fit a dense layout; you'd drop below the
  40px target.
