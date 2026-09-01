# Toast

A transient message that appears, says one thing, and goes away. A Toast
interrupts nothing: it takes no focus, blocks nothing, and the user is never
required to deal with it.

## When to use Toast, Banner, or Modal

The three differ on one axis — **how much of the user's attention you are
entitled to** — and everything else follows from it.

| | `Toast` | `Banner` | `Modal` |
|---|---|---|---|
| Lifetime | **Transient.** Goes away on its own | **Persistent.** Stays until dismissed or the condition clears | Until the user closes it |
| Position | Floats over the page, in a fixed viewport | In the layout; pushes content down | Over the page, on a scrim |
| Interrupts? | No. Nothing is blocked | No. Nothing is blocked | **Yes.** The page behind is inert |
| Takes focus? | **Never** | No | **Always**, and traps it |
| If it is missed | Nothing is lost | Impossible to miss — it is still there | Cannot be missed |
| Live region | On the viewport, always mounted | Usually none — read in document order | None; focus does the announcing |
| Use for | "Draft saved", "Export queued", "Copied" | "Two deliverables are missing evidence", "This workspace is read-only" | "Delete this deliverable?" |

**The test.** Ask what happens if the user looks away for ten seconds.

- Nothing is lost → **Toast**.
- They need to see it whenever they come back → **Banner**.
- They must answer before anything else happens → **Modal**.

**Never use a Toast for something the user has to act on.** A control that
leaves the screen on a timer is a control that some users cannot reach. If the
message needs a decision, it is a Modal; if it needs an action they can take in
their own time, it is a Banner. Toast supports an action for the narrow case
where the action is a *convenience* ("Retry", "Undo") — and a Toast with an
action never auto-dismisses.

**Never use a Toast for an error the user must fix.** Errors that block a task
belong next to the thing that is broken — a `Field` error, or a `Banner` at the
top of the form. `tone="danger"` on a Toast is for something that failed
*behind* the user, like a background save.

## Parts

| Export | What it is |
|---|---|
| `ToastProvider` | Mount once near the app root. Renders your app, then the viewport. Supplies `useToast()` |
| `useToast()` | `{ toast, dismiss, dismissAll, toasts }`. Throws outside a provider |
| `ToastViewport` | The fixed host and, crucially, **the live regions**. Rendered for you by the provider |
| `Toast` | One message. Presentation plus its own timer. Carries no live region |

## Props — `Toast`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `info \| success \| warning \| danger` | `info` | `danger` maps to `accent.critical`, and routes to the assertive region |
| `title` | `ReactNode` | — | The headline. One clause |
| `children` | `ReactNode` | — | Supporting detail. Usually unnecessary |
| `toneLabel` | `string` | `Information` / `Success` / `Warning` / `Error` | The word the tone glyph is announced as. Set it to localise; never to `''` |
| `actionLabel` | `string` | — | Renders one action. **Suppresses auto-dismiss entirely** |
| `onAction` | `() => void` | — | Fired by the action |
| `onDismiss` | `() => void` | — | Renders the close control, and is what the timer calls |
| `dismissLabel` | `string` | `Dismiss: <title>` | Falls back to `Dismiss notification` when `title` is not a string |
| `duration` | `number \| null` | `null` | Milliseconds, or `null` for never. Pauses on hover, focus and tab-hide |
| `onPauseChange` | `(paused: boolean) => void` | — | Instrumentation. The pause happens with or without it |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The outer `<div>` |

`data-tone`, `data-paused` and `data-duration` are written to the element, so a
test can assert on the timer without reaching into React.

## Props — `ToastProvider` / `ToastViewport`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `position` | `top-right \| top-center \| bottom-right \| bottom-center` | `bottom-right` | |
| `viewportClassName` | `string` | — | Provider only. Lands on the viewport, not on the provider |
| `toasts` | `readonly ToastRecord[]` | `[]` | Viewport only. **Omitting it is valid** — you get two empty live regions, which is the point |
| `onDismiss` | `(id: string) => void` | — | Viewport only |
| `politeLabel` / `assertiveLabel` | `string` | `Notifications` / `Errors` | Names on the two regions |

`toast(options)` takes `tone`, `title`, `description`, `toneLabel`,
`actionLabel`, `onAction`, `dismissLabel`, `duration`, and returns an id.
`duration` defaults to `DEFAULT_TOAST_DURATION` (6000) there — not to `null` as
it does on a bare `<Toast>`.

## Accessibility

### The live region, and why it is not on the Toast

A toast that appears with no announcement does not exist for a screen reader
user. Getting that right is most of this component.

