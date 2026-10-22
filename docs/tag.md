# Tag

A small, rounded-rectangle label that classifies the thing beside it. Passive by
default; with `onRemove` it gets a ✕ button, for a value picked into a field.

## Composed of

| Piece | Tier |
|---|---|
| — | — |

Nothing — Tag is the shared shell, not a composition. `TypeTag` and
`UrgencyTag` compose *this*; their own docs carry a "Composed of" section.

## Tag vs Badge vs Chip vs StatusTag

| Use | For | Shape | Interactive? | Vocabulary |
|---|---|---|---|---|
| `Tag` | Generic classification that needs one of the four Figma styles, or is the base for a new contextual tag; with `onRemove`, a value picked into a field | Rounded-rectangle (`shape.radius.sm`) | Only the ✕, when `onRemove` is given | Generic tones only |
| `Badge` | Generic classification, the common case | Pill (`shape.radius.pill`) | No | Generic tones only |
| `Chip` | A value the user can act on: toggle a filter, open something | Whatever the caller builds | Yes — focusable, clickable, often dismissible | Whatever the caller supplies |
| `StatusTag` *(component)* | A VCP status | Tag's rounded-rectangle | No | VCP's status vocabulary |
| `DueDateTag` *(component)* | An AV's due date | Tag's rounded-rectangle | No | Proximity → tone |
| `TypeTag` / `UrgencyTag` *(components)* | An AV's type or urgency | Tag's rounded-rectangle, `textual` | No | VCP's type/urgency vocabulary |

**`Tag` and `Badge` are separate shapes on purpose, ported from separate
Figma components** (General Design Library `Tag` and `Badge`) — not one
component with two radii. Don't reach for one expecting it to produce the
other's corner.

**Introducing a new contextual tag family (a third `*Tag`) means composing
`Tag`**, the way `TypeTag`/`UrgencyTag` already do and the way
`StatusTag`/`DueDateTag` compose `Tag` — never a new hand-rolled shell.
That was the mistake this component fixes: `TypeTag` and `UrgencyTag`
originally duplicated an identical shell between them instead of sharing one.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `textual \| outline \| tonal \| filled` | `tonal` | All four are VCP's own semantics — GDL's Tag primitive doesn't dictate them |
| `tone` | `neutral \| brand \| info \| success \| warning \| danger` | `neutral` | Generic tones only. VCP vocabulary belongs to a composing piece (`TypeTag`, etc.), never here |
| `size` | `sm \| md` | `md` | 24 / 28 tall, with 12 / 14 type. `sm` for dense tables and inline-with-body-text |
| `onRemove` | `() => void` | — | Renders a ✕ button after the label. The only interactive part of the tag; the tag itself never takes a click |
| `removeLabel` | `string` | `Remove ${children}` | The ✕'s accessible name. **Required in practice when `children` is not a string** — the fallback is a bare "Remove" |
| `icon` / `trailingIcon` | `ReactNode` | — | Decorative — rendered `aria-hidden`. Pass an `Icon`; match its `size` to the tag's |
| `children` | `ReactNode` | — | The label. Never wraps; truncates with an ellipsis when constrained |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLSpanElement>` | — | Points at the outer `<span>` |

Everything else (`id`, `title`, `data-*`, …) is forwarded to the `<span>`.

## Tokens

The full style × tone matrix lives in one place —
`src/lib/classification-tones.ts` — shared with `Badge`. Only the shape
differs between the two:

| Part | Token | Utility |
|---|---|---|
| Radius | `shape.radius.sm` | `rounded-sm` |
| Type ramp, `md` | Poppins 500, 14 | `text-label-sm-medium` |
| Type ramp, `sm` | Poppins 500, 12 | `text-caption-md-medium` |
| Height | Tailwind numeric scale | `h-7` (`md`, 28) / `h-6` (`sm`, 24) |
| Padding | Tailwind numeric scale | `px-2` (8), both sizes |
| Gap | Tailwind numeric scale | `gap-2` (`md`, 8) / `gap-1` (`sm`, 4) |
| ✕ button (`onRemove`) | Tailwind numeric scale | `size-5` (20) round hit area, 10 glyph, `pr-1` on the tag. Textual: no fill; the glyph dims to 70% on hover, in whatever colour the tone gives it |
| Icon colour | — | Inherited from the tone's content token via `currentColor`, unless the icon sets its own colour (see `TypeTag`/`UrgencyTag`) |

The dark theme comes for free — every colour class is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

### Radius: VCP's own measured value, not GDL's

`shape.radius.sm` (6px) is what Tag renders — VCP's own measured corner. If
GDL's `Tag` primitive states a different number in theory, VCP's measured
value still wins here; the two are not required to match. See `docs/badge.md`
for how `Badge`'s corner was previously (and wrongly) measured against this
same Figma `Tag` node.

### Token gaps

- **No `accent.brand.*` triad**, same gap `Badge` documents. `brand`'s
  `outline` style is hand-composed from `stroke.brand.medium` +
  `text.brand.strong` with a plain `bg-transparent` (not a token — "no fill"
  has no colour to name).
- **`textual` reuses each tone's `outline.content` token** rather than a
  dedicated `textual` family, because none exists yet in the semantic layer.
  `TypeTag`/`UrgencyTag`'s own docs already establish this precedent for
  their label colour.

## Accessibility

- **The text is the meaning; the colour is not.** `tonal` fills sit close to
  the surrounding surface, and `textual` has no fill at all — tone alone
  fails 1.4.1 regardless of variant. Always ship a label.
- **Icons are decorative** and rendered `aria-hidden`, so a screen reader
  reads the label once. Pass a plain `Icon` with no `label` — naming both
  double-announces.
- **The ✕ dims on hover, and stays legible.** On the neutral tonal tag the glyph is 9.45:1 light / 8.40:1 dark at rest and 4.15:1 / 5.06:1 at 70% on hover, against the 3:1 a graphic needs.
- **Not a control, so no target size — until it has a ✕.** A plain Tag takes no
  focus and handles no events, which is why the 40 minimum does not apply. With
  `onRemove` the ✕ is a real `<button>`, a sibling of the label (never wrapping
  it), named `Remove <label>`, with a visible focus ring drawn inside it (the tag
  clips its overflow). At 20 it is under the 40 target, the same pointer-dense
  exemption `Chip`'s ✕ takes: do not make removing a tag the only way to change a
  value on a touch-first screen. A tag that should toggle or open something is
  a `Chip`.
- **Truncation keeps the full text out of reach.** Shorten the label; do not
  lean on `title` to recover it.

## Don't

- Don't hardcode colors or spacing. `className="bg-[#dbeafe]"` is a bug — add
  a token instead.
- Don't put a VCP status in a bare Tag. That is a composing piece's job —
  `StatusTag` for statuses, or a new `*Tag` composing this for anything else.
- Don't build a new hand-rolled shell for a new contextual tag. Compose `Tag`.
- Don't put an `onClick` on a Tag — a bare `<span>` with a click handler is
  unreachable by keyboard. `onRemove` is the one supported interaction; anything
  that toggles or opens is a `Chip`.
- Don't reach for `Tag` expecting `Badge`'s pill, or vice versa — they are
  separate Figma components with separate shapes, not one component with a
  configurable radius.
- Don't stack more than a handful in a row. Past four or five they stop
  classifying anything and become texture.

## Rare exceptions

A specific tag or badge occasionally needs to deviate from its base shape or
style set — this is intentionally rare. Handle it as a local override
(`className` on the call site) rather than adding a new variant here for a
one-off; if the exception recurs, that's the signal to promote it into the
shared component instead.
