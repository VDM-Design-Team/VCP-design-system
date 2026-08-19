# Input

A single-line text field, with optional decorative icons and an error state.

## When to use which size

| Size | Height | Use for | Notes |
|---|---|---|---|
| `md` | 40 | Everything by default — forms, filters, modals | The only size that meets the 40 minimum target |
| `sm` | 32 | Dense tables, toolbars, inline filters | Pointer-only contexts. Never on a touch-first screen |

For anything that isn't one line of free text, reach for the right control instead:
a `Textarea` for long answers, a `Select` for a closed set, a date picker for dates.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `sm \| md` | `md` | Replaces the native `size` attribute (character count), which is not forwarded |
| `invalid` | `boolean` | `false` | Critical border + `aria-invalid`. Must be paired with a visible message |
| `fullWidth` | `boolean` | `false` | Spans the container. Use in forms, modal bodies, and on mobile |
| `disabled` | `boolean` | `false` | Greys the whole shell, not just the text |
| `leadingIcon` / `trailingIcon` | `ReactNode` | — | 16 icons only. Decorative — rendered `aria-hidden` |
| `className` | `string` | — | Merged onto the **field wrapper**, not the inner `<input>` |
| `ref` | `Ref<HTMLInputElement>` | — | Points at the real `<input>`, so `.focus()` and form libraries work |

Everything else (`value`, `defaultValue`, `onChange`, `placeholder`, `type`, `id`,
`name`, `aria-describedby`, …) is forwarded to the `<input>`.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Field background | `surface.elevated` | `bg-surface-elevated` |
| Field background, disabled | `surface.neutral.subtle` | `has-[:disabled]:bg-surface-neutral-subtle` |
| Border, resting | `stroke.field` | `border-stroke-field` |
| Border, focused | `stroke.focused` | `focus-within:border-stroke-focused` |
| Border, invalid | `accent.critical.outline.border.default` | `border-accent-critical-outline-border-default` |
| Border, disabled | `stroke.subtle` | `has-[:disabled]:border-stroke-subtle` |
| Focus ring | `stroke.focused` | `focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused` |
| Value text | `text.primary` | `text-text-primary` |
| Placeholder | `text.subtle` | `placeholder:text-text-subtle` |
| Text, disabled | `text.disabled` | `disabled:text-text-disabled` |
| Icons | `text.subtle` | `text-text-subtle` |
| Type ramp | `type.body.sm` / `type.body.md` | `text-body-sm` (`sm`) / `text-body-md` (`md`) |
| Radius | `shape.radius.md` | `rounded-md` |

The dark theme comes for free — every class above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

## Accessibility

- **Always ship a `<label>`.** The component renders no label of its own. Use
  `<label htmlFor>` with the input's `id`, or an `aria-label` when the design has
  no visible label. A placeholder is not a label — it disappears on first keystroke.
- **Focus is real.** The `<input>` is what receives focus; the ring is drawn on the
  wrapper with `focus-within`. It is a 2px outline at 2px offset, so the indicator is
  a shape change rather than colour alone. Never remove it.
- **`invalid` sets `aria-invalid`** and is never the only signal. Render an error
  message and point at it with `aria-describedby` — colour alone fails 1.4.1.
- **Icons are decorative** and rendered `aria-hidden`, so they are skipped by screen
  readers. If an icon carries meaning that isn't in the label, it belongs in the label.
- **Contrast.** Value text is 4.5:1+ on the field in both themes. The resting border
  uses `stroke.field`, the token reserved for form-control boundaries: 4.76:1 on
  `surface.elevated` in light and 5.71:1 in dark, against the 3:1 that 1.4.11 asks of
  a control boundary. `stroke.default` is 1.48:1 and does not qualify.
- `md` is 40 tall and meets the minimum target. `sm` is 32 — pointer contexts only.

## Don't

- Don't hardcode colors or spacing. `className="border-[#cbd5e1]"` is a bug — add a token instead.
- Don't use a placeholder as the label.
- Don't set `invalid` without also rendering the error text that explains it.
- Don't put an interactive control (a button, a clear "×") into `trailingIcon` — the
  slot is `aria-hidden` and outside the tab order. That needs its own component.
- Don't use `sm` on a touch-first screen.
- Don't pass the native `size` attribute expecting a character count — `size` is the
  height variant here. Constrain width with `fullWidth` or the parent's layout.
