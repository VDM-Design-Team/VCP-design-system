# PageTitle

The band under the top bar that says which page you are on: an optional back
control, the page's `h1`, an optional subtitle, and a slot for the page's
actions.

Read off the Figma `Page_Template` → `Page_Title` (8 Sep 2026).

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Icon` | atom | The back arrow, when back is an `href` |
| `IconButton` | atom | The back arrow, when back is a history action |

The import rows are checked against the real imports — `npm test` fails if this
list drifts.

## When to use

| Use | For |
|---|---|
| `PageTitle` | Naming any page inside `AppShell` |
| `AVHeader` | An Added Value's page — it adds the status-progression buttons |
| `Breadcrumb` | Where you are in a hierarchy. It sits *with* a title, not instead of one |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | The page's one `h1` |
| `subtitle` | `ReactNode` | — | A line beneath. The design draws it and hides it by default |
| `backHref` | `string` | — | Renders a real link. **Preferred** |
| `onBack` | `() => void` | — | Back as history. Renders an `IconButton` |
| `backLabel` | `string` | `'Back'` | Say where it goes — "Back to my Added Values" |
| `actions` | `ReactNode` | — | The page's actions, right-aligned |

## Measurements

| | Design | Ours |
|---|---|---|
| Band, no back arrow | 75 | **74** |
| Padding | 32 top / 16 bottom / 32 sides | same |
| Title row | 27 | 26 |

The one pixel is the type ramp: `heading-md` is 20/26 where the design's title
row is 27. That is the ramp's business, not this component's — the same
one-step difference `Button`'s `sm` carries against the design's 37.

**With a back arrow the band is 88, not 75.** The control is 40 tall because
that is the touch-target minimum, and it is taller than the text beside it.
`AVHeader` makes the same trade for the same reason. The design's `Back Nav`
frame is 27, but no rail I measured actually draws the arrow, so there is no
design height to match — if design draws one at 27, that is a conversation
about the target size, not a number to copy.

## Its relationship to AVHeader — unresolved

**They draw the same band.** `Page_Title` in Figma carries a hidden
`Status_Progression` instance, which is exactly what `AVHeader` renders. On that
reading they are one component and `AVHeader` should be this plus the buttons.

They are kept separate because **one measurement disagrees**: `AV_Header` insets
**16** from the sides, `Page_Title` insets **32**. Merging them on the assumption
that one of those is a mistake would be guessing.

⚠️ **For design:** are `AV_Header` and `Page_Title` the same component? If yes,
`AVHeader` becomes `PageTitle` + `StatusProgression`, and one of the two
paddings is wrong. Tracked in `docs/figma-audit.md`.

## Accessibility

- The page's **one `h1`**. `TopBar` deliberately has no heading so this can hold
  it, and two `h1`s on a page is worse than none.
- The back control is a real link when given `backHref`, so middle-click and
  open-in-new-tab work; a `<button>` only when back is genuinely history.
- `backLabel` is the accessible name. "Back" tells a screen-reader user nothing
  they did not already know — say where it goes.
- The title truncates rather than wrapping, so a long name cannot push the
  actions off the row.

## Don't

- **Don't render two of them on a page.** It carries the `h1`.
- **Don't use it on an AV page** — `AVHeader` is that, and it owns the status
  buttons.
- **Don't put the page's primary action here by reflex.** In `Page_Template` the
  primary CTA ("Create Added Value") lives in the **top bar**, not this band.
