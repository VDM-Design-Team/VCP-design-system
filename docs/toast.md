# Toast

A transient message that appears, says one thing, and goes away. A Toast
interrupts nothing: it takes no focus, blocks nothing, and the user is never
required to deal with it.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `IconButton` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

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

## The timer bar

The Figma toast draws a **4px bar** along the bottom edge running the
auto-dismiss countdown (design audit, 3 Sep 2026). It appears whenever the
toast is actually timed — so never on a toast carrying an action, which does
not auto-dismiss at all.

It is driven by a CSS transition rather than React state, so it stays smooth
without a render per frame: pausing freezes it at its current width, and
resuming spends whatever the timer banked. Hovering therefore *extends* the
toast rather than restarting it, and the bar shows that.

Deliberately **not** `ProgressBar`: that atom is a semantic meter with
`role="progressbar"` and a value to announce. This is decoration for a
countdown the toast already communicates, so it is `aria-hidden` and carries
no value.

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

- **Dismiss.** `onDismiss` renders a real close control — a 40 square target, keyboard
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

The card is neutral; the tone is a small bright glyph and the timer bar, and both
sit below 3:1 against the card for two tones (see *The glyph and the bar* below).
So nothing about the tone rests on colour:

- **The glyphs are four different shapes** — `info-fill` (circle-i),
  `check-circle-fill`, `warning-circle-fill` (circle-exclamation, for warning)
  and `warning-fill` (triangle, for danger) — which survive greyscale, a colour vision
  deficiency, and a screenshot.
- **Each glyph carries the tone as its accessible name**, so the tone survives
  into the announcement as a word: *"Error, Save failed, we could not reach the
  server"*. Override with `toneLabel` to localise; never set it to `''`.
- **The text always says what happened.** `<Toast tone="danger" />` with no
  title is a red rectangle that means nothing to anyone.

## Tokens

The card is neutral, as Figma draws it: `surface.elevated` with a
`stroke.subtle` border. Text on it:

| Part | Token | Light | Dark |
|---|---|---|---|
| Title | `text.primary` on `surface.elevated` | 20.17:1 | 14.63:1 |
| Message | `text.secondary` on `surface.elevated` | 10.35:1 | 11.87:1 |

### The glyph and the bar

The tone lives in two places, both the accent's own bright colour,
`accent.<tone>.outline.border.default`, as Figma draws it:

| Tone | Light, on white | Dark, on `surface.elevated` |
|---|---|---|
| `info` | 3.76:1 | 2.79:1 |
| `success` | **2.22:1** | 4.54:1 |
| `warning` | **1.91:1** | 4.98:1 |
| `danger` | 3.81:1 | 3.07:1 |

**Several of these are below 3:1, and that is a deliberate exception**, the same
one `Banner` records: the glyph is not what makes the message understood. The
title says what happened, the glyph's shape differs per tone, and it is announced
as a word. The timer bar is `aria-hidden` and shows a countdown that the toast
already communicates by dismissing. If the family ever gets a stronger border
step, both should move to it.

### The controls

- **Action** is the standard `Button`, `secondary`, `sm` — Figma's outlined blue
  "Action" — on a white card, exactly where that variant is tuned to sit. No
  tone recolouring any more.
- **Dismiss** is a neutral `IconButton`: `text.primary`, hover
  `surface.neutral.faint`, pressed `surface.neutral.subtle`. It is the
  Banner's own: `md`, 40 square, pulled into the card's padding so the glyph sits
  where Figma puts it.
- **Focus ring.** `stroke.focused` on the white card; the same ring every other
  control uses.

### Everything else

| Part | Token | Utility |
|---|---|---|
| Radius | `shape.radius.md` (8, the Banner's) | `rounded-md` |
| Border width | `borderWidth.default` | `border` |
| Surface | `surface.elevated` | `bg-surface-elevated` |
| Border | `stroke.subtle` | `border-stroke-subtle` |
| Elevation | `shape.shadow.menu` | `shadow-menu` — the visual difference from a Banner. Figma stacks two softer shadows no token matches; this is the closest |
| Title | `type.body-sm-semibold` — 14/20 | `text-body-sm-semibold text-text-primary` |
| Message | `type.body-sm-medium` — 14/20 | `text-body-sm-medium text-text-secondary` |
| Padding | Tailwind numeric scale | `p-4` (16) |
| Gap, glyph / text / action / close | Tailwind numeric scale | `gap-2` (8), the Banner's |
| Gap, title to message | — | none |
| Width | Tailwind container scale | `w-fit max-w-sm` — hugs its content |
| Glyph and bar colour | `accent.<tone>.outline.border.default` | `text-accent-<tone>-outline-border-default` |

Dark comes for free: every colour above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

### Token gaps

- **`accent.<tone>.outline.border.default` is below 3:1 on a white card** for
  `success` and `warning` (and `info` in dark). Fine for a redundant glyph, not
  for anything that must be seen on its own. See *The glyph and the bar*.
- **No two-layer toast shadow.** Figma draws `0 1 3` and `0 4 8 +3`, both 10%
  black. The shadow tokens are single layers, so `shadow-menu` stands in.
- **No motion or timing tokens.** `DEFAULT_TOAST_DURATION` is a TypeScript
  constant. Auto-dismiss timing is a design decision like any other and belongs
  in `tokens/` — `motion.duration.*`, or a `timing.notification.*` group.
- **No z-index token.** The viewport uses Tailwind's `z-50`. Once Modal and
  Popover land, the stacking order between them is a system-level decision and
  wants an `elevation.z.*` scale rather than three components guessing.
- **`shape.shadow.*` has no dark-theme override.** `shadow-menu` is tuned for a
  light page and is used unchanged in dark, where a shadow does much less work.
- **No 13/400 in the type ramp.** The export set the body at 13px 400; the ramp
  offers `body-sm` (12/400) and `label-md` (13/500, wrong weight). The body uses
  `body-md` (14/400), one pixel large, rather than change weight.

## Deviations from the Claude Design export

- **`style` is gone.** The export positioned and coloured itself with inline
  styles; every value is a class here, and the numbers that varied became props.
- **The dark saturated fills are gone.** The export painted white on
  `rgb(14,10,73)` / `rgb(185,28,28)` and so on. Those were single-theme colours
  with no dark counterpart. Toast is now Figma's neutral card, which flips with
  the theme on its own. (It was a tonal card between 3 Sep and October 2026.)
- **`opacity: .9` on the body is gone.** It reduced contrast for a hierarchy the
  type ramp already provides through weight.
- **`role="status"` moved off the element** onto the viewport — see above. The
  export put it on the toast itself, and also used it for errors.
- **`action: ReactNode` became `actionLabel` + `onAction`.** Rendering the
  button here keeps its size and variant fixed to the design.
- **`aria-label="Dismiss"` became a name that says what it dismisses**, derived
  from the title.
- **The bare `<button>` with a `✕` character became an `IconButton`** — 40
  target, focus ring, required name, real glyph.
- Raw values mapped to tokens: radius 10 → `rounded-md` (8); the hand-rolled
  `boxShadow` → `shape.shadow.menu`; padding `12px 14px` → `p-4` (Figma's 16); gap 12
  → `gap-2`; `minWidth 320` / `maxWidth 440` →
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
