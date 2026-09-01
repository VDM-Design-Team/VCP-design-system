# Banner

A persistent inline message that sits in the layout. It takes real space,
reflows the content around it, and stays until the user dismisses it or the
condition that raised it clears. Nothing about it is timed.

## When to use Banner, Toast, or Modal

The three differ on one axis — **how much of the user's attention you are
entitled to** — and everything else follows from it.

| | `Banner` | `Toast` | `Modal` |
|---|---|---|---|
| Lifetime | **Persistent.** Stays until dismissed or the condition clears | **Transient.** Goes away on its own | Until the user closes it |
| Position | In the layout; pushes content down | Floats over the page, in a fixed viewport | Over the page, on a scrim |
| Interrupts? | No. Nothing is blocked | No. Nothing is blocked | **Yes.** The page behind is inert |
| Takes focus? | No | **Never** | **Always**, and traps it |
| If it is missed | Impossible to miss — it is still there | Nothing is lost | Cannot be missed |
| Live region | Usually **none** — read in document order | On the viewport, always mounted | None; focus does the announcing |
| Use for | "Two deliverables are missing evidence", "This workspace is read-only" | "Draft saved", "Export queued", "Copied" | "Delete this deliverable?" |

**The test.** Ask what happens if the user looks away for ten seconds.

- They need to see it whenever they come back → **Banner**.
- Nothing is lost → **Toast**.
- They must answer before anything else happens → **Modal**.

Put differently: **a Banner describes a state, a Toast reports an event.** "Two
deliverables are missing evidence" is true until someone fixes it — that is a
Banner. "Deliverable saved" was true for an instant — that is a Toast. If you
find yourself wanting a Banner to disappear after a few seconds, the message was
an event and belongs in a Toast; if you find yourself wanting a Toast to stay
until the user deals with it, it was a state and belongs here.

**A Banner is not a Modal.** It blocks nothing and traps no focus. If the user
genuinely must not proceed, a Banner is the wrong shape however severe the tone
looks — they can simply scroll past it.

## Where a Banner goes

Scope it to the region it is about, and put it at the top of that region:

| Scope | Placement |
|---|---|
| The whole workspace | Directly under the top bar, full width |
| One page | Above the page content, inside the page's own width |
| One form | Above the first field, so it is read before the form |
| One card or panel | Inside it, above its content |

A workspace-wide banner floating above a single form is confusing about what it
applies to; so is a form error at the top of the whole page.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `info \| success \| warning \| danger` | `info` | `danger` maps to `accent.critical` |
| `title` | `ReactNode` | — | The headline. One clause |
| `children` | `ReactNode` | — | The body. Say what happened and what to do |
| `toneLabel` | `string` | `Information` / `Success` / `Warning` / `Error` | The word the tone glyph is announced as. Set it to localise; never to `''` |
| `actionLabel` | `string` | — | Renders one action, inline at the end of the row |
| `onAction` | `() => void` | — | Fired by the action. Required for the action to render |
| `onDismiss` | `() => void` | — | Renders the close control. The Banner does **not** hide itself |
| `dismissLabel` | `string` | — | **Required whenever `onDismiss` is given** — enforced in the type system |
| `live` | `off \| polite \| assertive` | `off` | See below. Easy to use and easy to misuse |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The outer `<div>` |

`data-tone` is written to the element. Everything else (`id`, `data-*`, …) is
forwarded.

There is no `duration` and no auto-dismiss, on purpose. A message that removes
itself is a `Toast`.

## Accessibility

### The live region: two cases, and only one of them needs one

**Case 1 — the Banner renders with the page.** No live region. `live` stays
`off`, the element gets no `role` at all, and it is read in document order like
any other content. This is the common case and the correct default: a live
region here would announce the banner a second time, out of place, for a user
who was going to reach it anyway.

**Case 2 — the Banner appears in response to an action.** Now it needs
announcing: the user pressed Save, nothing else on screen changed, and a
sighted user can see the new banner while a screen reader user gets silence.

