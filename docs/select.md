# Select

A choice from a fixed list, on the native `<select>`. The shell is `Input`'s;
the popup is the platform's.

## When to use

| Use | For |
|---|---|
| `Select` | A handful to a few dozen known options |
| `SearchSelect` | Long or rich lists that need search, several picks, groups or avatars |
| `RadioGroup` | ≤5 options worth seeing all at once |
| `SegmentedControl` | 2–4 options that switch a view in place |

**Native on purpose.** The dropdown, keyboard model, type-ahead and mobile
pickers come from the platform — correct on every device, zero code. The cost
is that the open list cannot be styled; that trade reverses only when search
is needed, which is `SearchSelect`'s job, not a reason to rebuild this.

## Decision — the field matches `SearchSelect`; the open list stays the browser's

Settled in October 2026. If you are tempted to change it, read the reasons first.

- **The field is brought in line with `SearchSelect`'s**, so a form that mixes the two looks like one
  family: the placeholder is `text.subtle` in regular weight, a chosen value is `text.primary` in
  medium, the shell, caret and focus are shared, and an `error` message can sit under it. All of this
  is CSS and an optional prop; the element is still a plain `<select>`.
- **The open list is not styled to match `SearchSelect`'s panel, and should not be.** A `<select>`'s
  popup is drawn by the browser. CSS can only recolour its options (and not even that on every
  platform), never reshape it. Making `Select` render `SearchSelect`'s panel instead would turn it into a
  different element: `ref` would no longer be an `HTMLSelectElement`, `name` and form submission would
  need hidden inputs, `defaultValue` and the `change` event would change, and phones would lose their
  native pickers. That is a breaking change, and it throws away the reasons to use `Select`.
- **So the choice is the dev's, and it is one prop on the other component.** Want the browser's
  popup, native pickers and form behaviour for free? `Select`. Want the styled panel (or search, groups,
  avatars, tags)? `SearchSelect`, which works as a plain single select with `searchable={false}`.
  Do not grow a `styled` flag on `Select`; that is `SearchSelect`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `Array<string \| { value, label, disabled? }>` | `[]` | Strings are shorthand. Ignored when `children` given |
| `children` | `ReactNode` | — | Escape hatch for `<optgroup>` |
| `value` / `onChange` | `string` / `(value) => void` | — | Controlled pair; uncontrolled works too |
| `placeholder` | `string` | — | A disabled, hidden `value=""` option — cannot be re-picked. A real "none" choice should be a real option |
| `invalid` | `boolean` | — | Critical border + `aria-invalid`. Pair with a visible message (`Field`'s `error`, or this component's own `error`) |
| `error` | `ReactNode` | — | A message under the select in the critical colour (`accent.critical.outline.content`, as `Field`'s). Implies `invalid` and is announced with the select (`aria-describedby`, merged with any a `Field` set). **Inside a `Field`, use the `Field`'s `error`, not both** |
| `size` | `sm \| md` | `md` | 32 / 40 — Input's scale. The export's `small`/`large` renamed to match the system |
| `fullWidth` | `boolean` | — | — |
| `className` | `string` | — | On the shell, not the `<select>` |
| `ref` | `Ref<HTMLSelectElement>` | — | The real control |

Everything else (`id`, `name`, `required`, `aria-*`) is forwarded to the
`<select>`, which is what `Field` labels when it wraps one.

## Tokens

Identical to Input by construction: `stroke.strong` resting border,
`stroke.focused` ring and focus border, `accent.critical.outline` when
invalid, `surface.neutral.subtle` disabled fill. The caret is the system's
`caret-down` glyph in `text.tertiary` (7.58:1 light / 9.85:1 dark),
pointer-transparent so clicks land on the control.

| Part | Token | Contrast, light / dark |
|---|---|---|
| Placeholder (nothing chosen) | `text.subtle`, regular weight (`body-sm-regular`; `caption-md-regular` at `sm`) | 4.76 / 5.71 |
| Chosen value | `text.primary`, medium weight (`body-sm-medium`; `caption-md-medium` at `sm`) | 20.17 / 14.63 |
| Option text in the popup | `text.primary` on `surface.elevated` (where the browser honours it) | 20.17 / 14.63 |
| Option group label | `text.tertiary` | 7.58 / 9.85 |
| Error message | `accent.critical.outline.content`, `caption-md-medium` | as `Field`'s |

The placeholder grey is applied with `:has(option[value=""]:checked)` on the `<select>`, because a native
select shows its placeholder as the selected option. No new tokens; the contrast table in docs/input.md
covers the shared shell.

## Accessibility

- It is a `<select>`: screen readers announce role, value and option count
  natively; no ARIA is invented here.
- The accessible name comes from a `Field` label or `aria-label` — the
  placeholder is not a name.
- `invalid` sets `aria-invalid` and holds the critical border through focus.
  The message itself belongs to `Field`'s `error`.
- With `error`, the message is tied to the select with `aria-describedby` and the border and text turn
  critical; colour is never the only signal, because the message says what is wrong.
- The open list is platform UI — do not try to theme it, and do not promise
  designs that style it. The option colours set here are a best effort: Chromium on Windows and Linux
  and Firefox honour them, while Safari and macOS Chrome draw their own menu.

## Don't

- **Don't rebuild this as a div-listbox for styling reasons, and don't add a `styled` prop.** The styled
  panel is `SearchSelect` (with `searchable={false}` for a plain single select). See the Decision above.
- **Don't use the placeholder as a "none" value.** It is unpickable once a
  choice is made; give "no selection" a real option.
- **Don't stuff hundreds of options in.** Past a few dozen, people search —
  `SearchSelect`.
- **Don't encode VCP vocabulary in options inside a component** — statuses and
  domains arrive as data from the caller (or a pattern).
