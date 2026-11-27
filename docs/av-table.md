# AVTable

The Added Value table — the list every VCP workspace is built around.
`DataTable` specialised, exactly as `docs/data-table.md` says the VCP tables
should be: the generic table keeps the `<table>` semantics, the sorting
contract and the selection contract, and this adds the nine columns and
nothing else.

Read off the Figma `AV_Table` (`6785:35414`) and the `_AV_Table_Header_Item`
(nine types) and `_AV_Table_Row` (four variants) sets on the Added Value Table
page, audit batch 5, 11 September 2026.

## Composed of

| Piece | Tier |
|---|---|
| `CopyText` | atom |
| `TruncatedText` | component |
| `Button` | atom |
| `Divider` | atom |
| `Icon` | sub-atomic |
| `Tag` | atom |
| `Tooltip` | atom |
| `TypeTag` | atom |
| `UrgencyTag` | atom |
| `AvatarGroup` | component |
| `DataTable` | component |
| `DueDateTag` | component |
| `Pagination` | atom |
| `StatusTag` | component |
| `MultipartParentChip` | component |
| `MultipartTableTag` | component |
| `TableCard` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AVTable` | Any list of Added Values — the workspace, a filtered view, search results |
| `DataTable` | A table of something that is not an Added Value |
| `StatusTag` etc. | One AV's facts outside a table — a card, a detail panel |

**It owns no mapping.** Every cell that has a vocabulary defers to the piece
that owns it: `StatusTag` for status, `UrgencyTag` for urgency, `TypeTag` for
type, `DueDateTag` for how near a date is. This pattern decides *which columns
exist and in what order*, and that is all — which is the difference between a
pattern and a second copy of the system.

**It does not sort, filter or paginate.** `rows` renders in the order given and
`page` is whatever the caller says, the same contract `DataTable` sets. The
order of a thousand Added Values is the server's business.

## The columns

| Column | Sortable | Cell |
|---|---|---|
| Checkbox | — | Optional. `selectable` |
| Task Title | ✓ `title` | Reference, divider, title; domain badge and counts below |
| Due Date | ✓ `due` | `DueDateTag` |
| Urgency | — | `UrgencyTag` |
| Type | — | `TypeTag` |
| Status | — | `StatusTag` |
| Members | — | `AvatarGroup`, with `tooltips`: hover an avatar for the name and `role` (the `+N` lists the rest) |
| Last Updated | ✓ `lastUpdated` | Already-formatted text |
| Actions | — | Optional. `actions` |

Three of the nine are optional, and they are the design's own four row
variants. Default draws seven; `selectable` adds the leading checkbox;
`actions` adds the trailing menu. Figma draws Default, Checkbox, Checkbox
Selected and Action Column — the same two booleans, so they are booleans here
rather than a `variant` prop.

## The reference copies; the title opens

The reference ("VCP-12345") is a `CopyText`: it underlines on hover, **copies the reference on click** and says "Copied" for a moment, as Figma's `_AV_Table_ID` draws it (Default, and a Tooltip state with the bubble). It does not open the AV. With `onOpen`, **the title** is the button that opens it, as in the Planning table. Figma's prototype draws no click on the title, so the title is our choice of where opening lives; if design wants another, it is a change in this one place.

**The title keeps room to be pressed.** It is the way into the AV, so it never gets narrower than **160** (`min-w-40`, about sixteen characters): in a squeezed table the whole table scrolls sideways before the title is cut to a sliver. **On hover the title turns brand blue and underlines**, as the Planning table's does, to show it is a button. Figma draws neither the hover nor a click on the title, so both are proposals: see the questions on the PR that added them.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `AVTableRow[]` | required | Rendered **in the order given** |
| `filters` | `ReactNode` | — | A `FilterBar` or search box. Given, the table is drawn in a `TableCard` with the filters above it and the pagination at its foot (the table itself goes borderless). Without it, nothing changes |
| `sort` / `onSortChange` | `DataTableSort` / `(sort) => void` | — | Keys: `title`, `due`, `lastUpdated` |
| `selectable` | `boolean` | — | Adds the leading checkbox column |
| `selected` / `onSelectedChange` | `string[]` / `(ids) => void` | `[]` | Ids are `row.id` |
| `onOpen` | `(row) => void` | — | Given, the **title** is a button that opens the AV; omitted, it is text. The reference is always click-to-copy (below) |
| `actions` | `(row) => ReactNode` | — | Adds the trailing Actions column |
| `onDeleteSelected` | `(ids) => void` | — | The destructive button above the pagination |
| `deleteSelectedLabel` | `(count) => string` | `Delete Selected (n)` | |
| `page` / `pageCount` / `onPageChange` | — | — | Pagination renders only when **all three** are given |
| `itemCount` / `pageSize` / `pageSizeOptions` / `onPageSizeChange` | — | — | Passed to `Pagination`: the "1-50 of 1,250" range (`itemCount` and `pageSize`) and the Items select (`onPageSizeChange`), as Figma's Manage table draws them. The rows stay yours to slice |
| `hints` | `AVTableHints` | Urgency, Type, Status: the product's copy | The info tooltips — see below |
| `empty` | `ReactNode` | `DataTable`'s | An `<EmptyState>` fits |
| `caption` | `string` | `'Added Values'` | Visually hidden `<caption>` |

### `AVTableRow`

`id` and `ref` and `title` are required; everything else is optional, and an
absent value draws **nothing** — no dash, no em-dash placeholder. A column of
blanks reads as "not set", which is the truth; a column of dashes reads as a
value someone chose.

```tsx
{
  id: 'av-1',
  ref: 'VCP-12345',
  title: '[VCP] Collapsible Sidebar…',
  domain: 'VCP',
  attachments: 3,
  comments: 1,
  due: { date: '2025-10-01', proximity: 'due-soon' },
  urgency: 'Normal',
  type: 'Type 3',
  status: { custom: 'Ready for Deploy' },   // or { status: 'Review' }
  members: ['Ali Rahman'],
  lastUpdated: '7 days ago',
}
```

`due.date` is **ISO** (`yyyy-mm-dd`): `DueDateTag` shows it dd/mm/yyyy, or the person's
locale. Do not format it yourself (`due.label` is only for text that is not a date).
`lastUpdated` is **already formatted** ("7 days ago"). This table does no
date maths and no relative time — see `docs/due-date-tag.md` for why the
threshold is not a design-system decision.

### The row's own state: BESA Passed, Rejected, Backlogged

| Field | Draws | Where | Tooltip |
|---|---|---|---|
| `besaPassed: true` | a green seal (16, the same as the other flags) | right after the reference, before the rule | "BESA Passed" |
| `rejected: { reason }` | a red warning glyph (16) | the end of the details, after the counts | "Rejected: " and the reason |
| `backlogged: { reason }` | an info glyph (16, grey: `text.tertiary`, as the header hints) | the end of the details, after the counts | "Backlogged: " and the reason |

Figma's `BESA_Passed_AV`, `Rejected_AV_Indicator` and `Backlogged_AV_Indicator`. Each tooltip says what the glyph is first, then the reason (Figma's tooltip is the reason alone; the lead word is added so a glyph never has to be guessed). Each is a button named by that same sentence, so the keyboard reaches the tooltip (a tooltip needs a focusable trigger), and it is not read twice. They show on any row, multipart or not.

Two colour decisions (17 November 2026):

- **Backlogged is grey, not Figma's green.** Figma draws the Backlogged glyph in the seal's green. Here it takes the grey of the Backlog status tag and of the header hints, so green in a row means BESA Passed and nothing else. A recorded difference from Figma; Figma's `Backlogged_AV_Indicator` follows the code.
- **The seal keeps Figma's green.** It is the green of the toast and banner glyphs (`accent.success.outline.border`), 2.2:1 on white in the light theme, under the 3:1 a glyph that stands alone should clear. Kept as a known exception: the tooltip and the control's name both say "BESA Passed". Dark is 4.5:1.
 The table does not decide which AVs are rejected or backlogged, or where the reason comes from: pass what the AV carries.

### `hints`: all four have copy

Figma puts an info glyph on four headers — Urgency, Type, Status, Members. All four have the product's
copy, three owned by the piece each describes (`URGENCY_COLUMN_HINT`, `TYPE_COLUMN_HINT`, `STATUS_COLUMN_HINT`), so
every table says the same thing:

| Column | Says |
|---|---|
| Urgency | "Indicates how urgent or important an Added Value is compared to others" |
| Type | **Type 1:** Direct KPI impact with clear ROI / **Type 2:** Indirect impact, enablement/optimization / **Type 3:** Non-critical, no meaningful KPI impact (one a line, the type in bold) |
| Status | "Reflects the current stage of the Added Value (e.g., in progress, completed)." |
| Members | "Displays the people assigned to or responsible for the Added Value" |

`MEMBERS_COLUMN_HINT` lives with the table, because no piece owns the Members vocabulary; the sentence is Figma's, from the Assigned page, with "Added Value" where Figma writes "task" (decided 17 November 2026: the column tooltips say "Added Value"; Urgency's and Status's say it too).
Pass a string (or node) to change a column's copy, or `''` to drop its glyph.

## Multipart rows

An Added Value split into parts shows in the table (Figma's `Multipart in AV Table`, `_AV_Table_Item_AV_Title_Multipart`). Give a row `multipart`:

| `multipart` | What the row shows |
|---|---|
| `{ kind: 'parent', completed, total }` | **The parent.** A `MultipartTableTag` under its reference with a progress ring of how many parts are done, and **a 6 brand edge at the row's far left** (`surface.brand.medium`) |
| `{ kind: 'child', position, total, parentRef, parentHref? }` | **A part.** A `MultipartTableTag` with its place ("2/3"), and a **Parent: VCP-4321** chip (`MultipartParentChip`) among the details. With `parentHref` the chip is a link that **opens the parent in a new tab**; with only `onOpenParent` it is a button that asks; with neither it is plain text (nowhere to go) |

**The layout is deliberately not Figma's two columns (decided 20 November 2026; read this before "fixing" it).** Figma's `_AV_Table_Item_AV_Title_Multipart` draws the reference with a **28 tag under it**, a rule, and the title with **the details starting under it**. Ours is one row shape for every row, multipart or not: the reference, a rule and the title on top, and **one line of metadata under it, starting at the cell's left edge**, with **the multipart tag first on that line, 24 high** (12 type, 16 glyphs; its tooltip still opens above). A row without `multipart` is unchanged. The reasons, which the design lead gave when raising it with CDL:

1. **The 28 is a mistake in the first multipart design.** The tag was drawn in a column of its own; it is the only tag in the row taller than the 24 domain tag (`Tag` `sm`), so it cannot share a line with the others at that height.
2. **Uneven ids move the details.** In Figma's two columns the details start under the *title*, whose left edge follows the width of the reference. With ids of four, five and six digits (VCP-4321, VCP-54321, VCP-654321) the domain tag, the Parent chip and the counts start further right, row by row; a longer id or the Parent chip pushes them further and widens the space between them and the tag, which hurts on small screens. At the cell's left edge they start in the same place in every row.
3. **One row shape**, multipart or not, for the table and for whoever builds on it.

History: the 24 one-line version was built on #275, replaced by Figma's 28 on 10 November 2026, proposed again on #424 and kept at 28 on 17 November 2026, then decided for 24 on 20 November 2026. Do not go back to the two columns without a new decision, and record it here.

**The metadata never shrinks or is cut** (the tag, domain tag, parent chip, counts): it hugs its content. So a multipart row's title column has a floor of 28rem, and below it the table scrolls sideways; only the title itself gives way, ending in "…" (and says the whole of it on hover and focus: `TruncatedText`).

**The parent's edge is at the row's far left**, before the checkbox when the table is `selectable` (design's decision), and takes no room. It is `DataTable`'s `rowEdge`, drawn over the row's first cell, not as a border on the row: a border on a row of a collapsed table nudges the whole table (the header too) to make room for it.

*Not built yet, and fine to leave for later:* the rejected and backlogged indicators in the title cell (Figma draws them after the counts).

## Accessibility

- A real `<table>` with `scope="col"` headers and `aria-sort` on the sorted
  one, inherited from `DataTable`. Cell-by-cell navigation is assistive tech's
  whole affordance for tabular data.
- **No whole-row click target.** The title is the button that opens the AV, so
  a screen-reader user hears the AV's name ("Audit every empty state…, button")
  rather than a bare code. The reference is a separate button that copies it
  (its name is the reference, "VCP-12511"; "Copied" arrives in a polite live
  region).
- **Every checkbox names its AV**, not "row 3", so two rows never announce
  alike.
- **Counts announce their noun.** "3" beside a paperclip is "3 attachments" to
  a screen reader, singular or plural as the number requires.
- **Header hints are outside the sort button.** A header that both sorts and
  explains would otherwise nest one interactive element inside another:
  invalid, and the inner one unreachable by keyboard. `DataTable.hint` renders
  as a sibling for exactly this reason.
- The urgency and type glyphs are decorative and the words beside them carry
  the meaning, so no cell announces twice.
- **Colour is never the only cue** in any column: urgency and type have
  distinct glyph shapes, status and due date are words.

## Don't

- **Don't re-derive a mapping here.** If a cell needs to know that Urgent is
  red or that Review has two treatments, the piece that owns it already does.
  A `tone={…}` ternary in this file is a bug.
- **Don't sort `rows` inside the table.** It renders what it is given.
- **Don't add a row-level `onClick`.** `DataTable` refuses those and is right
  to; give the cell the real control.
- **Don't render a dash for a missing value.** Draw nothing.
- **Don't copy this for the Budget, Holiday or Availability tables.** They
  specialise `DataTable` the same way, beside this one.

## Deviations from Figma

- **The domain tag** is `Tag tone="brand"` — `text.brand.strong` on
  `surface.brand.faint`. Figma writes the word in `text.brand.medium`. One step
  of brand navy apart on the text; the `Tag` tone is used so every brand
  chip in the system stays one colour.
- **Pagination is the repo's `Pagination`**, which since 5 Oct 2026 draws
  Figma's `VCP_Pagination`: First/Last, an ellipsis for long page counts, and —
  when given `itemCount`, `pageSize` and `onPageSizeChange` — the Items select
  and the "1-50 of 1,250" range. `AVTable` passes them through, so a page can
  draw Figma's full version (Manage) or, leaving them out, its Small one.
- **Column widths** are `<col>` percentages, not Figma's grid `fr` tracks —
  `1fr` has no meaning in a table. Task Title takes 40%, matching its 4fr
  against six roughly-1fr columns.
- **The reference and Last Updated** use the repo's `text.tertiary`, which is
  one slate step darker than Figma's — a pre-existing, deliberate contrast fix
  in this repo, not a reading error. See `docs/figma-audit.md`, batch 5.
- **Tags are 12px**, `Tag`'s own small size, matching Figma. Tables use tags, not
  badges (design review, 5 Oct 2026).

Row height, cell padding and avatar size were **measured in the browser against
the canvas**: 81, 16 and 32 respectively, all exact.

## Still open

1. **What "due soon" means** — carried over from `docs/due-date-tag.md`.
2. **`Pagination`'s three missing affordances**, listed above. They belong on
   that component, not here.
3. **The filled Review tag opens the handoff review** (for Ali to confirm, 26 Nov 2026). In the live product, the
   reviewer sees an AV in Review (handed off, AV · 07) as the filled, button-style tag (`StatusTag actionable`, the library's second Review
   tag), and pressing it opens the Accept / Reject dialog (`ReviewAVModal`) over the table. Here it is only a tag:
   pressing it does nothing, and the decision is made on the AV's page or from the bulk bar (Status → Review →
   Accept / Reject). Not built until Ali confirms.