**The region must already be in the page before the toast is inserted.**
Assistive technology subscribes to live regions when it meets them. A region
that arrives in the same DOM mutation as its first message is announced late, or
not at all — this is the single most common bug in this component's category,
and it is invisible on screen, so it ships.

The design makes it hard to get wrong by putting the role somewhere the caller
cannot reach:

1. **`Toast` has no `role`, no `aria-live`, and no `tabIndex`.** There is
   nothing on the element to set incorrectly, because there is nothing there.
2. **`ToastViewport` owns both regions** and renders them empty from first
   paint. Rendering `<ToastViewport />` with no toasts is not a no-op — putting
   the empty regions in the page is its whole job.
3. **`ToastProvider` renders the viewport itself**, after `children`. Mount the
   provider and the requirement is satisfied by construction.
4. **`useToast()` throws outside a provider**, with a message that says why.
   There is no fallback path that "works" while being silent — the only failure
   mode is a loud one, at development time.

The regions are never hidden while empty, either. `display: none` takes an
element out of the accessibility tree, so an `empty:hidden` on the region would
re-create the exact bug the viewport exists to prevent. An empty flex column is
zero pixels tall anyway.

### Two regions: `status` for most of it, `alert` for errors

They are not interchangeable, and using one for everything is wrong in both
directions.

- **`role="status"` — polite — takes `info`, `success` and `warning`.** Polite
  waits for a gap in speech. A "Draft saved" confirmation that cuts a user off
  mid-sentence costs them their place in the page and buys nothing: the save
  already happened, and nothing about it is urgent.
- **`role="alert"` — assertive — takes `danger` only.** Assertive interrupts
  whatever is being read, immediately. That is only worth its cost when carrying
  on would waste the user's work: a failed save, a dropped connection, an upload
  that did not finish. Route ordinary confirmations here and users learn to tune
  the region out, which costs you the one case that mattered.

Both regions carry an explicit **`aria-atomic="false"`**. This matters more than
it looks: `status` and `alert` both *imply* `aria-atomic="true"`, so with three
toasts on screen the default behaviour is to re-read all three every time a
fourth arrives. They also carry `aria-relevant="additions"` — a toast leaving is
not news.

The cost of splitting: a mixed batch of toasts is not in strict arrival order on
screen, because errors are in a different container. That is the right trade —
correct assertiveness is worth more than the ordering of a batch that rarely
happens.

### Auto-dismiss and WCAG 2.2.1

Content that disappears on a timer fails **2.2.1 Timing Adjustable** unless the
user can pause, extend, or dismiss it. All three are satisfied:

- **Dismiss.** `onDismiss` renders a real close control — 40 square, keyboard
  reachable, with a name that says what it closes.
- **Pause, on hover.** The pointer entering the toast stops the countdown.
- **Pause, on focus.** Focus landing anywhere *inside* the toast stops it too.
  This is not the same requirement as hover: a keyboard or switch user never
  hovers anything, and a hover-only pause leaves them racing the clock.
- **Pause, on a hidden tab.** A countdown that runs while the tab is in the
  background is a toast that was never really shown.
- **Extend.** Resuming spends *what was left* rather than restarting, so
  hovering banks time instead of resetting it.
- **A Toast with an action never auto-dismisses at all**, whatever `duration`
  says — the component ignores the timer once `actionLabel` is present. Making
  someone catch a "Retry" button before it leaves is not an accessible control,
  and no pause behaviour makes it one.

**Timing guidance.** `DEFAULT_TOAST_DURATION` is 6000ms. Five seconds is the
usual floor; this adds a second because VCP toasts tend to carry a sentence
rather than a word. Above roughly twenty words, or for anything a user might
want to re-read, pass `duration={null}` and let them close it. Under about four
seconds nobody finishes reading — do not go there to make a demo feel snappier.

### Focus is never moved to a toast

Nothing in this component calls `focus()`, and the toast is not in the tab order
itself. Moving focus to a toast would rip the caret out of whatever the user was
typing, for a message they did not ask for and are not required to answer — and
when the toast auto-dismisses, focus would then have nowhere to return to. That
is a worse failure than not being noticed.

Instead, the viewport is rendered **after** `children` in the DOM, so a keyboard
user reaches the close button by tabbing past the page content — they choose to
go there. The announcement is the live region's job, not focus's.

### Tone is never colour alone

The fill barely registers as a shape: it sits at 1.03–1.22:1 against the page in
light and 1.72–2.06:1 in dark. Nothing about the tone is carried by it. So:

- **The glyphs are four different shapes** — `info` (circle-i), `check-circle`,
  `warning` (triangle), `x-circle` — which survive greyscale, a colour vision
  deficiency, and a screenshot.
