# TableEmpty

What every table says when it has no rows. One look and one set of words, so tables cannot drift apart: the brand-tinted icon tile, a title that names what is missing, and a way out. It is `EmptyState` with the table rules built in.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `EmptyState` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Situation | Use |
|---|---|
| A table has no rows | `TableEmpty`, in the table's `empty` prop |
| A table has no rows and the page sets no `empty` | Nothing to do: `DataTable` shows a generic `TableEmpty` |
| A card or panel that is not a table is empty | `EmptyState` |

## The rule

Two cases, and only two:

| Case | Icon | Title | Under it |
|---|---|---|---|
| **Nothing yet** | The table's own glyph (`icon`) | "No {noun} yet." | Nothing, or the page's `action` |
| **Filtered** (`filtered`, or a `search`) | Magnifying glass, always | "No {noun} match these filters." or "No {noun} match “{search}”." | A sentence on what to try (`hint`), and **Reset** when the page gives `onReset` |

A table passes its **plural noun** and its **icon**, never its own sentences. **Reset** is the word `FilterBar` uses, so the recovery reads the same on every page. Say which fields the search covers in `hint` ("Try a different name, email or role.").

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `noun` | `string` | — | The plural, lower case: "accounts". Without one the words are generic ("Nothing here yet.", "Nothing matches these filters.") |
| `icon` | `IconName` | `list-bullets` | The "nothing yet" glyph. Filtered always shows `magnifying-glass` |
| `filtered` | `boolean` | — | The filters or the search are why there are no rows |
| `search` | `string` | — | The search text: names the empty result, and means `filtered` |
| `hint` | `ReactNode` | "Try a different search, or change the filters." | What to try, when filtered |
| `onReset` | `() => void` | — | Shows **Reset** under a filtered result. **Optional**: leave it out (or pass `undefined`) and there is no Reset, for a page with nothing to put back |
| `action` | `ReactNode` | — | The way forward when there is nothing yet. Leave it out when the table's header already has "New …" |
| `title` | `ReactNode` | from `noun` | Replaces the title. For a table whose Figma draws other words (Holiday, Manuals); the icon, layout and **Reset** stay the system's |
| `headingLevel`, `className`, `ref` | | | As `EmptyState` |

## Tokens

None of its own: `EmptyState`'s (tile `surface.brand.base`, glyph `text.brand.medium`, title `text.primary`, description `text.tertiary`). No new tokens.

## Accessibility

- The title is a real heading, as in `EmptyState`; the tile is decorative.
- **Reset** is a real button named "Reset" (40 high targets follow `Button`'s `sm` rule inside the table card).
- **Reset goes away when it works** (the filters clear, the rows return), so the focused button unmounts. The page must move focus on, to the first filter, instead of letting it fall to the page: `HolidayTable` does, and its `ResetKeepsFocus` story shows it. `TableEmpty` cannot do this itself, because the filters are the page's.
- Tab reaches **Reset** in one stop, in reading order after the text, with `Button`'s 2px focus ring (checked: solid 2px, offset 2).
- When a search or filter *just* emptied the table, pair it with the live region of what did the searching; this piece owns no `aria-live`.

## Don't

- **Don't write the sentences in the table.** Pass the noun and the icon; the words are here.
- **Don't use a different glyph for "filtered".** It is the magnifying glass everywhere.
- **Don't put it inside a row.** It replaces the table's body (`DataTable`'s `empty` already does).
- **Don't use it for an error.** "We couldn't load accounts" is a `Banner` with a retry.
