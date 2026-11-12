# AVPage *(pattern)*

The main content of an Added Value's page, to read or to edit: the header, then two columns. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer.

Built to Figma's `AV Page: Viewing AVs` (`AV in Draft Status`, `AV in Accepted`…) and `AV Page: Editing AVs` (`Editing Existing AV`) in Pages & Flows.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Input` | atom |
| `DescriptionSection` | component |
| `DuplicateToOtherDomain` | component |
| `Field` | component |
| `StatusHistory` | component |
| `StatusProgression` | component |
| `AvHeader` (exported as `AVHeader`) | pattern |
| `CommentSection` | pattern |
| `DeliverablesCard` | pattern |
| `DetailCard` | pattern |
| `MultipartSection` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AVPage` | An Added Value's page: to read it, or to write or edit one |
| `AVListPage` | A page that lists Added Values |
| The pieces on their own | One card of an AV somewhere else |

## The layout

| | Reading | Editing |
|---|---|---|
| **Header** | `AVHeader`: the back arrow and the reference, and the status buttons on the right | `AVHeader` `type="new"`: the back arrow and "Added Value Creation", no status buttons |
| **Left column** | Title (the reference over the title) · Problems · Solutions · Acceptance Criteria / Deliverables · Desired outcome · Multipart · Status History · **Comments** | A **Title** field · the four blocks · Multipart · Status History · **Duplicate to other Domains** |
| **Right column** | The **Detail card**, then the **Deliverables card** | The **Detail card** |
| **Bottom** | — | **Discard** (red text), then the status buttons (**Save as Draft**, **Submit**), at the right |

The columns are 2 : 1 on a wide page and stack on a narrow one (it responds to its own width, not the screen's). 16 between them and between the cards, 32 in from the sides.
**Multipart** sits after the four blocks in both modes: Figma's frames do not show a Multipart card, so that place is a reading of the pieces' docs, not a drawing.

## Typed sections: the page passes each piece's own props

```tsx
<AVPage
  header={{ title: 'VCP-123', backHref: '/assigned', backLabel: 'Back to Assigned', role: 'assignee', status: 'Accepted', onTransition }}
  title={{ reference: 'VCP-1234', value: 'Some Title Here' }}
  description={{ problem: { children: <DescriptionCard … /> }, solution: { … }, deliverable: { … }, 'desired-outcome': { … } }}
  history={{ count: 3, entries }}
  comments={{ currentUser, members, comments, onAddComment }}
  details={{ type: 'viewing', domain: 'development', value }}
  deliverables={{ domain: 'design', mode: 'view', links, files }}
/>
```

`details` is `DetailCard`'s props, `comments` is `CommentSection`'s, and so on. **A section shows only when the page gives it**, so what differs by status, role or domain is what the page passes: the pieces already
carry their own variants (the detail card's `type`, the header's `role` and `status`). Leave out the right column's pieces and the column goes.

**`mode`** (`view` by default, or `edit`) decides three things and nothing else: the title (text, or a **Title** field), whether Comments or Duplicate shows, and where the status buttons are.
Everything inside the cards follows what it is passed (`DescriptionSection` is read-only without `onAdd`, `DetailCard` edits with its `type`).

## It is controlled and holds no data

It owns no state. The title, the cards, the comments and the status are the page's; this puts them in order.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `mode` | `'view' \| 'edit'` | `view` | Reading or editing |
| `header` | `AVHeaderProps` | required | `showStatusActions` is on when reading, off when editing |
| `title` | `{ reference?, value, onChange?, label?, placeholder?, error? }` | — | Editing with no `onChange` is read-only |
| `description` | `{ problem?, solution?, deliverable?, 'desired-outcome'? }` | — | Each is `DescriptionSection`'s props without `type` |
| `multipart` / `history` | `MultipartSectionProps` / `StatusHistoryProps` | — | |
| `comments` | `CommentSectionProps` | — | Reading only |
| `duplicate` | `DuplicateToOtherDomainProps` | — | Editing only |
| `details` | `DetailCardProps` | — | The right column |
| `deliverables` | `DeliverablesCardProps` | — | Reading only, under the detail card |
| `actions` | `{ onDiscard?, discardLabel?, progression? }` | — | Editing: Discard and `StatusProgression`'s props, at the bottom right |

## Not here, on purpose

- **Undo / Redo**, the **more-options menu's** contents, and the **missing-information error flow**: not drawn into this pattern yet.
- State-specific content (rejected or backlogged notices, the initiated-to-other-domain view): whatever the page passes, since the pieces carry their own variants.

## Accessibility

- One `h1`, from `AVHeader`. The reading title is an `h2`; every block and card keeps its own heading.
- The status buttons have one home at a time: the header when reading, the bottom bar when editing, so a screen reader never meets them twice.
- Each piece keeps its own keyboard behaviour. Discard is a real button, in the tab order after the cards and before the status buttons.

## Don't

- Don't put role or status logic in the page: pass what applies, leave out what does not.
- Don't draw the status buttons in both places.
- Don't fetch inside the sections' props: pass data in, handle changes out.
