# Card

A surface that groups related content on the canvas: an optional title, an
optional right-aligned header action, a body, and an optional footer.

A Card is a **container, not a control**. It has no `role`, no `tabIndex` and no
`onClick`. If the card leads somewhere, put a real link or button inside it.

## When to use

| Use a Card for | Reach for something else when |
|---|---|
| Grouping a short form, a summary, or a list of related rows | The content is the whole page — a page needs no card around it |
| A repeated unit in a grid or dashboard (one metric, one supplier, one claim) | You want a clickable tile — use a link or button *inside* the card, not the card |
| A panel with its own title and its own action ("Reconciliation … ⋯") | The panel opens over the page — that is a Modal or a Popover |
| Full-bleed content that still needs a boundary (`padded={false}`) | You only need spacing — a plain `div` with padding is cheaper |
| Separating a footer of actions from the body | The actions belong to the page, not to this group |

Cards do not nest well. A card inside a card reads as a bug, not a hierarchy —
use a divider or a heading in the body instead.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | — | Rendered as a **real heading** in the header. Replaces the native `title` tooltip attribute, which is not forwarded |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | The heading level for `title`. Set it for the document outline, never for size |
| `action` | `ReactNode` | — | Right-aligned header slot. Usually a `Button`. Icon-only needs `aria-label` |
| `footer` | `ReactNode` | — | Tinted band at the bottom, divided from the body |
| `padded` | `boolean` | `true` | `false` gives the body's edges to the content — tables, images, row lists |
| `className` | `string` | — | Merged onto the **root** `<section>` |
| `bodyClassName` | `string` | — | Merged onto the **body wrapper**. The escape hatch for body layout |
| `children` | `ReactNode` | — | The body |
| `ref` | `Ref<HTMLElement>` | — | Points at the root `<section>` |

Everything else (`id`, `aria-labelledby`, `data-*`, …) is forwarded to the
`<section>`.

