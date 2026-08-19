# Field

The wrapper every form control sits in. It owns the label, the required marker,
the optional "+" affordance for repeatable groups, and the single message slot
below the control.

Field does not render a control. Pass one as `children` and Field generates the
id, points the label at it, and wires `aria-describedby` / `aria-invalid`.

```tsx
<Field label="Supplier name" required helper="As it appears on the contract.">
  <Input placeholder="Acme Logistics" />
</Field>
```

## When to use which variant

| Variant | Use for | Notes |
|---|---|---|
| `stacked` | Almost every form — signup, onboarding, modals, mobile | Default. Label above the control |
| `inline` | Settings pages and dense edit views on wide viewports | Label column is fixed at `w-40`; collapses badly under ~30rem, so switch to `stacked` on mobile |

## When to use which message

| Slot | Use for |
|---|---|
| `helper` | Standing guidance — format, source of truth, consequence. Present before the user types |
| `error` | A specific, fixable problem with what the user entered. Replaces `helper` entirely |

Never show both. `error` wins whenever it is set.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `ReactNode` | — | Omit only when the control carries its own accessible name |
| `required` | `boolean` | `false` | Renders the marker plus an "(required)" hint for screen readers |
| `onAdd` | `() => void` | — | Renders the small round "+" next to the label, for repeatable groups |
| `addLabel` | `string` | `Add <label>` | Accessible name for the "+". Required when `label` isn't a string |
| `helper` | `ReactNode` | — | Guidance under the control |
| `error` | `ReactNode` | — | Replaces `helper`, recolours it, and announces it |
| `variant` | `stacked \| inline` | `stacked` | |
| `size` | `sm \| md \| lg` | `md` | Drives the label and message type ramp only — the control sizes itself |
| `fullWidth` | `boolean` | `false` | Stretches the field to its container |
| `loading` | `boolean` | `false` | Sets `aria-busy` on the field and disables the "+" |
| `htmlFor` | `string` | generated | Only needed when you already own the control's id |
| `children` | `ReactNode \| (props) => ReactNode` | — | See below |

### Wiring the control

- **A single element** (`<Input />`, `<select>`, `<textarea>`) — Field clones it and
  injects `id`, `aria-describedby` and `aria-invalid`. Anything you set yourself wins.
- **A function** — Field calls it with `{ id, 'aria-describedby', 'aria-invalid' }`
  so you can place them by hand. Use this when the control sits inside a wrapper,
  or when there is more than one element in the slot.
- **Anything else** — rendered as-is, with no wiring. Set `htmlFor` and the aria
  attributes yourself.

## Tokens

| Part | Token |
|---|---|
| Label text | `text-text-primary` + `text-label-sm` / `-md` / `-lg` |
| Required marker | `text-accent-critical-tonal-content-default` |
| Helper text | `text-text-tertiary` + `text-caption-sm` / `-md` / `text-body-md` |
| Error text | `text-accent-critical-tonal-content-default` |
| "+" affordance surface | `bg-action-primary-surface-default`, `-hover`, `-pressed`, `-disabled` |
| "+" affordance glyph | `text-action-primary-content-default`, `-disabled` |
| Focus ring | `outline-stroke-focused` |
| Label→control gap | `gap-1.5` (6) |
| Inline label column | `w-40` (160) |

## Accessibility

- The label is a real `<label htmlFor>`. Clicking it focuses the control.
- `error` renders with `role="alert"`, so it is announced the moment it appears.
  Both `helper` and `error` are referenced by the control's `aria-describedby`.
- `aria-invalid` goes on the control, not the wrapper — validation state belongs
  to the thing being validated.
- The required marker is `aria-hidden`; the announcement comes from the visually
  hidden "(required)" text. Also set the native `required` attribute on the
  control so browser validation agrees with the label.
- The "+" is icon-only and always carries an `aria-label`. It sits beside the
  `<label>`, never inside it — a `<label>` may not contain interactive content.
- The "+" dot is 24 wide, but the button pads out to 40 — the system minimum
  touch target — and cancels that padding with a negative margin so the label
  row's height is unchanged.
- Focus ring is `outline-stroke-focused` at 2 with 2 offset. Never remove it.
- Error and required text use `accent.critical.tonal.content.default`, which
  clears 4.5:1 on `surface.canvas` in both themes. The lighter
  `accent.critical.outline.content.default` does not — don't substitute it.

## Don't

- Don't hardcode colors or spacing. `className="text-[#e7000b]"` is a bug — use a token.
- Don't show `helper` and `error` at the same time, and don't stuff the error into
  the helper slot to keep both.
- Don't use the error slot for success or hint text. It is announced as an alert.
- Don't put the required marker in the label string (`label="Email *"`) — use
  `required` so the hidden announcement comes with it.
- Don't use `onAdd` as a generic action button. It means "add another one of these"
  and nothing else; anything else belongs next to the control or in the form footer.
- Don't nest a Field inside a Field. For a group of related controls use a
  `<fieldset>` with a `<legend>` and one Field per control.
- Don't use `inline` on mobile. The label column doesn't wrap.
