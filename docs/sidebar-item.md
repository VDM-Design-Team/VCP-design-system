# SidebarItem

One row of the navigation rail — a glyph, a label, and either a destination or
a set of sub-items. The piece `Sidebar` is built from, and the reason
`Sidebar` can be a pattern rather than a 200-line component.

Read off the Figma `SideBar` page (audit batch 3, 8 Sep 2026).

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Icon` | atom | The row's glyph and the disclosure chevron, typed to `IconName` |

The import rows are checked against the real imports — `npm test` fails if
this list drifts.

## When to use

| Use | For |
|---|---|
| `SidebarItem` | A row in the app's primary navigation |
| `Menu` / `MenuItem` | A temporary list of choices over a trigger |
| `Tabs` | Sections of the *same* page — a sidebar changes page |
| `Breadcrumb` | Where you are in a hierarchy, not where you can go |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | The row's text, and its accessible name when collapsed |
| `icon` | `IconName` | — | The system's own set, so a typo is a compile error |
| `selected` | `boolean` | `false` | The current page. Sets `aria-current="page"` as well as the fill |
| `collapsed` | `boolean` | `false` | Icon-only rail. The label survives as the accessible name |
| `href` | `string` | — | Renders an `<a>`. **Preferred** |
| `onNavigate` | `() => void` | — | Renders a `<button>`. Programmatic navigation only |
| `items` | `SidebarSubItem[]` | — | Sub-rows. Their presence makes the row a disclosure |
| `open` / `defaultOpen` / `onOpenChange` | — | — | Controlled or uncontrolled disclosure |

`href` and `onNavigate` are both optional, but a leaf row with neither is
inert — it renders a `<button>` that does nothing. Pass one.

## Expandable rows

The design's item set has three axes — `Status` (Default/Focused),
`Right Icon` (On/Off) and `Dropdown Item` (Yes/No). `items` drives the last
two: give a row children and it gains the chevron and opens a list beneath
itself. **`Archive` and `Planning` are the two rows the design draws this
way.**

An expandable row is a **disclosure, not a link**: a
`<button aria-expanded aria-controls>` over a labelled list, the same contract
`Accordion` uses. A control that reveals something is not a control that goes
somewhere, and conflating them is how a nav ends up with links that do not
navigate.

Open, the whole group lifts onto `surface.elevated` — the design's white card
— so the children read as belonging to the row above rather than to the rail.
When the parent is *also* the current page it tints brand and the children
stay on white, which is the design's third Planning variant.

Sub-rows are **32 against the design's 33**, carry no glyph, and are indented
instead. The indent is what says they belong to the row above.

## A real control, not a clickable div

The export shipped a `div` with `onClick`. That cannot be reached by keyboard,
takes no focus ring, and announces as nothing to a screen reader. This renders:

- an **`<a href>`** when given `href` — the preferred form, because
  middle-click, copy-link and open-in-new-tab all work, and the browser owns
  navigation;
- a **`<button>`** only when navigation is genuinely programmatic.

The same split `Breadcrumb` makes, for the same reason.

## The selected row

`selected` does two things, and the second is the one that matters:

- the brand-tinted fill, `surface.brand.subtle`, with `text.brand.strong` over
  it — 8.97:1 in light, 6.14:1 in dark. (Until 10 Sep 2026 the class named a
  `text.brand` token that does not exist, so the row inherited black: fine on
  the light tint, 2.32:1 on the dark one. Found by the story tests.);
- **`aria-current="page"`**, which is what tells a screen reader which row is
  the page you are on.

Colour alone would leave that fact visible only to people who can see it. The
fill is the sighted half of a fact the markup carries anyway.

## Collapsed

In the 76-wide rail the label is hidden. If it simply vanished, so would the
row's accessible name — an icon-only link that announces as nothing. So the
label moves to `aria-label` and a screen reader still reads "Dashboard".

Sighted users get it back from a `Tooltip`, which **`Sidebar` wraps around
collapsed rows** rather than this component wrapping itself: a tooltip on
every row of an expanded sidebar would be noise, and the expanded rail already
shows its labels.

## What the export invented

This shipped first as a port of the Claude Design export, which turned out to
describe a different component. The audit against the Figma `SideBar` page
(batch 3, 8 Sep 2026) found:

- **A count badge that does not exist.** The export drew a solid blue pill
  with a number in it. No item variant in the design has one. Removed.
- **No `Right Icon` axis and no dropdown.** The export's item was a flat row,
  so `Archive` and `Planning` — the two expandable rows — had nowhere to go.
- **A 24 icon slot** against the design's 32.

The same export previously invented seven statuses and a `Review No Action`
state. It is a useful sketch of intent and not a specification; audit before
porting, which is what `docs/figma-audit.md` says and what was skipped here.

## Accessibility

- A real link or button: focus ring, keyboard reachable, correct role.
- **40 tall** — meets the touch-target minimum exactly, which is why `size` is
  not a prop. Do not shrink it.
- An expandable row is `aria-expanded` + `aria-controls` over a real list, so
  a screen reader is told it discloses rather than navigates.
- `aria-current="page"` on the selected row.
- `aria-label` carries the name when collapsed; the icon is decorative
  (`Icon` renders `aria-hidden` unless given a label).
- The label truncates rather than wrapping, so a long name cannot push the
  chevron out of the row.

## Don't

- **Don't use it outside primary navigation.** A list of choices over a
  trigger is `Menu`; sections of one page are `Tabs`.
- **Don't rely on `selected` for colour alone** — it is already doing the
  markup half; don't strip `aria-current` by rendering your own row.
- **Don't wrap an expanded row in a `Tooltip`.** The label is right there.
- **Don't pass an arbitrary node as `icon`** — it is typed to `IconName` so
  the system's set stays the set. A glyph the system lacks is a request for
  an icon, not an escape hatch.
- **Don't give an expandable row an `href`.** It discloses; it does not
  navigate. `items` and `href` describe different controls.