There is no `style` or `bodyStyle`. See [Deviations](#deviations-from-the-claude-design-export).

## Anatomy

```
<section>                       surface.elevated · stroke.default · shadow.card · radius.md
  <header>                      px-4 py-3.5 — only when title or action is given
    <h3>                        type.heading-sm · text.primary
    action                      right-aligned, in the tab order
  <div>                         p-4, or px-4 pb-4 when a header is present, or 0 when padded={false}
  <footer>                      surface.canvas · border-t stroke.default · px-4 py-3
```

## Tokens

| Part | Token | Utility |
|---|---|---|
| Card surface | `surface.elevated` | `bg-surface-elevated` |
| Card boundary | `stroke.default` | `border border-stroke-default` |
| Elevation | `shadow.card` | `shadow-card` |
| Radius | `shape.radius.md` | `rounded-md` |
| Title type | `type.heading-sm` | `text-heading-sm` |
| Title colour | `text.primary` | `text-text-primary` |
| Body colour | `text.secondary` | `text-text-secondary` |
| Footer surface | `surface.canvas` | `bg-surface-canvas` |
| Footer divider | `stroke.default` | `border-t border-stroke-default` |
| Font | `font.family.sans` | `font-sans` |

Spacing rides Tailwind's numeric scale, as the system requires: `px-4` (16),
`py-3.5` (14) in the header, `py-3` (12) in the footer. Never `gap-sm` or
`mb-xs` — those emit nothing here.

The dark theme comes for free: every colour above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

### Why `surface.elevated` and not `surface.base`

`surface.base` and `surface.elevated` resolve to the same value in both themes
today, so the choice is about intent, not pixels. A card's whole job is to read
as raised off `surface.canvas` — the usual page background — so `elevated` is
the honest name, and it is the token that will move if the system ever gives
raised surfaces their own value. `surface.base` means "the default surface of a
thing", which is what a page shell or a table body is, not a card. `Input` and
`SegmentedControl` already use `surface.elevated` for the same reason.

Against `surface.canvas` in light, the card is white on a very slightly grey
page; in dark it is a lighter slate on a darker one. The separation is carried
by the border, not by the fill.

### Why `stroke.default` is allowed here

`stroke.default` is **1.48:1** against `surface.elevated` in light and 1.94:1 in
dark. That is far below the 3:1 that WCAG 1.4.11 asks of a UI component
boundary — and it is fine here, because a Card is not a UI component in the
1.4.11 sense. The border is **decorative**: it carries no state, it identifies
no control, and deleting it loses no information, because the surface and
`shadow.card` already separate the card from the canvas. 1.4.11 applies to
boundaries a user must perceive to operate or understand a control.

A form-control border is the opposite case — you have to see where the field is
to use it — which is why `stroke.field` exists at 4.76:1 and why `Input` uses it.
Do not use `stroke.field` on a Card: it makes an inert container shout as loudly
as the controls inside it.

The Claude Design export used the fainter `stroke.subtle` (1.24:1). We use
`stroke.default` — still decorative, but the boundary actually survives a
mediocre monitor.

## Accessibility

- **The title is a real heading.** `title` renders `<h2>`…`<h6>`, defaulting to
  `h3` — the right level for a card sitting under a page `h1` and a section `h2`.
  Set `headingLevel` so the card lands in the correct place in the outline; the
  visual size is fixed by `type.heading-sm` and does not follow the level. All
  the cards in one grid should share a level.
- **A Card is a container, never a control.** It ships no `role`, no `tabIndex`
  and no `onClick`. A whole-card click target has no accessible name, no role, is
  unreachable by keyboard, and hides the real action from a screen reader. Put an
  `<a>` or a `Button` inside and let it be the target.
- **The `<section>` is deliberately unnamed.** An unnamed `<section>` maps to
  `generic`; naming it would make it a `region` landmark, and a grid of twelve
  cards would put twelve entries in the landmark list. If one particular card
  genuinely deserves to be a landmark, pass `aria-labelledby` yourself.
- **The header `action` needs a name.** It is a normal child, so it is in the tab
  order and announced — but an icon-only button is announced as "button" and
  nothing else unless you give it an `aria-label` ("Reconciliation options", not
  "More"). The `Icon` inside stays decorative.
- **Contrast.** Title `text.primary` is 20.2:1 light / 14.7:1 dark on the card;
  body `text.secondary` is 10.3:1 / 11.8:1. Both clear 4.5:1 comfortably.
- **Focus rings and the clip.** The card is `overflow-hidden` so full-bleed
  content and the footer tint respect the radius. The body's `px-4` keeps a
  focus ring (2px outline at 2px offset) clear of the clip. With
  `padded={false}`, give focusable content its own padding — or set it via
  `bodyClassName` — so its ring is not cropped.

## Don't

- Don't hardcode colors or spacing. `className="bg-[#ffffff]"` or a `style` prop
  is a bug — add a token instead. `style` and `bodyStyle` were removed from this
  API for exactly that reason.
- **Don't make the whole card clickable** — no `onClick`, no `role="button"`, no
  `tabIndex={0}` on the root. Put the real link or button inside it.
- Don't skip heading levels to get a smaller title. `headingLevel` changes the
  outline, not the type; the type ramp is fixed at `heading-sm`.
- Don't put the form's label in the card title. The title names the group;
  `Field` names each control.
- Don't nest Cards. Use a divider, a sub-heading, or a plain grouped list.
- Don't use `stroke.field` for the card boundary — that token is reserved for
  form-control edges, and a container that outshouts its controls misleads.
- Don't put focusable content flush against the edge of an unpadded card; the
  radius clip can crop its focus ring.
- Don't reach for `<Card>` when you only want padding. A `div` is cheaper and
  carries no heading semantics you then have to justify.

## Deviations from the Claude Design export

| Export | Here | Why |
|---|---|---|
| `style` and `bodyStyle` props | `className` and `bodyClassName` | Inline styles are how the export smuggled in raw `rgb()`. `npm run lint:tokens` exists to stop that |
| Inline `rgb()` / `var()` fallbacks | Semantic token utilities | Components use semantic tokens only, so dark mode works for free |
| `border: 1px solid stroke.subtle` | `border-stroke-default` | Still decorative, but visible on a poor display |
| `boxShadow: 0 1px 2px rgba(2,6,23,.04)` | `shadow-card` | The existing `shadow.card` token is that shadow, to the alpha |
| `font: 600 16px/1.2` on the title | `text-heading-sm` | Type ramp only. `heading-sm` is 16/1.35 semibold — the line-height is 0.15em looser |
| Title always `<h3>` | `headingLevel`, default `3` | A card has to sit correctly in the document outline |
| Empty `<h3>` when only `action` is passed | Header renders the action alone, right-aligned | An empty heading is a screen-reader trap |
| No text colour on the body | `text-text-secondary` on the root | The card is legible in dark on its own, without a themed ancestor |
| — | `<section>` left unnamed on purpose | Naming it would turn every card into a `region` landmark |

## Token gaps

Reported, not invented — nothing new was added to `tokens/` for this component.

1. **No dark shadow token.** `shadow.card` has no `.dark` override, so a 4%-black
   shadow on `dark.surface.elevated` is invisible. In dark the border does all the
   work of separating the card from the canvas. A `shadow.*` dark scale (or a
   light-coloured rim) would fix this properly.
2. **No "sunken band" surface intent.** The footer reuses `surface.canvas`, which
   means "the page background", not "a recessed band inside a surface". It
   behaves correctly in both themes (slightly darker than the card either way),
   but the name is borrowed. A `surface.sunken` would be the honest token.
   `surface.neutral.subtle` is the other candidate and is no better named.
3. **No decorative-boundary stroke.** The scale runs `stroke.subtle` (1.24:1),
   `stroke.default` (1.48:1), `stroke.field` (4.76:1) — nothing that says "this
   boundary is decorative and that is deliberate". Today the intent lives in this
   document rather than in a token name.
4. **No 16/1.2 semibold step.** The export's title metrics do not exist in the
   ramp; `type.heading-sm` at 16/1.35 is the closest and was used unchanged.
