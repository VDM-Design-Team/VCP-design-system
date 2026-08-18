# SegmentedControl

A small set of mutually exclusive options, all visible at once.

## When to use

| Situation | Use | Why |
|---|---|---|
| Switching how the same content is shown (List / Board / Calendar) | **SegmentedControl** | The content doesn't change, only its shape |
| Moving between different content (Overview / Activity / Files) | `Tabs` | Each option owns its own panel |
| Two states, on or off | `Toggle` | A control with two segments is a switch wearing a costume |
| More than five options | `Select` | Labels crowd; the control stops being scannable |
| A filter that can be cleared | `Chip` | A segmented control always has exactly one option chosen |

Two to five options. Every option must be short enough to read at a glance —
if you need more than about two words per segment, the wrong control is being used.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `Array<string \| SegmentedControlOption>` | — | A bare string is shorthand for `{ value, label }` |
| `value` | `string` | — | Controlled selection |
| `defaultValue` | `string` | first enabled option | Uncontrolled starting selection |
| `onChange` | `(value: string) => void` | — | Fires on click and on arrow-key movement |
| `size` | `sm \| md` | `md` | `sm` only where a pointer is guaranteed — see Accessibility |
| `fullWidth` | `boolean` | `false` | Stretches to the container; segments share the width evenly |
| `aria-label` | `string` | — | Required unless you pass `aria-labelledby` |

`SegmentedControlOption` is `{ value, label, disabled?, 'aria-label'? }`.
Set `aria-label` on an option whose `label` isn't plain text.

## Tokens

| Part | Token |
|---|---|
| Track | `surface.neutral.subtle`, `radius.md` |
| Selected segment | `surface.elevated`, `text.primary`, `shadow.card`, `radius.sm` |
| Unselected label | `text.tertiary` → `text.primary` on hover |
| Disabled label | `text.disabled` |
| Focus ring | `stroke.focused` at 2px |
| Type | `type.label-md` (`sm`) / `type.label-lg` (`md`) |

No new tokens were added for this component.

## Accessibility

- **Roving tab stop.** The whole control is one stop in the tab order. `←`/`↑` and
  `→`/`↓` move between segments and select as they go; `Home` and `End` jump to the
  ends. Disabled segments are skipped.
- **Target size.** A `md` segment is 40px tall, meeting the 40px minimum. A `sm`
  segment is 32px — use it only where a pointer is guaranteed (dense desktop
  toolbars, table headers), never on a touch surface.
- **The selected segment is carried by more than its background.** The selected
  label darkens from `text.tertiary` to `text.primary` and gains weight. This is
  deliberate: the white selected surface sits at only **1.1:1** against the track
  in light theme and 1.4:1 in dark, so the surface alone would not satisfy WCAG
  1.4.11. The label change does — 6.9:1 against the track, 20:1 on the selected
  surface — and the weight shift adds a non-colour cue on top. If you want the
  selected *surface* itself to clear 3:1, that needs a new token; raise it with
  the design lead rather than reaching for an arbitrary class.
- **Contrast, light / dark:** selected label 20.2:1 / 14.6:1, unselected label
  6.9:1 / 7.0:1, focus ring 5.6:1 / see note below.
- **Dark-theme focus ring is currently below 3:1** (`stroke.focused` was not
  inverted for dark). This affects every component including Button and is tracked
  separately — it is not specific to this control.
- The group is a `radiogroup`; each segment is a `radio` with `aria-checked`.
  Screen readers announce "2 of 3".

## Don't

- Don't use it as a tab bar. If choosing an option loads different content, that's `Tabs`.
- Don't ship it without `aria-label` — "radio group" with no name is what a screen reader will say.
- Don't allow zero selected. There is always exactly one.
- Don't put more than five segments in it, and don't let a label wrap.
- Don't hardcode colours or spacing. `className="bg-[#f1f5f9]"` is a bug — add a token instead.