But the same trap applies here as to `Toast`: **a live region that is inserted
at the same moment as its first message is announced unreliably.** So `live` on
a Banner is only correct when the Banner element is *already in the page* and
its content is what changes. When the whole Banner is being mounted on demand,
put the region on the slot that was always there:

```tsx
// The wrapper is mounted with the form and never unmounts. This is the region.
<div role="status" aria-live="polite" aria-atomic="false">
  {error && (
    <Banner tone="danger" title={error} onDismiss={clear} dismissLabel={`Dismiss: ${error}`} />
  )}
</div>
```

Setting `live="polite"` on a Banner that is itself being inserted looks correct
and announces nothing. That is the trap, and it is why `live` defaults to `off`
rather than to something helpful.

One honest nuance: `role="alert"` on a freshly inserted element *is* announced
by most current screen readers, where a freshly inserted polite region often is
not. Do not rely on that difference — the wrapper pattern above is correct for
both, costs nothing, and does not depend on which screen reader is in use.

**`polite` versus `assertive`.** Polite waits for a gap in speech; assertive
interrupts immediately. Reserve assertive for something that costs the user work
if they carry on — a failed save, an expired session. A banner that says the
save worked is polite, always.

Both settings emit an explicit **`aria-atomic="false"`**, because `status` and
`alert` otherwise imply `aria-atomic="true"` and every change to the body would
re-read the whole banner.

### The dismiss control has to say what it dismisses

`dismissLabel` is **required by the type system** whenever `onDismiss` is given
— the props are a union, so a dismissible Banner without a label does not
compile. This is the same move `IconButton` makes with its own `label`, for the
same reason.

"Close" names the gesture, not the target. A page can easily carry two banners,
and a screen reader user pulling up the list of controls then sees two buttons
called "Close" with no way to tell which is which. Name the message:

- Good — `dismissLabel="Dismiss the missing evidence warning"`
- Bad — `dismissLabel="Close"`, `"Dismiss"`, `"X"`

Dismissal is the caller's state to keep; the Banner does not remove itself. That
is deliberate: whether a dismissal is remembered across a session is a product
decision, and hiding it internally would quietly make it "forget every time".

### Tone is never carried by colour alone

The fill barely registers as a shape — 1.03–1.22:1 against the page in light,
1.72–2.06:1 in dark. It is a tint, not a signal. So the tone is carried three
ways, and colour is the weakest of them:

1. **Shape.** The four glyphs are genuinely different marks — `info`
   (circle-i), `check-circle`, `warning` (triangle), `x-circle` — not one mark
   in four colours. They read in greyscale, with a colour vision deficiency, and
   in a screenshot.
2. **Text, in the announcement.** Each glyph carries the tone as its accessible
   name, so a screen reader hears *"Warning, two deliverables are missing
   evidence"*. The glyph is the only thing carrying the tone, so it is named
   rather than `aria-hidden` — the opposite of the rule for `Badge`, where a
   visible label already says it.
3. **Text, in the copy.** Write the title so it works with the colour stripped
   out. "Two deliverables are missing evidence" says what is wrong;
   "Attention required" relies entirely on the tint.

### The rest

- **Contrast.** Text on its own fill clears 4.5:1 in both themes for every tone
  — see the table. The border clears 3:1 against both page surfaces.
- **Not a landmark.** The Banner renders a plain `<div>` with no `role` by
  default, so five banners do not add five entries to the landmark list.
- **The title is a `<p>`, not a heading.** A banner is not a section of the
  document and should not appear in the heading outline. If you want it in the
  outline, put a real heading next to it.
- **Target size.** The dismiss control is an `IconButton` at `md` — 40 square.
  Negative margins pull it into the banner's padding so the box stays compact
  without shrinking the hit area.
- **Focus order** is document order, because the Banner is document content.
  Nothing here moves focus.

## Tokens

Each tone is one `accent.<name>.tonal` surface/content pair — the same pairs
`docs/badge.md` measured, and the same ones `Toast` uses. Text on its own fill,
measured, both themes. AA asks 4.5:1.

