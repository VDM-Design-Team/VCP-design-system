# Popover

A floating panel anchored to a trigger.

It renders your trigger (cloned, so the real control keeps its own semantics) and
a panel beside it. The two are wired together — `aria-expanded` on the trigger,
`aria-controls` pointing at the panel while it is open — and the panel closes on
Escape, on a click outside, and when focus leaves it.

It is **non-modal**. The page behind it stays reachable and operable, and focus is
never trapped. If the user must deal with the panel before anything else, that is
a Modal.

## When to use which overlay

| Use | When | Focus behaviour | Dismiss |
|---|---|---|---|
| `Tooltip` | A short description of the control it is attached to. Never the only copy of anything, never interactive | Never moves | Blur, Escape |
| `Popover` | A small panel of extra content or controls attached to a trigger — a filter form, a detail card, an explanation too long for a tooltip | Stays on the trigger by default; moves in with `autoFocus` | Escape, click outside, focus leaving |
| `Menu` | A list of **actions**. If the panel's whole content is "things you can do", it is a Menu, not a Popover | **Always** moves into the list | Escape, click outside, selecting an item |
| `Modal` | The user must finish or dismiss it before doing anything else — a confirmation, a destructive step, a form that owns the screen | Moves in and is **trapped** | Escape, explicit close |

The test between Popover and Modal: can the user usefully ignore this and carry
on? If yes, Popover. If ignoring it would leave the app in a half-finished state,
Modal.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `trigger` | `ReactElement` | — | **Required, and a single element** — not a string. It is cloned to receive `id`, a ref, `aria-expanded`, `aria-controls`, `aria-haspopup` and `onClick`. Its own `onClick` still runs first, and `preventDefault()` on it stops the toggle |
| `content` | `ReactNode` | — | What the panel holds |
| `open` | `boolean` | — | Controlled state. Pair with `onOpenChange` |
| `defaultOpen` | `boolean` | `false` | Uncontrolled starting state |
| `onOpenChange` | `(open: boolean) => void` | — | Fires on every open and close, including Escape, outside click and focus leaving |
| `placement` | `top \| bottom` | `bottom` | The whole placement contract. See the positioning limits below |
| `align` | `left \| right` | `left` | Which edge of the panel lines up with the same edge of the trigger |
| `width` | `auto \| sm \| md \| lg` | `md` | 224 / 288 / 384 wide, or content-sized. A variant, not a number — see the deviations |
| `autoFocus` | `boolean` | `false` | Move focus to the first focusable element in the panel on open. See the accessibility notes before turning it on |
| `label` | `string` | — | Accessible name for the panel. Only meaningful with `panelRole`; without it the panel is named by the trigger |
| `panelRole` | `dialog \| menu \| listbox \| grid \| tree` | — | Role for the panel, which also decides the trigger's `aria-haspopup`. Leave unset for the plain disclosure case |
| `panelClassName` | `string` | — | Merged onto the panel via `cn()` |
| `panelProps` | `HTMLAttributes<HTMLDivElement>` | — | Escape hatch for a composed component's semantics on the panel. `Menu` uses it for its keyboard handler |
| `className` | `string` | — | Merged onto the wrapper via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | Points at the positioning wrapper |

Everything else (`data-*`, `onMouseEnter`, …) is forwarded to the wrapper.

### Deviations from the source export

| | Source | Here | Why |
|---|---|---|---|
| `width` | `number` (`280`) | `auto \| sm \| md \| lg` | A raw number is an untokenised pixel value inside a component. The variant maps onto Tailwind's numeric scale, which is VCP's spacing scale |
| `style` | `CSSProperties` | **removed** | Inline styles route around the token system. Use `className` / `panelClassName` |
| `trigger` | `ReactNode`, wrapped in a click-handling `<span>` | `ReactElement`, cloned | A `<span onClick>` is not focusable, has no role, and cannot carry `aria-expanded`. Cloning puts the state on the real button |
| panel semantics | bare `role="dialog"` | opt-in `panelRole`, none by default | A panel that claims `role="dialog"` while trapping nothing and moving no focus is lying to assistive tech. The plain case is a disclosure |
| — | — | added `align`, `defaultOpen`, `autoFocus`, `label`, `panelRole`, `panelClassName`, `panelProps` | `Menu` is built on this component, and needed each of them |

## Tokens

| Part | Token | Utility |
|---|---|---|
| Panel fill | `surface.elevated` | `bg-surface-elevated` |
| Panel edge | `stroke.default` | `border-stroke-default` |
| Panel shadow | `shadow.menu` | `shadow-menu` |
| Radius | `radius.md` | `rounded-md` |
| Panel text | `text.secondary` | `text-text-secondary` |
| Panel type | `type.body-md` | `text-body-md` |
| Type family | `type.font.sans` (Poppins) | `font-sans` |
| Padding, width, offset | Tailwind numeric scale — VCP's spacing scale | `p-4`, `w-56` / `w-72` / `w-96`, `mt-2` / `mb-2` |

The dark theme comes for free — every colour above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

**Token gaps** (nothing was invented; these are reported, not worked around):

- **No stacking token.** The panel uses Tailwind's `z-50`. There is no
  `zIndex.*` / `elevation.*` family in `tokens/`, so overlay layering across
  Popover, Menu, Modal and Toast is currently coordinated by convention rather
  than by the token set. That belongs in `tokens/semantic/` before a fourth
  overlay ships.
