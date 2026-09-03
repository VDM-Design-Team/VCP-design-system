# Select

A choice from a fixed list, on the native `<select>`. The shell is `Input`'s;
the popup is the platform's.

## When to use

| Use | For |
|---|---|
| `Select` | A handful to a few dozen known options |
| `SearchSelect` *(to port)* | Long lists that need typing to filter |
| `RadioGroup` | ≤5 options worth seeing all at once |
| `SegmentedControl` | 2–4 options that switch a view in place |

**Native on purpose.** The dropdown, keyboard model, type-ahead and mobile
pickers come from the platform — correct on every device, zero code. The cost
is that the open list cannot be styled; that trade reverses only when search
is needed, which is `SearchSelect`'s job, not a reason to rebuild this.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `Array<string \| { value, label, disabled? }>` | `[]` | Strings are shorthand. Ignored when `children` given |
| `children` | `ReactNode` | — | Escape hatch for `<optgroup>` |
| `value` / `onChange` | `string` / `(value) => void` | — | Controlled pair; uncontrolled works too |
| `placeholder` | `string` | — | A disabled, hidden `value=""` option — cannot be re-picked. A real "none" choice should be a real option |
| `invalid` | `boolean` | — | Critical border + `aria-invalid`. Pair with a visible message (`Field`'s `error`) |
| `size` | `sm \| md` | `md` | 32 / 40 — Input's scale. The export's `small`/`large` renamed to match the system |
| `fullWidth` | `boolean` | — | — |
| `className` | `string` | — | On the shell, not the `<select>` |
| `ref` | `Ref<HTMLSelectElement>` | — | The real control |

Everything else (`id`, `name`, `required`, `aria-*`) is forwarded to the
`<select>`, which is what `Field` labels when it wraps one.

## Tokens

Identical to Input by construction: `stroke.field` resting border,
`stroke.focused` ring and focus border, `accent.critical.outline` when
invalid, `surface.neutral.subtle` disabled fill. The caret is the system's
`caret-down` glyph in `text.tertiary` (7.58:1 light / 9.85:1 dark),
pointer-transparent so clicks land on the control. Value text is
`text.primary` (20.17:1 / 14.63:1). No new tokens; the contrast table in
docs/input.md covers the shared shell.

## Accessibility

- It is a `<select>`: screen readers announce role, value and option count
  natively; no ARIA is invented here.
- The accessible name comes from a `Field` label or `aria-label` — the
  placeholder is not a name.
- `invalid` sets `aria-invalid` and holds the critical border through focus.
  The message itself belongs to `Field`'s `error`.
- The open list is platform UI — do not try to theme it, and do not promise
  designs that style it.

## Don't

- **Don't rebuild this as a div-listbox for styling reasons.** The styled
  path is `SearchSelect`, and only when search is the requirement.
- **Don't use the placeholder as a "none" value.** It is unpickable once a
  choice is made; give "no selection" a real option.
- **Don't stuff hundreds of options in.** Past a few dozen, people search —
  `SearchSelect`.
- **Don't encode VCP vocabulary in options inside a component** — statuses and
  domains arrive as data from the caller (or a pattern).