| Tone | Fill | Content | Light | Dark |
|---|---|---|---|---|
| `info` | `accent.info.tonal.surface.default` | `accent.info.tonal.content.default` | **5.60:1** | **7.29:1** |
| `success` | `accent.success.tonal.surface.default` | `accent.success.tonal.content.default` | **8.24:1** | **6.46:1** |
| `warning` | `accent.warning.tonal.surface.default` | `accent.warning.tonal.content.default` | **4.59:1** | **7.45:1** |
| `danger` | `accent.critical.tonal.surface.default` | `accent.critical.tonal.content.default` | **6.85:1** | **8.22:1** |

**`warning` in light is the floor at 4.59:1**, exactly as it is for Badge — 0.09
above the line. Any move of either token breaks Badge, Banner and Toast at once.

### The border

A Banner sits on the page, and its fill is nearly invisible against it (1.03:1
for `warning` in light). The border is what makes its extent legible, so it is
held to the house 3:1 rule.

| Border token | Light, vs `surface.canvas` / `surface.base` | Dark, vs canvas / base |
|---|---|---|
| `accent.info.outline.content.default` | 5.01:1 / 5.25:1 | 4.75:1 / 3.89:1 |
| `accent.success.outline.content.default` | 4.73:1 / 4.95:1 | 8.05:1 / 6.60:1 |
| `accent.warning.outline.content.default` | 4.71:1 / 4.93:1 | 9.35:1 / 7.66:1 |
| `accent.critical.outline.content.default` | 4.56:1 / 4.77:1 | 6.18:1 / 5.06:1 |

Floor 3.89:1. `outline.**border**.default` — the token whose *name* says border
— is deliberately not used: against the canvas in light it measures 3.60
(`info`), 2.12 (`success`), **1.83** (`warning`), 3.64 (`danger`), so two of the
four tones would give a banner no discernible edge. See *Token gaps*.

### The controls on the fill

The dismiss `IconButton` and the action `Button` sit **on** a tonal fill, where
their own families are out of place: `action.secondary.content.default` and
`action.tertiary.content.default` both measure 3.75–5.75:1 there, dropping to
**3.92:1 (`success`) and 3.75:1 (`warning`) in dark** — under AA. Both controls
are recoloured onto the tone's own tonal triad.

| State | Content / surface | Light range | Dark range |
|---|---|---|---|
| Rest | `tonal.content.default` on `tonal.surface.default` | 4.59 – 8.24:1 | 6.46 – 8.22:1 |
| Hover | `tonal.content.hover` on `tonal.surface.hover` | 5.88 – 7.50:1 | **4.10** – 7.64:1 |
| Pressed | `tonal.content.pressed` on `tonal.surface.pressed` | 5.72 – 10.67:1 | 4.50 – 6.28:1 |

**The floor is 4.10:1** — `success`, dark, hover — on the dismiss glyph, which
has no visible text and is therefore held to 1.4.11's 3:1. Everything carrying
text is at 4.50:1 or above.

This is why `action` is a prop pair (`actionLabel` + `onAction`) rather than a
`ReactNode` slot as in the export: a caller passing their own `<Button>` gets
`action.secondary` colours and a dark-theme AA failure, and has no way to know.
The action's outline takes `tonal.content.default` rather than
`outline.border.default`, which would sit at 1.78–3.12:1 on the pale fills.

**Focus ring.** `stroke.focused` on the tonal fills: 5.07 / 5.63 / 5.75 / 5.07:1
in light and 4.49 / 3.92 / 3.75 / 4.34:1 in dark. Floor 3.75:1, above the 3:1 a
focus indicator needs.

### Everything else

| Part | Token | Utility |
|---|---|---|
| Radius | `shape.radius.md` | `rounded-md` |
| Border width | `borderWidth.default` | `border` |
| Elevation | none | No shadow — a Banner is *in* the page, not above it |
| Title | `type.label.lg` — Poppins 500, 14/20 | `text-label-lg` |
| Body | `type.body.md` — Poppins 400, 14/20 | `text-body-md` |
| Padding | Tailwind numeric scale | `px-3.5 py-3` (14 / 12) |
| Gap, glyph to text | Tailwind numeric scale | `gap-3` (12) |
| Gap, title to body | Tailwind numeric scale | `gap-1` (4) |
| Width | — | `w-full`; the container decides how wide |
| Glyph colour | — | Inherited from the tone's content token via `currentColor` |

