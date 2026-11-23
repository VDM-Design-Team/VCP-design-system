# PageTitle

The band under the top bar that says which page you are on: an optional back
control, the page's `h1`, an optional subtitle, and a slot for the page's
actions.

Read off the Figma `Page_Template` → `Page_Title` (8 Sep 2026).

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Icon` | atom | The back arrow, for both the link and the history button |

The import rows are checked against the real imports — `npm test` fails if this
list drifts.

## When to use

| Use | For |
|---|---|
| `PageTitle` | Naming any page inside `AppShell`, an Added Value's page included (`size="sm"`, below) |
| `Breadcrumb` | Where you are in a hierarchy. It sits *with* a title, not instead of one |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | The page's one `h1` |
| `subtitle` | `ReactNode` | — | A line beneath. The design draws it and hides it by default |
| `backHref` | `string` | — | Renders a real link. **Preferred** |
| `onBack` | `() => void` | — | Back as history. Renders a `button` |
| `backLabel` | `string` | `'Back'` | Say where it goes — "Back to my Added Values" |
| `beside` | `ReactNode` | — | Something beside the title, on its left: a view switch (the dashboard's Cycle / Quarter). With it set, the left group wraps, so the switch drops under the title in a narrow page instead of squeezing it, and the band has no column gap between its two sides (the actions already stand clear, and the room goes to them) |
| `actions` | `ReactNode` | — | The page's actions, right-aligned, on the title's centre line (at the top when there is a `subtitle`). The slot wraps and is capped to the band's width, so a row of filters breaks onto a second line instead of overflowing |
| `size` | `sm \| md` | `md` | The title's size. `md` is 18 semibold in `text.secondary`. **`sm` is an Added Value's page: 14 regular in `text.primary`**, Figma's `Viewing AV Page Title` (below) |

## Measurements

| | Design | Ours |
|---|---|---|
| Band, no back arrow | 75 | **74** |
| Padding | 32 top / 16 bottom / 32 sides | same |
| Title row | 27 | 26 (`body-lg-semibold`, 18/26) |

The one pixel is the type ramp: the 18 step is 26 high where the design's title
row is 27. That is the ramp's business, not this component's — the same
one-step difference `Button`'s `sm` carries against the design's 37.

**The back arrow hugs its glyph** (design review): a 20 × 20 icon with no padding either
side, and 8 between it and the title. It is in the neutral palette —
`neutral.outline.content` default, hover and pressed — not the action blue, which was
only the ghost button's default and is not in Figma (Figma's arrow is a dark grey, the
title `text/primary`). The title is `text.secondary` in both sizes. Because the arrow
is smaller than the 40 touch-target minimum, a `::after` stretches the pointer target
to 40 × 40 (10 each way) without taking layout room, so nothing beside it moves. The band with a
back arrow is therefore the same height as without (74): the arrow is shorter than
the title row.

**The back control and the title are vertically centred on each other**, as Figma's
`Back Nav` is (counter-axis centre). With a subtitle, the title and subtitle are
centred as one block against the arrow.

## An Added Value's page is `size="sm"` (settled 20 November 2026)

Figma's `Page_Title` has four types: **Page Title**, **Creating New Added Value**, **Edit Added Value** and **Viewing AV Page Title**. The last one is an Added Value's page: the back arrow, the reference at **14 regular in `text.primary`** (`#020617`), and on the right the status buttons and the ⋮ menu. So the AV page uses this component, and there is **no separate `AVHeader`** (it was Figma's older, standalone `AV_Header` in the library's Navigation page, inset 16 on the sides where the real pages' `Page_Title` is inset 32, which is what we draw).

| Page | `PageTitle` | `actions` |
|---|---|---|
| Viewing an Added Value | `size="sm"`, `title` = the reference, a back control | `StatusProgression`, then `DetailCardMenu` (the ⋮ menu) |
| Creating or editing one | `md` ("Added Value Creation", "Edit Added Value"), a back control | nothing: the status buttons are in the bar at the bottom |

`AVPage` composes it: its `header` prop takes `role`, `status` (or `step` and `chain`), `onTransition` and `menu`, and puts the status buttons and then the menu in `actions`. **The menu comes after the buttons, on their right.** What is in the ⋮ menu is `DetailCardMenu`'s (it owns the role and status rules, `docs/detail-card-menu.md`): the page passes only the handlers. A page that is not an Added Value's passes its own actions here.

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
- **Don't make a second title band for an Added Value.** `size="sm"` with the status buttons and the menu in `actions` is that page's, as Figma's `Viewing AV Page Title` draws it.
- **Don't put the page's primary action here by reflex.** In `Page_Template` the
  primary CTA ("Create Added Value") lives in the **top bar**, not this band.
