# Tag

A small, non-interactive, rounded-rectangle label that classifies the thing
beside it.

## Composed of

| Piece | Tier |
|---|---|
| — | — |

Nothing — Tag is the shared shell, not a composition. `TypeTag` and
`UrgencyTag` compose *this*; their own docs carry a "Composed of" section.

## Tag vs Badge vs Chip vs StatusPill

| Use | For | Shape | Interactive? | Vocabulary |
|---|---|---|---|---|
| `Tag` | Generic classification that needs one of the four Figma styles, or is the base for a new contextual tag | Rounded-rectangle (`shape.radius.sm`) | No | Generic tones only |
| `Badge` | Generic classification, the common case | Pill (`shape.radius.pill`) | No | Generic tones only |
| `Chip` | A value the user can act on: a selected filter, a removable tag | Whatever the caller builds | Yes — focusable, clickable, often dismissible | Whatever the caller supplies |
| `StatusPill` *(component)* | A VCP status | Badge's pill | No | VCP's status vocabulary |
| `TypeTag` / `UrgencyTag` *(components)* | An AV's type or urgency | Tag's rounded-rectangle, `textual` | No | VCP's type/urgency vocabulary |

**`Tag` and `Badge` are separate shapes on purpose, ported from separate
Figma components** (General Design Library `Tag` and `Badge`) — not one
component with two radii. Don't reach for one expecting it to produce the
other's corner.

**Introducing a new contextual tag family (a third `*Tag`) means composing
`Tag`**, the way `TypeTag`/`UrgencyTag` already do and the way
`StatusPill`/`DueDatePill` compose `Badge` — never a new hand-rolled shell.
That was the mistake this component fixes: `TypeTag` and `UrgencyTag`
originally duplicated an identical shell between them instead of sharing one.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `textual \| outline \| tonal \| filled` | `tonal` | All four are VCP's own semantics — GDL's Tag primitive doesn't dictate them |
| `tone` | `neutral \| brand \| info \| success \| warning \| danger` | `neutral` | Generic tones only. VCP vocabulary belongs to a composing piece (`TypeTag`, etc.), never here |
| `size` | `sm \| md` | `md` | 24 / 28 tall. `sm` for dense tables and inline-with-body-text |
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
| Type ramp, `md` | `type.label.lg` — Poppins 500, 14/20 | `text-label-lg` |
| Type ramp, `sm` | `type.label.md` — Poppins 500, 13/18 | `text-label-md` |
| Height | Tailwind numeric scale | `h-7` (`md`, 28) / `h-6` (`sm`, 24) |
| Padding | Tailwind numeric scale | `px-2` (8), both sizes |
| Gap | Tailwind numeric scale | `gap-2` (`md`, 8) / `gap-1` (`sm`, 4) |
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
- **Not a control, so no target size.** Tag takes no focus and handles no
  events, which is why the 40 minimum does not apply. The moment it becomes
  clickable that stops being true — use `Chip`.
- **Truncation keeps the full text out of reach.** Shorten the label; do not
  lean on `title` to recover it.

## Don't

- Don't hardcode colors or spacing. `className="bg-[#dbeafe]"` is a bug — add
  a token instead.
- Don't put a VCP status in a bare Tag. That is a composing piece's job —
  `StatusPill` for statuses, or a new `*Tag` composing this for anything else.
- Don't build a new hand-rolled shell for a new contextual tag. Compose `Tag`.
- Don't make a Tag clickable or dismissible without becoming a `Chip`-shaped
  wrapper around it — a bare `<span>` with an `onClick` is unreachable by
  keyboard.
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
