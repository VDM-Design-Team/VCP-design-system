# Badge

A small, non-interactive label that classifies the thing beside it — a version, a
count, a state, a category.

## When to use Badge, Chip, or StatusPill

| Use | For | Interactive? | Vocabulary |
|---|---|---|---|
| `Badge` | Classifying something in place: `Beta`, `Read-only`, `2 failures` | No — takes no focus, fires no events | Generic tones only |
| `Chip` | A value the user can act on: a selected filter, a removable tag, a toggleable option | Yes — focusable, clickable, often dismissible | Whatever the caller supplies |
| `StatusPill` *(pattern, not yet built)* | A VCP status: `Accepted`, `In progress`, `For QA`, `Confirmed prod`, `Rejected`, `Backlog` | No | VCP's status vocabulary |

**For VCP statuses use `StatusPill`, not Badge directly.** The Claude Design export
mixed VCP status names into Badge's `tone` prop (`tone="for qa"`). That vocabulary
belongs in `src/patterns/` per the tier rule in `CLAUDE.md`, so it is deliberately
absent here. `StatusPill` will own the status→tone mapping and render a Badge; if you
find yourself writing `tone={status === 'rejected' ? 'danger' : …}` at a call site,
that mapping wants to live in `StatusPill` instead.

**If it needs to be clicked or dismissed, it is not a Badge.** Badge renders a
`<span>` with no handlers, no focus ring and no tab stop. Wrapping one in an
`onClick` gives you a control that the keyboard cannot reach.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `neutral \| brand \| info \| success \| warning \| danger` | `neutral` | Generic tones only. No VCP status names — see above |
| `size` | `sm \| md` | `md` | 24 / 28 tall. `sm` for dense tables and inline-with-body-text |
| `icon` / `trailingIcon` | `ReactNode` | — | Decorative — rendered `aria-hidden`. Pass an `Icon`; match its `size` to the badge's |
| `children` | `ReactNode` | — | The label. Never wraps; truncates with an ellipsis when constrained |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLSpanElement>` | — | Points at the outer `<span>` |

Everything else (`id`, `title`, `data-*`, …) is forwarded to the `<span>`.

## Tokens

Each coloured tone is one `accent.<name>.tonal` pair — `…tonal.surface.default` for
the fill and `…tonal.content.default` for the label. `neutral` and `brand` have no
accent triad, so they are composed from `surface.*` + `text.*` (see *Token gaps*).

Contrast is the label on its **own fill**, measured, in both themes. WCAG AA asks 4.5:1.

| Tone | Fill | Label | Light | Dark |
|---|---|---|---|---|
| `neutral` | `surface.neutral.subtle` | `text.secondary` | **9.45:1** | **8.40:1** |
| `brand` | `surface.brand.faint` | `text.brand.strong` | **11.37:1** | **8.97:1** |
| `info` | `accent.info.tonal.surface.default` | `accent.info.tonal.content.default` | **5.60:1** | **7.29:1** |
| `success` | `accent.success.tonal.surface.default` | `accent.success.tonal.content.default` | **8.24:1** | **6.46:1** |
| `warning` | `accent.warning.tonal.surface.default` | `accent.warning.tonal.content.default` | **4.59:1** | **7.45:1** |
| `danger` | `accent.critical.tonal.surface.default` | `accent.critical.tonal.content.default` | **6.85:1** | **8.22:1** |

Every tone passes AA in both themes. **`warning` in light is the floor at 4.59:1** —
`yellow-700` on `yellow-100`, 0.09 above the line. Any future move of either token
breaks it first; `yellow-800` would take it to 6.37:1 if the margin ever needs widening.

The export painted `rgb(0,0,0)` on all five fills, which measured 17–19.5:1. Moving to
the tonal token pairs costs that headroom by design: the label now reads as *coloured*
rather than black-on-tint, which is what makes the tone legible at a glance and what
lets dark theme work at all. Nothing drops below AA.

Everything else:

| Part | Token | Utility |
|---|---|---|
| Radius | `shape.radius.md` | `rounded-md` |
| Type ramp, `md` | `type.label.lg` — Poppins 500, 14/20 | `text-label-lg` |
| Type ramp, `sm` | `type.label.md` — Poppins 500, 13/18 | `text-label-md` |
| Height | Tailwind numeric scale | `h-7` (`md`, 28) / `h-6` (`sm`, 24) |
| Padding | Tailwind numeric scale | `px-2` (8), both sizes |
| Gap | Tailwind numeric scale | `gap-2` (`md`, 8) / `gap-1` (`sm`, 4) |
| Icon colour | — | Inherited from the tone's content token via `currentColor` |

The dark theme comes for free — every colour class above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

### Token gaps

- **No `accent.brand.*` or `accent.neutral.*` triad.** Only `critical`, `info`,
  `success` and `warning` have `filled`/`outline`/`tonal`. `brand` and `neutral` are
  therefore hand-composed here from `surface.brand.faint` + `text.brand.strong` and
  `surface.neutral.subtle` + `text.secondary`. They look right and measure well, but
  they are a convention this component invented rather than a pair the tokens declare.
  Two more triads would make all six tones uniform.
- **`accent.{blue,green,red,yellow}`** exist but only as `base`/`faint`/`medium`/
  `strong`/`stronger`/`subtle` scales — no `tonal` treatment — so they cannot serve a
  Badge tone as-is.
- **No Poppins 500 at 12/16 in the type ramp.** The export's `medium` size is 12px.
  The ramp offers `label-md` (Poppins 500, 13/18) and `label-sm` (Poppins 500, 11/16)
  either side of it, and `caption-md` (500, 12/16) which is *Inter*, the numeric face.
  `sm` uses `label-md` — right family and weight, one pixel large — rather than change
  typeface for one size.
- **`shape.radius.sm` is described as "small controls, tags, badges"** but is 6px,
  where the Figma Tag is 8px. Badge follows the Figma geometry and uses `radius.md`.
  The token description and the component disagree; one of them should move.

## Accessibility

- **The text is the meaning; the colour is not.** Fills sit at 1.07–1.22:1 against
  `surface.base`, so the badge is barely a shape of its own — and tone alone fails
  1.4.1 regardless. Always ship a label. `<Badge tone="danger" />` with no children
  says nothing to anyone.
- **Contrast.** Every tone's label clears 4.5:1 on its own fill in both themes — see
  the table. The fill is decorative, not a UI boundary, so 1.4.11's 3:1 does not
  apply to it.
- **Icons are decorative** and rendered `aria-hidden`, so a screen reader reads the
  label once. Pass a plain `Icon` with no `label` — naming both double-announces.
- **Not a control, so no target size.** Badge takes no focus and handles no events,
  which is why the 40 minimum does not apply and why `sm` at 24 tall is fine
  everywhere. The moment it becomes clickable that stops being true — use `Chip`.
- **Truncation keeps the full text out of reach.** A label long enough to ellipsize
  is unreadable to everyone, including screen-reader users, since the DOM text stays
  but the visual is cut. Shorten the label; do not lean on `title` to recover it.
- **Don't put a live count in a bare Badge** and expect it to be announced. A number
  that changes needs a live region on the container, or a full sentence elsewhere.

## Don't

- Don't hardcode colors or spacing. `className="bg-[#dbeafe]"` is a bug — add a token instead.
- Don't put a VCP status in a Badge. `<Badge tone="warning">For QA</Badge>` is a
  `StatusPill` waiting to be written, and every call site that does it drifts apart.
- Don't make a Badge clickable or dismissible. That is a `Chip` — a `<span>` with an
  `onClick` is unreachable by keyboard.
- Don't put an interactive control in `icon`/`trailingIcon` — the slots are
  `aria-hidden` and outside the tab order.
- Don't use `danger` for emphasis. It means something is wrong, not that something
  is important.
- Don't write sentences in a badge. If it needs to truncate, it is not a label.
- Don't set the type with `font-medium text-sm` or similar. Size and weight come as a
  unit from the ramp — use `size`.
- Don't stack more than a handful in a row. Past four or five they stop classifying
  anything and become texture.
