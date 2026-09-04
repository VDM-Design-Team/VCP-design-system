# Modal

A centred dialog over a dimmed backdrop: a title, a body, and a footer for
actions. It renders through a portal to `document.body`, takes the whole screen's
attention, and does not give it back until the user answers.

A Modal is the most disruptive thing in the system. It stops the task the user
was doing, it hides the page behind it from assistive tech, and it holds the
keyboard until it is dismissed. Reach for it last, not first.

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| | Modal | Popover | Toast |
|---|---|---|---|
| **Interrupts the task?** | Yes — the page stops | No — the page carries on | No |
| **Keyboard** | Trapped inside until closed | Focus moves in, Escape returns it, Tab leaves | Never takes focus |
| **Background** | Inert and scroll-locked | Live and scrollable | Live |
| **Anchored to** | The viewport, centred | The control that opened it | A screen corner |
| **Use for** | A decision that must be made now; a destructive confirmation; a short form that must be finished or abandoned | Extra detail, a filter, a menu, a picker — anything the user can walk away from | The outcome of something that already happened |
| **Don't use for** | Anything the user could reasonably ignore; anything longer than a screenful of form; nested flows | A decision with consequences | Anything needing a response |

Rules of thumb:

- **If the user can ignore it, it is not a Modal.** Confirmation of a *reversible*
  action belongs in a Toast with an undo, not in a dialog nobody reads.
- **If it has more than one step, it is a page.** Wizards, long forms and anything
  with its own navigation outgrow a dialog — the trap and the scroll lock start
  working against the user.
- **Never stack modals.** A dialog opened from a dialog means the first one asked
  the wrong question. The component survives it (the lock is counted and the
  inertness nests), but the interaction does not.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | — | **Required.** Nothing is portalled while `false`. You own this state; the dialog never closes itself |
| `onClose` | `() => void` | — | **Required.** Fires on Escape, on the close button, and on a backdrop click when `dismissible` |
| `title` | `ReactNode` | — | Rendered as a real `<h2>` and wired to `aria-labelledby`. Required **unless** you pass `aria-label` |
| `aria-label` | `string` | — | The accessible name when there is no visible `title`. Required **unless** you pass `title` |
| `description` | `ReactNode` | — | Sub-heading under the title, wired to `aria-describedby` |
| `footer` | `ReactNode` | — | Right-aligned action row in a tinted band. Usually two `Button`s |
| `size` | `sm \| md \| lg \| xl` | `md` | Max width: 384 / 512 / 640 / 800 |
| `role` | `dialog \| alertdialog` | `dialog` | `alertdialog` for a destructive confirmation. Give it a `description` |
| `dismissible` | `boolean` | `true` | `false` stops a backdrop click closing it. **Escape still works** — see Accessibility |
| `showClose` | `boolean` | `true` | The icon-only close button in the header |
| `closeLabel` | `string` | `'Close'` | Accessible name for that button |
| `initialFocusRef` | `RefObject<HTMLElement \| null>` | — | Where focus goes on open. Defaults to the panel |
| `returnFocusRef` | `RefObject<HTMLElement \| null>` | — | Where focus goes on close. Defaults to whatever had it when it opened |
| `className` | `string` | — | Merged onto the **panel** |
| `bodyClassName` | `string` | — | Merged onto the **scrolling body wrapper** |
| `children` | `ReactNode` | — | The body |
| `ref` | `Ref<HTMLDivElement>` | — | Points at the panel — the element with `role="dialog"` |

Everything else (`id`, `data-*`, …) is forwarded to the panel.

`title` and `aria-label` are a union in the type system: pass one or the other
and TypeScript is happy, pass neither and it is a compile error. There is no
unnamed Modal. `role`, `aria-modal` and `aria-labelledby` are removed from the
prop type so they cannot be overwritten by accident.

