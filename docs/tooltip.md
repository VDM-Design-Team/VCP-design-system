# Tooltip

A small floating label describing the element it is attached to.

It opens on hover **and on keyboard focus**, wires the trigger to the bubble with
`aria-describedby`, stays visible while the pointer travels onto it, and closes
on Escape. Those four behaviours are the whole component — everything else is a
`div` with a dark background.

A tooltip is the most-misused overlay in any design system, and every misuse is
the same one: putting something in it that exists nowhere else. Start with the
"Don't" list.

## Composed of

Nothing from the system — this piece renders its own markup and takes
composition through its props/slots. `npm test` fails if that changes
without this section changing.

## When to use which

| Use | When | Why |
|---|---|---|
| **Inline helper text** (`Field`'s `helper`) | The information is needed *before* the user acts — a format, a constraint, a unit, a rule | It is always visible, on every device, to every user. This is the right answer far more often than a tooltip |
| **`Tooltip`** | A short, secondary label on a control whose meaning is already carried by its own name — a keyboard shortcut, a timestamp, a "why is this disabled" hint on the *wrapper* | Reclaims space for something a user can afford to miss. Nothing more |
| **`Popover`** *(not built yet)* | The content has a link, a button, a form field, or is longer than a couple of lines | A tooltip cannot hold interactive content: it closes on blur, so the user can never reach what is inside it |
| **`Badge` / visible text** | The information distinguishes one row or item from another | If a user has to hover each row to tell them apart, the table is broken |

The test: **if a touch user never saw this, would anything be lost?** If yes, it
is not a tooltip. Put it on the page.

### Tooltip vs Popover, precisely

| | Tooltip | Popover |
|---|---|---|
| Role | `tooltip` | `dialog` |
| Wiring | `aria-describedby` on the trigger | `aria-expanded` / `aria-controls` |
| Opens on | hover **and** focus | click / Enter / Space |
| Contains | text only | anything, including focusable content |
| Focus | never moves | may move into it |
| Closes on | blur, mouse-out, Escape | Escape, outside click, explicit close |

If you find yourself wanting a link in a tooltip, you want a Popover. This system
does not ship one yet — until it does, put the content on the page.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `content` | `ReactNode` | — | **Required.** The description. Text, or light markup for emphasis and line breaks. **Never interactive** |
| `children` | `ReactElement` | — | **Required.** Exactly one element, and it must be focusable. It is cloned to receive `aria-describedby` |
| `placement` | `top \| bottom \| left \| right` | `top` | Static offsets. No collision detection, no flipping — see below |
| `openDelay` | `number` (ms) | `300` | Hover only. **Focus is always immediate** |
| `defaultOpen` | `boolean` | `false` | Renders it already open. For Storybook, screenshots and visual regression — not a way to pin one open in product |
| `tooltipId` | `string` | auto (`useId`) | Override the generated id of the bubble. Rarely needed |
| `className` | `string` | — | Merged onto the wrapper `<span>` via `cn()`. This replaces the source component's `style` prop |
| `ref` | `Ref<HTMLSpanElement>` | — | Points at the wrapper `<span>`, not the trigger |

Everything else (`data-*`, `onClick`, …) is forwarded to the wrapper `<span>`.
`onMouseEnter`, `onMouseLeave`, `onFocus` and `onBlur` are called before the
tooltip's own handling, so you can observe them without breaking the component.

There is no `variant` and no `size`. A tooltip has one appearance; a second one
would only ever be used to make a tooltip look like something it is not.

## Positioning — read this before choosing a placement

**There is no positioning library here, and the limitation is real:**

- **No collision detection and no flipping.** Each placement is a fixed CSS
  offset off the trigger. A `top` tooltip near the top of the viewport, or a
  `left` one on a control at the left edge, will overflow — it will not flip to
  the opposite side. Pick the side with room, and pick it per usage.
- **No portal.** The bubble is a DOM child of the wrapper, so any ancestor with
  `overflow: hidden` or `overflow: auto` will clip it. Inside a scrolling table
  cell or a card with clipped corners, expect it to be cut off.
- **No arrow.** The gap and the proximity carry the association; a CSS triangle
  would need a background colour set twice and would not survive a theme flip.
- **No repositioning on scroll or resize.** It is anchored in normal flow, so it
  moves with the trigger — which is the one thing this approach gets right for
  free.

If a screen genuinely needs flipping and collision handling, that is a real
positioning engine and a system-level decision, not a local fix.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Bubble surface | `surface.neutral.stronger` | `bg-surface-neutral-stronger` |
| Bubble text | `text.inverted.primary` | `text-text-inverted-primary` |
| Type | `type.body-sm` (12/16, 400, Poppins) | `text-body-sm` |
| Radius | `shape.radius.sm` (6) | `rounded-sm` |
| Padding | Tailwind numeric scale | `px-2.5 py-1.5` |
| Offset from trigger | Tailwind numeric scale | `pb-2` / `pt-2` / `pr-2` / `pl-2` |
| Max width | Tailwind numeric scale | `max-w-64` |
| Shadow | `shadow.menu` | `shadow-menu` |

### Measured contrast

An inverted surface is exactly where dark theme goes wrong, so these are measured
off the rendered component, not off the token file.

| Theme | Text | Surface | Ratio | AA (4.5:1) |
|---|---|---|---|---|
| Light | `text.inverted.primary` `#ffffff` | `surface.neutral.stronger` `#334155` | **10.35:1** | pass |
| Dark | `text.inverted.primary` `#020617` | `surface.neutral.stronger` `#e2e8f0` | **16.36:1** | pass |

The bubble also has to be distinguishable from what it floats over, which is why
it carries no border:

| Theme | Bubble vs `surface.canvas` | Bubble vs `surface.elevated` |
|---|---|---|
| Light | 9.90:1 | 10.35:1 |
| Dark | 14.48:1 | 11.87:1 |

Both clear the 3:1 non-text minimum several times over, so `stroke.inverse` is
not needed here — adding it would be decoration, and in light theme
`stroke.inverse` is `#ffffff`, which would draw a white hairline round a dark
bubble for no reason.

**Why this pair and not something else.** `surface.neutral.stronger` is the only
surface in the system that inverts in both directions: dark slate in light theme,
pale slate in dark theme. It is also the only one that pairs cleanly with the
existing `text.inverted.*` family, which flips the same way. `surface.brand.stronger`
also inverts and also clears AA (13.23:1 / 13.69:1), but a blue tooltip reads as a
brand statement rather than as an annotation, and it would collide with
`Button variant="primary"` sitting underneath it.

### Token gaps

Nothing was invented. These are the gaps found, each papered over with the
closest existing token:

1. **No `surface.inverse`.** `text.inverted.*` and `stroke.inverse` both exist,
   but there is no matching inverted *surface*, which is the one an inverted
   component actually needs. `surface.neutral.stronger` does the job and inverts
   correctly, but it is named for its position on the neutral ramp, not for its
   intent — so nothing stops it being re-tuned for some other use and quietly
   changing every tooltip. A `surface.inverse` alias pointing at the same core
   value would close this.
2. **No motion tokens.** There is no `motion.duration.*` or `motion.easing.*`
   family, so the fade uses Tailwind's `duration-150` and the hover delay is a
   constant in the component (`300`). Both are documented in the source, but
   neither is a token and neither is shared with any other component.
3. **No z-index scale.** `z-50` is a Tailwind default. Once Modal, Popover and
   Toast land, they will need a layering token family or they will fight.
4. **No dark-theme shadow.** `shadow.menu` is built from a near-black at 18%
   alpha and has no `.dark` override, so on a dark canvas it contributes almost
   nothing. The bubble does not depend on it — the 14.48:1 separation carries the
   edge — but the shadow ramp is a system-wide gap.
5. **No content max-width token.** `max-w-64` is Tailwind's numeric scale. A
   `size.content.tooltip` would make the wrap point a system decision rather than
   a component one.

## Accessibility

This is the section that matters. A tooltip is easy to build and easy to build
in a way that helps nobody.

- **It must never be the only place information exists.** It cannot be reached by
  touch — there is no hover on a touchscreen, and a tap fires the control instead
  — and it disappears the moment attention moves. Anything a user needs in order
  to act belongs in the page. This is the first item on the "Don't" list because
  it is the failure that no amount of correct ARIA fixes.

- **It opens on keyboard focus, not only on hover.** A hover-only tooltip is
  invisible to every keyboard user and to every screen-reader user, which is the
  single most common failure in this component's category. `onFocus`/`onBlur` are
  wired on the wrapper — React maps them to `focusin`/`focusout`, so they bubble
  from the trigger — and focus opens the tooltip with **no delay at all**. See
  "Delays" below.

- **The trigger is wired with `aria-describedby`.** `role="tooltip"` on its own
  announces nothing: without an association, no assistive technology has any
  reason to read the element. The component clones the single child and sets
  `aria-describedby` to the bubble's id, merging with any value the child already
  had. Both halves are present — `role="tooltip"` **and** the association — and
  neither is useful without the other.

- **The bubble is never removed from the accessibility tree.** The closed state is
  `opacity-0`, not `hidden`, `display: none` or `visibility: hidden`, all three of
  which strip the element out of the tree and would leave `aria-describedby`
  pointing at nothing. The description is therefore available to a screen reader
  on focus whether or not the bubble is visually showing, which is the correct
  behaviour for a *description*.

- **Escape dismisses it (WCAG 2.1 §1.4.13, "Dismissible").** The listener is on
  the document, not on the wrapper, because a hover-triggered tooltip has no focus
  anywhere near it and a keydown would never reach the wrapper. Focus does not
  move when it closes. Propagation is stopped **only** when the key came from
  inside this tooltip's own trigger — that is the case the APG describes, where
  Escape belongs to the tooltip and should not also close the dialog behind it.
  When the tooltip is merely hovered and focus is elsewhere, the event is passed
  through: swallowing a modal's Escape because a tooltip happens to be showing
  across the screen would be worse than the thing it fixes.

- **It stays visible while the pointer moves onto it (§1.4.13, "Hoverable").**
  The gap between trigger and bubble is *padding on the positioner*, not a margin
  or a `top`/`left` offset — so the space between the two is part of the
  positioner's own hit area and sits inside the wrapper's subtree. There is no
  dead zone in the middle to fire `mouseleave` halfway across, and a long
  description can actually be read. `pointer-events` is disabled only while the
  tooltip is closed.

- **Delays: 300ms on hover, zero on focus.** A tooltip that fires the instant the
  pointer touches a control turns a sweep across a toolbar into a strobe; 300ms is
  the point where a pause reads as intent rather than as travel. None of that
  applies to the keyboard: a user who has tabbed to a control has already
  committed, and a delay there is a delay on the only route they have to the
  content. `openDelay` is not applied to focus at all, and cannot be.

- **Focus opening is gated on `:focus-visible`.** A mouse click on a button also
  focuses it, and without the gate the tooltip would stay pinned open under the
  pointer after every click. Keyboard focus always matches `:focus-visible`, so
  the keyboard route is untouched. If the browser cannot evaluate the selector the
  component opens anyway — failing towards showing it is the safe direction.

- **Never put interactive content in a tooltip.** No links, no buttons, no fields.
  The tooltip closes on blur, so a user tabbing towards the link inside it
  destroys the thing they were reaching for; and a mouse user has to keep the
  pointer inside a bubble that a mouse-out kills. If it needs interaction it is a
  Popover, full stop. `content` is a `ReactNode` for `<strong>` and line breaks,
  not for controls.

- **Do not put a tooltip on a disabled control.** A `disabled` button does not
  receive focus and does not fire pointer events, so both routes into the tooltip
  are closed — the explanation of *why* the control is disabled becomes the one
  thing the user cannot read. Two workarounds, in order of preference:
  1. **Do not disable it.** Leave it enabled and explain the failure when it is
     pressed, or state the precondition in visible text beside it. This is almost
     always the better product answer.
  2. **Keep the button enabled but inert** — `aria-disabled="true"` plus a no-op
     `onClick`. It stays focusable, so the tooltip works, and assistive technology
     still announces it as disabled.

  Wrapping a disabled button in an extra hover target is *not* a workaround: it
  restores the mouse route and leaves the keyboard route just as broken.

- **On an `IconButton`, watch the double announcement.** `IconButton` requires
  `label`, and that is already the control's accessible name. A tooltip repeating
  it makes a screen reader say the same words twice — once as the name, once as
  the description. Give the tooltip something the name does not have:

  ```tsx
  /* Good — the tooltip adds; the name identifies. */
  <Tooltip content="Delete — this cannot be undone">
    <IconButton icon="trash" label="Delete deliverable" />
  </Tooltip>

  /* Bad — name and description are the same string. */
  <Tooltip content="Delete deliverable">
    <IconButton icon="trash" label="Delete deliverable" />
  </Tooltip>
  ```

  If the only thing you want to show on hover is the button's own name, **drop the
  Tooltip**: `IconButton` already sets `title` from `label` and the browser draws a
  native tooltip for free.

  **Known conflict.** That same `title` is why an `IconButton` inside a `Tooltip`
  currently shows *two* bubbles on a slow hover — this component's, then the
  browser's native one a second later. `IconButton` removes `title` from its prop
  type, so a caller cannot suppress it. Closing this needs a change to
  `IconButton` (skip `title` when the button already carries an
  `aria-describedby`), which is outside this component. Until then, prefer a
  labelled `Button` where the extra bubble would be distracting.

- **The trigger must be focusable.** Wrapping a `<span>` or an `<svg>` gives you a
  tooltip that only a mouse can ever reach. Wrap a `Button`, an `IconButton`, a
  link, or an input. If you need one on static text, that text needs to become a
  real control first — or the information needs to be inline, which it probably
  did all along.

- **Contrast is measured, not assumed.** 10.35:1 in light and 16.36:1 in dark, both
  against the component's own background. See the token table.

- **Motion is respected.** The fade is `transition-opacity duration-150` with
  `motion-reduce:transition-none`, so a user with reduced-motion preferences gets
  an instant show and hide rather than no tooltip at all.

## Don't

- **Don't put anything in a tooltip that isn't also available elsewhere.** It is
  unreachable on touch, invisible in print and in search, and gone the moment
  attention moves. If losing it would cost the user anything, it does not belong
  here. Every other item on this list is a detail; this one is the component.
- Don't use one to explain what a control does when a visible label would fit.
  Space is rarely as tight as it feels during design.
- Don't put a link, a button, or a form field inside one. That is a Popover.
- Don't put a tooltip on a `disabled` control — neither hover nor focus reaches
  it. See the workarounds above.
- Don't repeat an `IconButton`'s `label` as the tooltip content; it announces
  twice.
- Don't wrap a non-focusable element. A tooltip only a mouse can open is a tooltip
  most people never see.
- Don't hardcode colours or spacing. `className="bg-[#0e0a49]"` is a bug — add a
  token instead.
- Don't reach for `defaultOpen` in product. It is for Storybook and screenshots;
  a tooltip that is always open is a caption, and a caption should be real text.
- Don't write a paragraph. Past two or three lines the content is body copy, and
  body copy belongs on the page.
- Don't set a long `openDelay` to "reduce noise". If tooltips are noisy there are
  too many of them.
- Don't use one inside a container with `overflow: hidden` and expect it to
  escape — there is no portal, so it will be clipped.
- Don't assume a placement will flip near a viewport edge. It will not; choose the
  side with room.
- Don't put status or error information in one. Those need a live region and a
  visible, persistent home.
