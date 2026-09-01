# Divider

A hairline rule that separates content — horizontal or vertical, with an optional
centred caption sitting inside the line.

## When to use

| Use | Reach for | Why |
|---|---|---|
| Break up content inside one surface — a card, a list, a menu, a toolbar | `Divider` | A rule is the lightest possible separation. It adds no box and no weight |
| Separate content that needs its own background, padding or elevation | Two surfaces (`bg-surface-elevated` + a gap) | If the two halves need different treatment, a line is not what is separating them |
| Set a heading apart from the text under it | Type ramp and spacing | A heading already separates. Adding a rule under every heading is decoration for its own sake |
| Show the boundary of an interactive control | `border-stroke-field` on the control | A control boundary must clear 3:1 (WCAG 1.4.11). The divider's rule colour does not, and should not be borrowed for one |

Two rules stacked with only spacing between them is a sign the layout, not the
divider, is doing the wrong thing.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `orientation` | `horizontal \| vertical` | `horizontal` | Vertical needs height from its parent — see below |
| `label` | `string` | — | Centred caption inside the rule. **Horizontal only** — ignored when vertical. A string, not a `ReactNode`, because a semantic divider is named from it |
| `decorative` | `boolean` | `true` | `true` → `role="presentation"`, silent. `false` → `role="separator"`, announced |
| `className` | `string` | — | Merged via `cn()`. This is where the divider's *margins* go (`className="my-4"`) — the component ships none |
| `ref` | `Ref<HTMLElement>` | — | Points at the rendered element: an `<hr>`, or a `<div>` when vertical or labelled |

Everything else (`id`, `data-*`, …) is forwarded to the rendered element.
There is no `style` prop — pass token utilities through `className` instead.

## Which element gets rendered

| Case | Element | Why |
|---|---|---|
| Horizontal, no label | `<hr>` | The HTML element that means "thematic break" |
| Horizontal, with label | `<div>` + two rails + a caption | **`<hr>` is a void element** — it cannot legally contain the caption text. A labelled rule is a flex row: rail, caption, rail |
| Vertical | `<div>` | `<hr>` means a horizontal, paragraph-level break. A vertical rule is a one-pixel box |

## Tokens

| Part | Token | Utility |
|---|---|---|
| Rule colour | `stroke.default` | `bg-stroke-default` |
| Rule thickness | — (Tailwind `px`) | `h-px` (horizontal) / `w-px` (vertical) |
| Caption text colour | `text.subtle` | `text-text-subtle` |
| Caption type | `type.label.sm` | `text-label-sm` (plus `uppercase`) |
| Caption gap | Tailwind numeric scale | `gap-3` (12) |
| Vertical minimum length | Tailwind numeric scale | `min-h-4` (16) |

**Why `stroke.default` and not `stroke.subtle`.** A divider is decoration, so the
3:1 that WCAG 1.4.11 asks of a *control boundary* does not apply to it — it may be
as quiet as the design wants. What it must not be is invisible on the surfaces it
is actually drawn on. `stroke.subtle` is `slate.200`, which all but disappears
against `surface.canvas` (`slate.50`); `stroke.default` is `slate.300`, which
holds on canvas, base and elevated alike, and is the general-purpose rule colour
the naming scheme already reserves. (The Claude Design source used the subtle
token — this is a deliberate departure.)

Dark comes for free: every class above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

## Accessibility

- **Decorative is the default, and it is a real decision.** `<hr>` carries an
  implicit `separator` role and *is* announced, so a purely visual rule has to be
  silenced on purpose: the component renders `role="presentation"`. Most dividers
  in a UI are visual rhythm — the structure that actually separates the content is
  already carried by headings, lists, landmarks and groups, and a screen reader
  reciting "separator" between every row of a list is noise with no information
  in it.
- **Set `decorative={false}` when the rule is the only signal.** A menu group with
  no heading, a segment break in a toolbar, a change of subject with nothing else
  marking it. That renders `role="separator"`, which is announced — which is the
  point.
- **A vertical semantic divider needs `aria-orientation="vertical"`.** The
  `separator` role defaults to horizontal, so the vertical case must say so; the
  component adds it whenever `orientation="vertical"` and `decorative` is `false`.
  It is deliberately *not* added to a decorative one, which has no role to qualify.
- **A vertical divider has no height of its own — this is the usual bug.** A
  one-pixel-wide box with no content is zero pixels tall, and the rule silently
  disappears. The component ships `self-stretch` (so it fills a flex row) and
  `min-h-4` (so it never collapses to nothing outside one). If you need it taller
  than its siblings, give the *container* a height — `flex h-10 items-center` —
  rather than reaching for a height on the divider.
- **The caption is announced exactly once.** When semantic, `role="separator"`
  takes its name from the author rather than from its contents, so the component
  puts the caption in `aria-label` and hides the painted text: one announcement,
  "or, separator". When decorative, the opposite — `role="presentation"` is not
  inherited by children, so the caption stays in the accessibility tree as the
  plain text it is.
- **Contrast of the caption.** `text.subtle` on `surface.elevated` is 4.76:1,
  clearing the 4.5:1 that 1.4.3 asks of small text.

## Don't

- Don't hardcode colors or spacing. `className="bg-[#e2e8f0]"` is a bug — add a token instead.
- Don't use a divider as the boundary of an interactive control. Its colour is
  decorative and does not meet 3:1; use `border-stroke-field`.
- Don't put a vertical divider in a container with no height and expect to see it —
  give the row a height, or let `self-stretch` do its job in a flex row.
- Don't pass `label` with `orientation="vertical"`. There is nowhere to put it and
  it is ignored.
- Don't leave `decorative` at its default when the rule is the only thing marking a
  new section — that divider is meaningful, and silencing it loses the structure.
- Don't set `decorative={false}` on every divider "to be safe". A run of announced
  separators is worse for a screen reader than none at all.
- Don't stack a divider *and* a background change *and* extra spacing to separate
  the same two things. Pick one.
