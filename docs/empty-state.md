# EmptyState

What a panel says when it has nothing to show: no results, no items yet,
nothing assigned. Centred title, optional icon tile, optional explanation,
optional way forward.

## Composed of

Nothing from the system — this piece renders its own markup and takes
composition through its props/slots. `npm test` fails if that changes
without this section changing.

## When to use

| Situation | Use | The action is |
|---|---|---|
| Nothing exists yet | `EmptyState` | Create the first one |
| The viewer's filters excluded everything | `EmptyState` | Clear/widen the filters |
| Truly nothing the viewer can do | `EmptyState` without `action` | — (rare; be sure) |
| Content exists and is on its way | `Skeleton` | — |
| The system is telling the viewer something changed | `Banner` | — |

**The copy is the component.** The slots enforce nothing, so this is the
contract: say *what* is empty, *why*, and *what to do about it*. "No suppliers
match these filters" beats "Nothing here". An empty state with an `action` is an
invitation; without one it is a dead end — before omitting the action, ask
whether that is really true.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | One line: what is empty |
| `description` | `ReactNode` | — | Why, and what would fill it. Wraps at a 384 measure |
| `icon` | `ReactNode` | — | Pass `<Icon name="…" size="lg" />`. The tile is `aria-hidden` — decorative |
| `action` | `ReactNode` | — | The way forward — usually a `Button` (`secondary` reads right against the quiet text) |
| `headingLevel` | `2 \| 3 \| 4` | `3` | The title's heading element. Same look at every level |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The wrapping `<div>` |

## Tokens

Tile `surface.brand.base` with the glyph in `text.brand.medium` (via
`currentColor`, as everywhere); title `text.primary` at `heading-sm`;
description `text.tertiary` at `body-md`. No new tokens.

| Pair | Light | Dark |
|---|---|---|
| Title on `surface.base` | **20.17:1** | **14.63:1** |
| Description on `surface.base` | **7.58:1** | **9.85:1** |
| Description on `surface.canvas` | **7.24:1** | **12.02:1** |
| Tile glyph on tile *(decorative)* | 5.76:1 | 5.45:1 |

## Accessibility

- The title is a real heading — `h3` by default, movable with `headingLevel` so
  the document outline stays honest. It should be the only heading the empty
  panel contributes.
- The icon tile is `aria-hidden`. The title carries the meaning; a decorative
  glyph announcing itself first is noise.
- If the emptiness *arrived* (a search returned nothing just now), the panel
  swap is what screen readers may miss — pair it with the live region of the
  surface that did the searching; this component deliberately owns no
  `aria-live` of its own, because most empty states are the initial render.

## Don't

- **Don't write "Nothing here" / "No data".** Name the thing and the cause.
- **Don't stack two actions.** One way forward; a second belongs in the page
  chrome.
- **Don't use it for errors.** "We couldn't load suppliers" is feedback —
  `Banner` with a retry — not an empty state.
- **Don't put it inside a table row.** It replaces the table's body, centred in
  the panel, or the layout reads as a broken row.
- **Don't hand-build the tile** to get a different colour — the brand tint is
  the system's one empty-state look.
