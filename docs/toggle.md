# Toggle

An on/off switch. Flipping it **is** the action — the change commits immediately.

## When to use

| Control | Use for | Commits |
|---|---|---|
| `Toggle` | A setting that takes effect the moment it is flipped — "Email notifications", "Dark mode", "Maintenance mode" | Immediately, on change |
| `Checkbox` | A value inside a form that is only applied when the form is submitted — "I agree to the terms", multi-select filters | On Save / Submit |

Rules of thumb:

- If the screen has a **Save** button and the switch's value is part of that save, it is a Checkbox, not a Toggle.
- If flipping it fires a network request on the spot, it is a Toggle.
- A Toggle is always binary and always has a default. If "unset" is a real third state, use a `Select` or a radio group.
- Never use a Toggle to answer a question ("Do you want a receipt?") — label it as the *state* it controls ("Email receipts"), not as a question.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `checked` | `boolean` | — | Controlled state. Omit it and the Toggle owns its own state. |
| `defaultChecked` | `boolean` | `false` | Starting state when uncontrolled. Ignored if `checked` is passed. |
| `onChange` | `(checked: boolean) => void` | — | Receives the **next** boolean, not the event. |
| `disabled` | `boolean` | `false` | |
| `label` | `ReactNode` | — | Visible label. Clicking it toggles. Without one, `aria-label` is required. |
| `className` | `string` | — | Merged onto the `<label>` wrapper, not the hidden `<input>`. |
| `style` | `CSSProperties` | — | Applied to the `<label>` wrapper. |

Everything else (`id`, `name`, `value`, `required`, `aria-*`, `data-*`) is forwarded to the
underlying `<input>`. `ref` points at that `<input>`.

## Tokens

| Part | State | Token |
|---|---|---|
| Track | on | `action.primary.surface.default` (hover `…surface.hover`) |
| Track | off | `surface.neutral.strong` (hover `surface.neutral.stronger`) |
| Track | on + disabled | `action.primary.surface.disabled` |
| Track | off + disabled | `surface.neutral.medium` |
| Knob | all | `surface.elevated` + `shadow.card` |
| Radius | track + knob | `radius.pill` |
| Label | default | `type.body-md`, `text.secondary` |
| Label | disabled | `type.body-md`, `text.disabled` |
| Focus ring | keyboard focus | `stroke.focused`, 2 wide, 2 offset |

The off track is deliberately **not** the light grey the Claude Design export used
(`surface.neutral.medium`, slate-300). That value sits at 1.48:1 against `surface.base` —
below the 3:1 that CLAUDE.md requires for UI, which would make "off" indistinguishable
from the page. `surface.neutral.strong` is the lightest neutral in the system that clears
it: 4.76:1 on `surface.base` and 4.55:1 on `surface.canvas` in light, 9.85:1 / 12.02:1 in dark.

## Accessibility

- The control is a real `<input type="checkbox" role="switch">`, visually hidden inside the
  `<label>`. Screen readers announce it as a switch that is on or off.
- **Keyboard:** `Tab` to focus, `Space` to flip — both native to the checkbox. There is no
  custom key handling to get out of sync with the visual state.
- **Label association is native.** The `<input>` and the label text share one `<label>`
  element, so clicking the text toggles the switch. No `htmlFor`/`id` wiring needed.
  With no `label`, pass `aria-label` (or `aria-labelledby`, as the settings-row story does).
- **State is not signalled by colour alone.** The knob **position** — left for off, right for
  on — is a shape/position cue that survives greyscale, low vision, and every form of colour
  blindness. The track colour is reinforcement, not the signal. Never remove the travel
  animation in a way that leaves both states at the same position.
- **Touch target.** The track is 40 x 24, which is under the 40 minimum on the vertical axis.
  The `<label>` carries `p-2` (8 on every side), making the interactive box 56 x 40 — and the
  whole padded box, not just the pill, is clickable. That padding is intentional: to sit a
  Toggle flush against a container edge, pull it back with a negative margin (`-mr-2`) rather
  than removing the padding.
- **Focus ring** is `outline-stroke-focused` at 2 with 2 offset, drawn on the pill via
  `peer-focus-visible` even though focus technically lives on the hidden input. It appears for
  keyboard focus only, not for clicks. Never remove it.
- Transitions are wrapped in `motion-reduce:transition-none`.
- Disabled tracks fall below 3:1 by design. WCAG 1.4.11 exempts inactive controls, and the
  low contrast is the affordance that says "you can't change this".

## Don't

- Don't hardcode colors or spacing. `className="bg-[#336afa]"` is a bug — add a token instead.
- Don't use a Toggle for a value that needs a Save. That's a Checkbox.
- Don't put a Toggle behind a confirmation dialog. If the action needs confirming, it is not
  immediate, so it is not a Toggle — use a Button.
- Don't add "On"/"Off" text next to the switch as the *only* state indicator, and don't change
  the label text between states — the label names the setting, the knob names the state.
- Don't rebuild this on a `<div onClick>`. You lose Space, the label association, and the
  disabled semantics.
- Don't strip the wrapper's padding to make the control smaller — that breaks the touch target.
- Don't use `disabled` to communicate "you lack permission" without saying so somewhere the
  user can read. A dead switch with no explanation is a dead end.
