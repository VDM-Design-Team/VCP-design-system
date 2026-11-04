# MultipartSection *(pattern)*

The card on an Added Value's page that lists its parts: a **Multipart** heading, "33% (1/3 parts completed)", a progress bar and a
`MultipartRow` per part. In editing, **Add Part** sits under the rows. Built to Figma's `Multipart_Section` and the AV edit page.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `ProgressBar` | atom |
| `Tooltip` | atom |
| `MultipartRow` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MultipartSection` | An AV's list of parts, viewing or editing |
| `ChildPartModal` | What **Add Part** (`new`) and a row's edit button (`edit`) should open |
| `MultipartRow` | One part, anywhere else |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `parts` | `MultipartPart[]` | required | In order: the first is part 1. `id`, `title`, `assignee?`, `capacityPoints?`, `dueDate?`, `dueProximity?`, `status?`, `customStatus?`, `completed?` |
| `hint` | `string` | — | The info glyph's words. **Figma draws the glyph, not its text**; without `hint` there is no glyph |
| `onOpenPart` | `(part) => void` | — | A title was pressed. Opening it is the page's |
| `onEditPartTitle` | `(part) => void` | — | A row's edit button (shown on hover or focus) was pressed. Renaming is the page's: open `ChildPartModal` in `edit` mode |
| `onAddPart` | `() => void` | — | **Add Part** (editing). Leave it out to hide the button |

## Progress is worked out here

A part is done when `completed` is true, or its `status` is `Completed`. The percentage, "(1/3 parts completed)" and the bar all come from
`parts`, so they cannot disagree with the rows.

## Layout

The rows share one grid (`MultipartRowGroup`): the points, the dates and the status tags line up in columns, and the status column is only as wide as
the widest tag. **Under 48rem wide the rows stack** (number and title on top, the rest beneath) rather than scroll.

## The flows (the `OnThePage` story)

| Press | What the page does |
|---|---|
| **Add Part** | Opens `ChildPartModal` (`new`; with `statusChange` when the AV is completed). Confirm adds the part, with the default title "(4/4) Parent AV Title" if the field was blank |
| A row's **edit button** | Opens it (`edit`) with the current title. Save renames the part; a blank title puts the default back |

## Tokens

`surface.elevated`, `radius.md`, `space.16` all round and between the header and the rows. The heading is `title-sm-semibold` (16) `text.primary` with a 16 info glyph;
the summary is `label-sm-medium` (14) `text.tertiary`; the bar is `ProgressBar`'s (8 high, brand fill), 8 under the heading. The rows are 12 apart, and **Add Part** (the `secondary`
`Button`, full width) is 12 under them.

## Accessibility

- A `section` named by its heading (an `h2`); the parts are a list. The bar is a `progressbar` named by the summary.
- The info glyph is a button ("About Multipart") with a tooltip.

## Don't

- **Don't count parts yourself.** Pass them; the summary is worked out.
- **Don't open the part on a row click.** The title is the control.
