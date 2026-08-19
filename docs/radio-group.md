# RadioGroup

A set of mutually exclusive options, each with a label and an optional hint line.

## When to use

| Use | When | Instead of |
|---|---|---|
| `RadioGroup` | 2–7 options that must all be visible and comparable, especially when each needs a hint line | — |
| `SegmentedControl` | 2–4 short, mutually exclusive options that switch a *view* immediately (filters, tabs-in-place) — no hints, no submit step | RadioGroup |
| `Select` | More than ~7 options, or the list is long/searchable/dynamic and comparison doesn't matter | RadioGroup |
| `Checkbox` group | The choices are **not** mutually exclusive | RadioGroup |
| `Switch` | A single on/off setting that applies immediately | A two-option RadioGroup |

Rules of thumb: a RadioGroup always has exactly one answer, so give it a sensible
`defaultValue` rather than shipping an empty group. If an option needs more than
a hint line to explain it, you want a card-style chooser, not this component.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `Array<string \| RadioOption>` | `[]` | A plain string is shorthand for `{ value: s, label: s }` |
| `value` | `string` | — | Pass it to run controlled; omit for uncontrolled |
| `defaultValue` | `string` | — | Initial selection when uncontrolled |
| `onChange` | `(value: string) => void` | — | Fires in both controlled and uncontrolled mode |
| `name` | `string` | `useId()` | Shared radio `name`. Generated so two groups on a page never bleed into each other |
| `label` | `ReactNode` | — | Rendered as the `<legend>`. Always supply one |
| `hideLabel` | `boolean` | `false` | Keeps the legend for screen readers, hides it visually (`sr-only`) |
| `orientation` | `vertical \| horizontal` | `vertical` | `horizontal` only for short labels with no hints |
| `disabled` | `boolean` | `false` | Disables the whole group via the `<fieldset>` |
| `className` | `string` | — | Applied to the `<fieldset>` |

`RadioOption` is `{ value: string; label: ReactNode; hint?: ReactNode; disabled?: boolean }`.

## Tokens

| Part | Token / utility |
|---|---|
| Ring, unselected | `border-stroke-stronger` on `bg-surface-elevated` |
| Ring, hover (unselected) | `border-stroke-brand-strong` |
| Ring, selected | `border-action-primary-surface-default` (hover: `…-hover`) |
| Selected dot | `bg-action-primary-surface-default` |
| Selected dot, disabled | `bg-action-primary-surface-disabled` |
| Ring, disabled | `border-stroke-subtle` on `bg-surface-neutral-faint` |
| Focus ring | `outline-stroke-focused`, 2px, 2px offset |
| Legend | `text-label-md` / `text-text-primary` |
| Option label | `text-body-md` / `text-text-primary` |
| Hint | `text-caption-md` / `text-text-tertiary` |
| Label / hint, disabled | `text-text-disabled` |
| Radius | `rounded-pill` (control), `rounded-md` (nothing else) |

All colour comes from semantic tokens, so the dark theme (`.dark`) works for free.

## Accessibility

- **Real radios.** Each option is an `<input type="radio">` sharing one `name`.
  Arrow keys move and select within the group, Space selects, and the browser
  gives the group a **single tab stop** (the checked radio, or the first enabled
  one when nothing is checked) — no hand-rolled roving `tabindex`.
- **`<fieldset>` + `<legend>`, not `role="radiogroup"`.** The native pair labels
  the group without ARIA, is what assistive tech has supported longest, and makes
  `disabled` cascade to every control for free. `role="radiogroup"` +
  `aria-labelledby` would need a separately managed id and its own disabled
  plumbing for no benefit here. When there is no visible group label, pass
  `hideLabel` — the legend stays in the accessibility tree via `sr-only`.
- **Hints are associated,** not just adjacent: each hint gets a generated id and
  the input points at it with `aria-describedby`, so screen readers announce
  "Growth, up to 25 seats…" rather than dropping the hint.
- **Generated `name`.** Omitting `name` falls back to React's `useId`, so two
  groups rendered on one page stay independent.
- **Focus.** `focus-visible:outline-stroke-focused` at 2px with 2px offset sits on
  the input itself — the input *is* the visual control (`appearance-none` plus a
  token border), so focus is never faked on a proxy element. Never remove it.
- **Target size.** Each row is a `<label>` with `min-h-10` and `py-2`, so the whole
  row — control, label, and hint — is a 40-unit-tall click/tap target, even though
  the ring itself is 16.
- **Contrast.** Unselected ring `stroke-stronger` is 7.5:1 on light and 9.9:1 on
  dark (3:1 required). Selected ring/dot `action.primary.surface.default` is 6.1:1
  light / 3.9:1 dark. Label text is `text.primary` (≥15:1) and hint text is
  `text.tertiary` (10.3:1 light, ≥9:1 dark) — both clear of 4.5:1.
- **Wrapping labels.** The control sits in a fixed 20-unit box matching the
  `body-md` line height, so it stays aligned with the *first* line of a long label
  instead of drifting to the middle.

## Don't

- Don't hardcode colours or spacing. `className="bg-[#336afa]"` is a bug — add a token instead.
- Don't use a RadioGroup for a yes/no toggle that applies immediately — that's a Switch.
- Don't ship a group with nothing selected unless "no answer" is genuinely meaningful; give it a `defaultValue`.
- Don't use `orientation="horizontal"` with hints or long labels — the rows stop scanning as a set.
- Don't disable an option without explaining why; put the reason in its `hint`.
- Don't render two groups with the same explicit `name` on one page — they will fight over one selection.
- Don't drop the `label`/`legend`. An unlabelled group is announced as a bare list of radios.
