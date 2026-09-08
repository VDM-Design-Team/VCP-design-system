# SidebarItem

One row of the navigation rail — a glyph, a label, an optional count. The
piece `Sidebar` is built from, and the reason `Sidebar` can be a pattern
rather than a 200-line component.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Icon` | atom | The row's glyph, typed to `IconName` |
| `Badge` | atom | The count, filled brand so it survives the selected fill |

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
| `badge` | `string \| number` | — | A count beside the label |
| `href` | `string` | — | Renders an `<a>`. **Preferred** |
| `onNavigate` | `() => void` | — | Renders a `<button>`. Programmatic navigation only |

`href` and `onNavigate` are both optional, but a row with neither is inert —
it renders a `<button>` that does nothing. Pass one.

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

- the brand-tinted fill, `surface.brand.subtle`, with `text.brand` over it;
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

## The badge is filled, not tonal

`Badge tone="brand"` is `surface.brand.faint` — paler than the selected row's
own `surface.brand.subtle`, so a tonal badge would sit *lighter* than the row
it is on. The filled pair (`action.primary`) reads on both the plain and the
selected fill, and it is what the export drew.

## Accessibility

- A real link or button: focus ring, keyboard reachable, correct role.
- **40 tall** — meets the 40 touch-target minimum exactly, which is why `size`
  is not a prop. Do not shrink it.
- `aria-current="page"` on the selected row.
- `aria-label` carries the name when collapsed; the icon is decorative
  (`Icon` renders `aria-hidden` unless given a label).
- The label truncates rather than wrapping, so a long name cannot push the
  badge out of the row.

## Don't

- **Don't use it outside primary navigation.** A list of choices over a
  trigger is `Menu`; sections of one page are `Tabs`.
- **Don't rely on `selected` for colour alone** — it is already doing the
  markup half; don't strip `aria-current` by rendering your own row.
- **Don't wrap an expanded row in a `Tooltip`.** The label is right there.
- **Don't pass an arbitrary node as `icon`** — it is typed to `IconName` so
  the system's set stays the set. A glyph the system lacks is a request for
  an icon, not an escape hatch.