- **`shadow.menu` has no dark-theme override.** It is a dark, low-alpha shadow;
  against `surface.canvas` in dark it is nearly invisible, so the panel's edge is
  carried by `stroke.default` alone. It reads correctly, but a dark-theme
  elevation shadow would read better.
- **No overlay width scale.** `width` maps onto Tailwind's numeric widths because
  the token set has spacing and radius but no panel-size family.
- **No motion tokens.** `transition-colors` runs at Tailwind's default duration
  and easing; there is no `motion.duration.*` / `motion.easing.*` to reference.

## Accessibility

### The keyboard contract

| Key | Where | What happens |
|---|---|---|
| `Enter` / `Space` | trigger | Toggles the panel (native button activation) |
| `Escape` | anywhere while open | Closes. Focus returns to the trigger **if focus was inside the popover**; if the user had already moved on, their place is left alone |
| `Tab` / `Shift+Tab` | in the panel | Moves through the panel's own controls in DOM order. Leaving the popover closes it — the panel sits immediately after the trigger in the DOM, so this is ordinary reading order, not a trap |
| pointer outside | anywhere | Closes, and does **not** pull focus back to the trigger — the user is already where they wanted to be |

### Does focus move into the panel on open?

**No, not by default — and yes when you pass `autoFocus`.** The default is off,
and the reason is that both answers are wrong for half the cases:

- **Non-interactive content** (an explanation, a definition, a detail card).
  Moving focus onto a panel of static text puts a keyboard user somewhere with
  nothing to operate, and the only way out is a key they have to guess. Focus
  stays on the trigger, `aria-expanded` flips to announce that something opened,
  and the panel is one `Tab` away in reading order because it is rendered
  immediately after the trigger with no portal.
- **Interactive content** (a filter form, a date picker, a small set of
  controls). The panel exists so the user can operate it now, and making them
  Tab to reach what they just opened is friction with no upside. Pass
  `autoFocus` and the first focusable child gets focus, with Escape returning it
  to the trigger.

`Menu` does not take this choice — a menu **always** moves focus into the list,
because a list of actions with no keyboard entry point is a mouse feature.

### The rest

- **Focus is never trapped.** This is a non-modal surface; `Tab` walks out of it
  and the popover closes behind you. Trapping focus without a backdrop and
  without inert content is how a keyboard user gets stuck. That is Modal's job,
  and Modal does it properly.
- **The trigger is a real control.** It is cloned, not wrapped, so a `Button` or
  `IconButton` keeps its own role, focus ring, disabled handling and accessible
  name, and gains `aria-expanded` plus — while open — `aria-controls`.
  `aria-controls` is only set while the panel exists: pointing at an id that is
  not in the DOM is worse than not pointing at all.
- **`aria-haspopup` is only claimed when it is true.** A plain popover is a
  disclosure and sets none. Set `panelRole` and the matching `aria-haspopup`
  value follows automatically.
- **A panel with a role gets a name.** `label` if you give one, otherwise the
  trigger's own accessible name via `aria-labelledby`.
- **The panel is focusable as a container** (`tabIndex={-1}`, never in the tab
  order) so a click on dead space inside it does not drop focus to the body.

### Positioning — the honest limits

The panel is absolutely positioned inside a relatively positioned wrapper:
`top` or `bottom`, flush to the trigger's `left` or `right` edge. There is no
positioning library in this system and this component does not pretend to be one.

**What that means, concretely:**

- **No collision detection and no flipping.** A `bottom` popover near the bottom
  of the viewport opens off-screen. You choose the placement; nothing corrects it.
- **No shifting.** A panel wider than the space beside its trigger overflows
  rather than sliding to fit.
- **No portal.** The panel is a child of the trigger's wrapper, so any ancestor
  with `overflow: hidden`, `overflow: auto` or a transform will clip or move it.
  A Popover inside a scrolling table cell is the usual way this bites.
- **No repositioning on scroll or resize**, because it is anchored in normal
  layout rather than measured.

If you need any of those, the fix is a positioning dependency and a rewrite of
the placement layer — not a workaround in a feature. Until then: pick the
placement that fits where the trigger actually sits, keep panels small, and use
`Modal` when the content is too big to sit beside anything.

## Don't

- Don't hardcode colors or spacing. `panelClassName="bg-[#336afa]"` is a bug —
  add a token instead.
- Don't use it for a menu of actions. That is `Menu`, and it has the keyboard
  contract this does not.
- Don't use it where the user must respond before continuing. That is `Modal`.
- Don't use it as a tooltip. A Popover opens on click and stays; a description
  that appears on hover and focus is `Tooltip`.
- Don't pass a `<div>` or a bare string as the `trigger`. It has to be a real
  focusable control, or the popover cannot be opened from the keyboard.
- Don't turn on `autoFocus` for a panel of plain text — it strands the user.
- Don't nest a Popover inside a Popover. One Escape closes both, and the outer
  one clips the inner.
- Don't put a `role="dialog"` on the panel and then expect Modal behaviour. This
  component does not trap focus, does not render inert background, and does not
  lock scroll.
- Don't place one near the edge of a scrolling container and assume it will
  flip. It will not.