Dark comes for free: every colour above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

### Token gaps

- **No `accent.<tone>.tonal` treatment for a control sitting on a tonal
  surface.** The `tonal` triad describes a *tonal control's own* fill; nothing
  declares the pair for a button on top of a tonal message. Both controls reuse
  the triad's hover/pressed states, which holds (4.10:1 floor) but is this
  component's convention rather than a stated pair.
- **`accent.<tone>.outline.border.default` cannot be used as a container
  edge.** 1.83:1 (`warning`) and 2.12:1 (`success`) against the canvas in light.
  The token named `border` is the one you cannot draw a border with. It wants to
  move a step or two darker, or the family wants a `border.strong`.
- **No 14/600 in the type ramp.** The export's Banner title was 14px 600. The
  ramp goes `label-lg` (14/500) → `title-sm` (16/600), with nothing between. The
  title uses `label-lg`, one weight step light.
- **No 13/400 in the type ramp.** The export's body was 13px 400; the ramp has
  `body-sm` (12/400) and `label-md` (13/500, wrong weight). The body uses
  `body-md` (14/400), one pixel large.
- **No `accent.neutral` triad** — the same gap Badge reports — so there is no
  neutral banner for a message with no valence.
- **`shape.shadow.*` has no dark-theme override.** It does not bite Banner,
  which uses no shadow, but it does bite `Toast`.

## Deviations from the Claude Design export

- **`style` is gone.** Every value is a class; the numbers that varied became
  props.
- **`role="status"` is no longer unconditional.** The export gave every Banner a
  polite live region, which double-announces a banner that renders with the
  page. It is now opt-in via `live`, defaulting to `off`.
- **`action: ReactNode` became `actionLabel` + `onAction`** — see the contrast
  note above.
- **`aria-label="Dismiss"` became a required, message-specific
  `dismissLabel`**, enforced by the prop type.
- **The bare `<button>` with a `✕` character became an `IconButton`** — 40
  target, focus ring, required name, real glyph.
- **The tone glyph is now supplied by the component**, not passed in as an
  `icon` slot, so it can be guaranteed distinct per tone and can carry the tone
  as its accessible name.
- Raw values mapped to tokens: the hand-written `rgb()` fills, text and borders
  → `accent.<tone>.tonal` + `outline.content`; radius 8 → `shape.radius.md`;
  `1px solid` → `borderWidth.default`; padding `12px 14px` → `py-3 px-3.5`; gap
  12 → `gap-3`; title/body gap 2 → `gap-1` (4).

## Don't

- Don't hardcode colors or spacing. `className="bg-[#fef3c7]"` is a bug — add a token instead.
- **Don't give a Banner a timer.** If it should go away on its own it is a
  `Toast`. There is no `duration` prop and adding one with `setTimeout` at the
  call site re-creates every WCAG 2.2.1 problem `Toast` already solved.
- **Don't set `live="polite"` on a Banner that is itself being mounted.** It
  looks right and announces nothing — put the region on a wrapper that was
  already there.
- **Don't wrap a page-load Banner in a live region.** It is already read in
  document order; you are announcing it twice.
- **Don't label the dismiss control "Close".** The type system will make you
  supply a label; make it a useful one.
- **Don't use a Banner to block something.** It traps no focus and blocks
  nothing. If the user must not proceed, that is a `Modal`.
- **Don't stack banners.** Three at the top of a page is a page nobody reads.
  One per region; if there are genuinely three problems, say so in one banner.
- **Don't rely on the tint.** The fill is roughly 1.1:1 against the page —
  write a title that works in greyscale.
- Don't use `danger` for emphasis. It means something is wrong, not that
  something is important.
- Don't put a form, a link list, or two actions in a Banner. One action, or
  none, and let the body point at where the work happens.
- Don't set the type with `font-semibold text-sm` or similar. Size and weight
  come as a unit from the ramp.