There is no `style` and no `width`. See [Deviations](#deviations-from-the-claude-design-export).

## Anatomy

```
<div>                           backdrop — fixed inset-0 · z-50 · surface.overlay · p-6 · grid place-items-center
  <div role="dialog">           surface.elevated · shadow.modal · radius.md · max-h-full · size max-width
    <header>                    px-6 pt-5 — only when there is heading text or a close button
      <h2>                      type.heading-md · text.primary          → aria-labelledby
      <p>                       type.body-sm · text.tertiary            → aria-describedby
      IconButton                icon "x" · tertiary · md (40 target) · pulled into the padding
    <div>                       px-6 py-5 · flex-1 · overflow-y-auto · tabindex 0 only while it scrolls
    <footer>                    surface.canvas · border-t stroke.default · px-6 py-4 · justify-end gap-3
```

## Tokens

| Part | Token | Utility |
|---|---|---|
| Backdrop scrim | `surface.overlay` | `bg-surface-overlay` |
| Panel surface | `surface.elevated` | `bg-surface-elevated` |
| Elevation | `shadow.modal` | `shadow-modal` |
| Radius | `radius.md` | `rounded-md` |
| Title type | `type.heading-md` | `text-heading-md` |
| Title colour | `text.primary` | `text-text-primary` |
| Description type | `type.body-sm` | `text-body-sm` |
| Description colour | `text.tertiary` | `text-text-tertiary` |
| Body colour | `text.secondary` | `text-text-secondary` |
| Footer surface | `surface.canvas` | `bg-surface-canvas` |
| Footer divider | `stroke.default` | `border-t border-stroke-default` |
| Focus ring | `stroke.focused` | `focus-visible:outline-stroke-focused` |
| Font | `font.family.sans` | `font-sans` |

Spacing rides Tailwind's numeric scale, as the system requires: `p-6` (24) around
the backdrop, `px-6` (24) through the panel, `pt-5`/`py-5` (20) at the header and
body, `py-4` (16) in the footer, `gap-3` (12) between footer actions. Never
`gap-sm` or `mb-xs` — those emit nothing here.

Widths are on that same numeric scale — `max-w-96`, `max-w-128`, `max-w-160`,
`max-w-200` — because the system has no width or size token family. See
[Token gaps](#token-gaps).

The dark theme comes for free: every colour above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`. **One caveat specific
to this component:** the dialog is portalled to `document.body`, so the `.dark`
class has to be on `<html>` or `<body>`. A `.dark` wrapper `div` inside the page
themes the page but not the dialog, because the dialog is no longer inside it.

### Contrast

| | Light | Dark |
|---|---|---|
| Title — `text.primary` on the panel | 20.17:1 | 14.63:1 |
| Body — `text.secondary` on the panel | 10.35:1 | 11.87:1 |
| Description — `text.tertiary` on the panel | 7.58:1 | 9.85:1 |
| Footer text on `surface.canvas` | 9.90:1 | 14.48:1 |

All clear 4.5:1 comfortably. The footer divider is decorative — the tint change
already separates the band — so 1.4.11 does not apply to it, exactly as in
[`docs/card.md`](./card.md#why-strokedefault-is-allowed-here).

## Accessibility

This is the whole component. A dialog that gets the focus contract wrong either
seals a keyboard user in with no way out, or leaves them stranded on a page they
can no longer see. Every clause below is implemented, not aspirational.

### The dialog announces itself

- **`role="dialog"` and `aria-modal="true"`** on the panel. `aria-modal` is what
  tells a screen reader that everything outside is off limits, which is why the
  DOM-level inertness below has to agree with it.
- **It always has an accessible name.** With a `title`, the `<h2>` gets an id and
  the panel points at it with `aria-labelledby`, so the visible heading and the
  announced name are literally the same string and cannot drift. Without one, you
  must pass `aria-label`. The type system enforces the choice — a dialog with no
  name is the single most common failure in this category, and it is not possible
  to ship one from this component.
- **`description` becomes `aria-describedby`.** For `role="alertdialog"` this is
  what makes the consequence part of the initial announcement, so a destructive
  confirmation should always have one.

### The focus contract

**On open — focus moves into the dialog, and the trigger is remembered.**
Focus lands on **the panel itself** (`tabIndex={-1}`), not on the first focusable
element. That is deliberate:

- The first focusable element is usually the close button, or — worse — the
  primary action. Landing on "Delete" means one stray Enter destroys something.
  From the panel, the first Tab is Cancel and the dangerous button is two stops
  away.
- Focusing the panel puts the screen reader's cursor at the top of the dialog, so
  the name, the description and then the content are read in order. Focusing a
  button inside jumps straight to that button and the user has to navigate
  backwards to find out what they are answering.
- The panel carries `focus:outline-none` because it is reachable only
  programmatically, never by Tab; a ring on an inert container is noise. Every
  control inside keeps its own `focus-visible` ring.

Override it with `initialFocusRef` when the dialog has exactly one obvious job —
a form whose first field the user will certainly type into. The `WithForm` story
does this. Never point it at a destructive action.

**While open — focus is trapped, and it wraps both ways.**
Tab from the last focusable element wraps to the first; Shift+Tab from the first
wraps to the last; Shift+Tab from the panel itself wraps to the last, because the
panel's "previous" is outside the dialog. The tabbable list is recomputed on
every Tab, so content that appears while the dialog is open is trapped too, and
it accounts for the awkward cases: disabled controls, `hidden`, zero-size and
`aria-hidden` elements are excluded, and a radio group counts as one stop rather
than one per radio. If a dialog somehow contains nothing focusable, Tab keeps
focus on the panel rather than letting it escape.

The handler is bound to `document` in the capture phase, not to the panel. A
listener on the panel never fires once focus has left the panel — which is
precisely the moment a trap has to work.

**Escape always closes it — including when `dismissible={false}`.**
`dismissible` guards against a *stray click* on the backdrop, which is the
accidental gesture. Escape is deliberate, it is what WAI-ARIA requires of every
dialog, and taking it away is how keyboard users get sealed in. If a decision is
so important that Escape must not dismiss it, it is not a dialog — it is a page.

**On close — the background comes back, then focus returns to the trigger.**
Whatever had focus when the dialog opened is remembered and refocused, so the
user resumes exactly where they left off. Restoring focus matters as much as
trapping it: a dialog that closes and drops focus on `<body>` sends a screen
reader user back to the top of the page with no idea what happened. Order
matters, and the cleanup does it in this order: the trap is unbound, the scroll
lock is released, the background stops being inert, and only then is the trigger
focused — a trigger inside an inert subtree cannot take focus. If the trigger has
since unmounted, pass `returnFocusRef` to name a replacement.

### The background

- **Inert, via the `inert` attribute.** Every direct child of `<body>` except the
  dialog's own portal gets `inert` while it is open. Per spec an inert subtree is
  removed from the accessibility tree *and* from the focus order, so one attribute
  does both jobs and it cannot fall out of step with `aria-modal`.
  `aria-hidden="true"` was **not** used alongside it: `aria-hidden` leaves the
  content tabbable, and the combination trips axe's `aria-hidden-focus` rule the
  moment the background contains a focusable element — which it always does,
  because the trigger is out there. Where `inert` is unsupported (Safari before
  15.5) the component falls back to `aria-hidden` and the focus trap is what keeps
  the keyboard in.
  Each dialog records exactly which nodes *it* changed and restores their previous
  values, so a second dialog opening does not un-hide what the first one hid.
- **Scroll-locked without a layout shift.** `overflow: hidden` on `<body>`, plus
  the scrollbar's width given straight back as `padding-right`, so nothing on the
  page jumps sideways when the scrollbar disappears. The page's scroll *position*
  is untouched — the content behind stays exactly where the user left it. The lock
  is counted at module level: opening a second dialog while the first is still
  unmounting (which React does routinely in StrictMode) increments rather than
  re-captures, and the original inline styles are restored only when the last
  dialog closes.
- **A scrolling body is keyboard-operable.** When the body overflows it becomes a
  tab stop so it can be scrolled with the arrow keys, which WCAG 2.1.1 requires of
  any scrollable region without focusable content. When it does not overflow it
  stays out of the tab order rather than adding a stop that does nothing.

### The rest

- **Portalled to `document.body`.** No ancestor's `overflow: hidden`,
  `transform` or stacking context can clip the dialog, and the backdrop always
  covers the viewport.
- **SSR-safe.** `document` is never read during render — the portal is created
  after mount — so the component can be imported and rendered on a server.
- **The close button is a real `IconButton`**, whose `label` is a required string,
  so it can never ship unnamed. It is `md` (40×40), not the export's 32, because
  40 is the system's minimum target and this is the primary escape hatch.
- **Backdrop clicks are click-safe.** The dialog closes only when both the
  pointer-down *and* the click landed on the backdrop, so a text selection that
  starts inside the panel and ends outside it does not throw the dialog away.
  With `dismissible={false}`, a backdrop click puts focus back on the panel rather
  than leaving the user parked on `<body>`.
- **No motion.** The system has no duration or easing tokens, so the dialog
  appears and disappears outright rather than animating with invented values.
  See [Token gaps](#token-gaps).

## Don't

- Don't hardcode colors or spacing. `className="bg-[#ffffff]"` or a `style` prop
  is a bug — add a token instead. `style` and `width` were removed from this API
  for exactly that reason.
- **Don't remove Escape.** `dismissible={false}` is for the backdrop, not the
  keyboard. There is no prop to disable Escape and there should not be.
- **Don't put initial focus on a destructive action.** `initialFocusRef` points at
  the thing the user came to do, never at "Delete".
- **Don't ship a dialog without a name.** The type system will stop you, but do
  not defeat it by passing an empty `title`.
- Don't use `dismissible` (the default) for a destructive confirmation — a stray
  click should not answer a question that deletes something.
- Don't nest or stack modals. If a dialog needs a dialog, the first one asked the
  wrong question.
- Don't put a `.dark` wrapper around the trigger and expect the dialog to follow.
  The dialog is portalled to `<body>`; the theme class belongs on `<html>` or
  `<body>`.
- Don't scroll-lock the page yourself around this component. The lock is counted
  and it will fight you.
- Don't hide the close button *and* the footer. `showClose={false}` is only safe
  when the footer carries an explicit way out.
- Don't use a Modal to report a result. That is a Toast.
- Don't put a whole workflow in one. Two steps means a page.

## Deviations from the Claude Design export

| Export | Here | Why |
|---|---|---|
| `style` prop | `className` and `bodyClassName` | Inline styles are how the export smuggled in raw `rgb()`. `npm run lint:tokens` exists to stop that |
| `width={520}` (a raw number) | `size` — `sm \| md \| lg \| xl` (384 / 512 / 640 / 800) | Widths on the numeric spacing scale, not arbitrary pixels. 520 became 512, the nearest step |
| Inline `rgb()` / `var()` fallbacks | Semantic token utilities | Components use semantic tokens only, so dark mode works for free |
| `background: rgba(2,6,23,.45)` on the backdrop | `bg-surface-overlay` | The system has a scrim token, and it flips in dark |
| `boxShadow: 0 24px 64px rgba(2,6,23,.28)` | `shadow-modal` | `shadow.modal` is that shadow, to the offset and blur |
| `borderRadius: 12` | `rounded-md` (8) | The radius scale stops at `md`. Reported, not invented |
| `zIndex: 100` | `z-50` | There is no z-index token; `z-50` is Tailwind's top default layer |
| `font: '600 18px/1.3'` on the title | `text-heading-md` | Type ramp only. 18 is not a step; `heading-md` is 20/1.3 semibold |
| `font: '400 13px/1.5'` on the description | `text-body-sm` | Same. `body-sm` is 12/16 regular |
| `borderTop: 1px solid stroke.subtle` | `border-t border-stroke-default` | Still decorative, but visible on a poor display — as in `Card` |
| `gap: 10` in the footer | `gap-3` (12) | 10 is not on the scale |
| Hand-rolled 32px close `<button>` | The real `IconButton`, `md` | 40 is the system's minimum target, and `IconButton` makes the name mandatory |
| Renders nothing but a `<div role="dialog">` in place | Portal to `document.body` | So no ancestor's `overflow: hidden` clips it and the backdrop covers the viewport |
| `open` defaults to `true` | `open` is required | A dialog that renders by default is a dialog someone forgets to control |
| `React.createElement` at runtime, `document` read on render | JSX, portal created after mount | SSR-safe |
| No accessible name, no focus management, no scroll lock, no inertness, no Escape, no backdrop dismissal | All of the above | The reason this component exists — see [Accessibility](#accessibility) |
| — | `role`, `dismissible`, `showClose`, `closeLabel`, `initialFocusRef`, `returnFocusRef` | The controls the focus contract needs to be honest about its own exceptions |

## Token gaps

Reported, not invented — nothing new was added to `tokens/` for this component.

1. **No z-index scale.** `z-50` is a Tailwind default, not a VCP token. The
   moment a second overlay exists (a Popover, a Toast, a sticky bar) their
   stacking order will be decided by whoever edits last. A `layer.*` token family
   — `layer.overlay`, `layer.modal`, `layer.toast` — is the fix.
2. **No motion tokens.** There is no `duration.*` or `easing.*`, so the dialog has
   no enter or exit transition rather than one built from invented numbers. A
   modal appearing instantly is the least bad option, but a 150ms fade on the
   scrim and a small scale on the panel is what this should be.
3. **No radius above `md`.** The scale is `sm` (6), `md` (8), `pill`. The export's
   12 has no home, so the panel reuses the button-and-card radius. A `radius.lg`
   would let a large surface read as larger.
4. **No width or size token family.** Dialog widths are a design decision the
   system does not encode, so `size` sits on Tailwind's numeric spacing scale.
   A `size.dialog.{sm,md,lg,xl}` set would make these values reviewable in Figma
   instead of buried in a `cva`.
5. **No 18/1.3 semibold step.** Between `heading-sm` (16/1.35) and `heading-md`
   (20/1.3) there is nothing at 18. `heading-md` was used unchanged.
6. **`shadow.modal` has no dark override.** A 28%-black shadow on
   `dark.surface.elevated` does almost nothing; in dark the scrim alone separates
   the panel from the page. The same gap `Card` reports for `shadow.card`.
7. **`surface.overlay` is a *light* scrim in the light theme** — slate-200 at 75%,
   which over `surface.canvas` lands around `#e8edf3`. It dims the page much less
   than the export's 45%-black did, so the separation between "in the dialog" and
   "behind the dialog" is carried mostly by the panel's shadow. It is the token the
   system has and it flips correctly in dark, so it was used as-is, but the light
   value is worth a second look.