- **Each glyph carries the tone as its accessible name**, so the tone survives
  into the announcement as a word: *"Error, Save failed, we could not reach the
  server"*. Override with `toneLabel` to localise; never set it to `''`.
- **The text always says what happened.** `<Toast tone="danger" />` with no
  title is a red rectangle that means nothing to anyone.

## Tokens

Each tone is one `accent.<name>.tonal` surface/content pair — the same pairs
`docs/badge.md` measured, reused deliberately rather than re-chosen. Text on its
own fill, measured, both themes. AA asks 4.5:1.

| Tone | Fill | Content | Light | Dark |
|---|---|---|---|---|
| `info` | `accent.info.tonal.surface.default` | `accent.info.tonal.content.default` | **5.60:1** | **7.29:1** |
| `success` | `accent.success.tonal.surface.default` | `accent.success.tonal.content.default` | **8.24:1** | **6.46:1** |
| `warning` | `accent.warning.tonal.surface.default` | `accent.warning.tonal.content.default` | **4.59:1** | **7.45:1** |
| `danger` | `accent.critical.tonal.surface.default` | `accent.critical.tonal.content.default` | **6.85:1** | **8.22:1** |

**`warning` in light is the floor at 4.59:1**, exactly as it is for Badge — 0.09
above the line. Any move of either token breaks this component and Badge at the
same time.

### The border

The toast floats over arbitrary page content, so it needs an edge of its own.

| Border token | Light, vs `surface.canvas` / `surface.base` | Dark, vs canvas / base |
|---|---|---|
| `accent.info.outline.content.default` | 5.01:1 / 5.25:1 | 4.75:1 / 3.89:1 |
| `accent.success.outline.content.default` | 4.73:1 / 4.95:1 | 8.05:1 / 6.60:1 |
| `accent.warning.outline.content.default` | 4.71:1 / 4.93:1 | 9.35:1 / 7.66:1 |
| `accent.critical.outline.content.default` | 4.56:1 / 4.77:1 | 6.18:1 / 5.06:1 |

`outline.**border**.default` — the token whose *name* says border — is not used,
because it does not clear the house 3:1 rule for a boundary: 1.83:1 for
`warning` and 2.12:1 for `success` against the canvas in light. See *Token gaps*.

### The controls on the fill

The dismiss `IconButton` and the action `Button` sit **on** a tonal fill, where
their own `action.*` families are out of place: `action.tertiary.content.default`
and `action.secondary.content.default` both measure 3.75–5.75:1 there, dropping
to **3.92:1 (`success`) and 3.75:1 (`warning`) in dark** — under AA. Both
controls are therefore recoloured onto the tone's own tonal triad.

| State | Content / surface | Light range | Dark range |
|---|---|---|---|
| Rest | `tonal.content.default` on `tonal.surface.default` | 4.59 – 8.24:1 | 6.46 – 8.22:1 |
| Hover | `tonal.content.hover` on `tonal.surface.hover` | 5.88 – 7.50:1 | **4.10** – 7.64:1 |
| Pressed | `tonal.content.pressed` on `tonal.surface.pressed` | 5.72 – 10.67:1 | 4.50 – 6.28:1 |

**The floor is 4.10:1** — `success`, dark, hover. The dismiss control is a glyph
with no visible text, so 1.4.11's 3:1 is the applicable threshold and it clears
it comfortably; everything carrying actual text is at 4.50:1 or above.

The action button's outline takes `tonal.content.default` rather than
`outline.border.default`, which would sit at 1.78–3.12:1 on the pale fills — a
control border has to reach 3:1. As drawn it matches the label, 4.59:1 at worst.

**Focus ring.** `stroke.focused` on the tonal fills: 5.07 / 5.63 / 5.75 / 5.07:1
in light and 4.49 / 3.92 / 3.75 / 4.34:1 in dark. Floor 3.75:1, above the 3:1 a
focus indicator needs.

### Everything else

| Part | Token | Utility |
|---|---|---|
| Radius | `shape.radius.md` | `rounded-md` |
| Border width | `borderWidth.default` | `border` |
| Elevation | `shape.shadow.menu` | `shadow-menu` — the visual difference from a Banner |
| Title | `type.label.lg` — Poppins 500, 14/20 | `text-label-lg` |
| Body | `type.body.md` — Poppins 400, 14/20 | `text-body-md` |
| Padding | Tailwind numeric scale | `px-3.5 py-3` (14 / 12) |
| Gap, glyph to text | Tailwind numeric scale | `gap-3` (12) |
| Gap, title to body | Tailwind numeric scale | `gap-1` (4) |
| Width | Tailwind container scale | `max-w-sm` |
| Glyph colour | — | Inherited from the tone's content token via `currentColor` |

Dark comes for free: every colour above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

### Token gaps

- **No `accent.<tone>.tonal` treatment for a control sitting on a tonal
  surface.** The `tonal` triad describes a *tonal control's own* fill; there is
  no declared pair for a button on top of a tonal message. This component reuses
  the triad's hover/pressed states for that, which holds (4.10:1 floor) but is a
  convention it invented rather than a pair the tokens state.
- **`accent.<tone>.outline.border.default` cannot be used as a container
  edge.** Against `surface.canvas` in light it measures 3.60 (`info`), 2.12
  (`success`), 1.83 (`warning`), 3.64 (`danger`) — two of the four fail 3:1. The
  token named `border` is the one you cannot draw a border with. Either it moves
  a step or two darker, or the family needs a separate `border.strong`.
- **No motion or timing tokens.** `DEFAULT_TOAST_DURATION` is a TypeScript
  constant. Auto-dismiss timing is a design decision like any other and belongs
  in `tokens/` — `motion.duration.*`, or a `timing.notification.*` group.
- **No z-index token.** The viewport uses Tailwind's `z-50`. Once Modal and
  Popover land, the stacking order between them is a system-level decision and
  wants an `elevation.z.*` scale rather than three components guessing.
- **`shape.shadow.*` has no dark-theme override.** `shadow-menu` is tuned for a
  light page and is used unchanged in dark, where a shadow does much less work.
- **No `accent.neutral` triad** — the same gap Badge reports — so there is no
  neutral toast for a message with no valence.
- **No 13/400 in the type ramp.** The export set the body at 13px 400; the ramp
  offers `body-sm` (12/400) and `label-md` (13/500, wrong weight). The body uses
  `body-md` (14/400), one pixel large, rather than change weight.

## Deviations from the Claude Design export

- **`style` is gone.** The export positioned and coloured itself with inline
  styles; every value is a class here, and the numbers that varied became props.
- **The dark saturated fills are gone.** The export painted white on
  `rgb(14,10,73)` / `rgb(185,28,28)` and so on. Those are single-theme colours
  with no dark counterpart. The tonal pairs replace them, which also makes Toast
  and Badge agree.
- **`opacity: .9` on the body is gone.** It reduced contrast for a hierarchy the
  type ramp already provides through weight.
- **`role="status"` moved off the element** onto the viewport — see above. The
  export put it on the toast itself, and also used it for errors.
- **`action: ReactNode` became `actionLabel` + `onAction`.** A caller-supplied
  button inherits `action.*` colours that fail on a tonal fill; rendering it here
  is what lets it take the tone's own tokens.
- **`aria-label="Dismiss"` became a name that says what it dismisses**, derived
  from the title.
- **The bare `<button>` with a `✕` character became an `IconButton`** — 40
  target, focus ring, required name, real glyph.
- Raw values mapped to tokens: radius 10 → `rounded-md` (8); the hand-rolled
  `boxShadow` → `shape.shadow.menu`; padding `12px 14px` → `py-3 px-3.5`; gap 12
  → `gap-3`; title/body gap 2 → `gap-1` (4); `minWidth 320` / `maxWidth 440` →
  `max-w-sm` (384).

## Don't

- Don't hardcode colors or spacing. `className="bg-[#dbeafe]"` is a bug — add a token instead.
- **Don't render `<Toast>` outside a `ToastViewport`.** It will look perfect and
  announce nothing. The stories that do it are showing the presentation, not the
  pattern.
- **Don't put `role="status"` or `aria-live` on a Toast.** The region has to
  pre-exist the message; a role on the inserted element is the bug this
  component is shaped to avoid.
- **Don't use `alert`/assertive for confirmations.** Interrupting someone to
  tell them a save worked trains them to ignore the one interruption that
  mattered.
- **Don't auto-dismiss a toast that carries an action.** The component will
  refuse, and the reason is worth knowing: a control on a timer is not a control.
- **Don't move focus to a toast**, and don't make the toast itself focusable.
- Don't put anything in a Toast that the user must not miss. It is transient by
  definition — use a `Banner`, or a `Modal` if they must answer.
- Don't queue five toasts for one action. Say the one thing that happened.
- Don't set the type with `font-medium text-sm` or similar. Size and weight come
  as a unit from the ramp.
- Don't reach for `duration` under about four seconds. Nobody finishes reading.
- Don't put a form, a link list, or two actions in a Toast. If it needs that
  much interaction it is not transient.
