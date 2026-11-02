# DeliverablesCard *(pattern)*

What an Added Value delivers: the links to it and the files attached.

Read off Figma's `Deliverables_Card` (`3234:10776`): View and Edit, for the Design and Development domains.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `IconButton` | atom |
| `DeliverableLink` | component |
| `DeliverableLinkForm` | component |
| `DomainLabel` | component |
| `Dropzone` | component |
| `FileAttachment` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DeliverablesCard` | The deliverables of an AV, on its page |
| `DetailCard` | The facts about the AV (its sibling in the right column) |
| `DescriptionSection` | The problem, solution and outcome text |

## The sections

**`domain` picks the sections; `mode` is `view` or `edit`.**

| | Sections |
|---|---|
| `design` | Links, Attachments |
| `development` | Video Links, Links, Attachments |

- **Viewing:** the lists and the files. A section with nothing in it is left out. The links open in a new tab; a file
  card opens its preview (`onOpenFile`).
- **Editing:** a blue + beside each links title opens the add form under it (`DeliverableLinkForm`: a URL and a title,
  "+ Add another link", Cancel and Add), and is dimmed while it is open. Each added link has a pencil and a bin
  (`DeliverableLink`), each file a ✕, and a drop area (`Dropzone`) sits under Attachments.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `domain` | `'design' \| 'development'` | required | Picks the sections |
| `mode` | `'view' \| 'edit'` | required | |
| `links`, `videoLinks` | `{ id, title, url, domain }[]` | `[]` | `videoLinks` is Development only |
| `files` | `{ id, name, kind?, thumb?, domain? }[]` | `[]` | An image shows its own thumbnail |
| `onAddLinks` | `(section, links) => void` | — | `section` is `links` or `video`; `links` is every pair the form handed over |
| `onEditLink` | `(section, id, link) => void` | — | |
| `onRemoveLink` | `(section, id) => void` | — | |
| `onFiles`, `onRemoveFile`, `onOpenFile` | | — | Files chosen or dropped, a ✕, a card pressed. The page uploads and opens |
| `fileError`, `fileHint`, `fileAccept` | | — | The drop area's rejection message, types line and filter |
| `headingLevel` | `'h2' \| 'h3' \| 'h4'` | `h2` | The title's level |
| `className`, `ref`, rest | | | On the `<section>` |

## Tokens

`surface.elevated`, `radius.md`, 24 padding and 24 between sections; the title `title-sm-bold`, a section's title
`body-sm-medium`, 8 under it; a divider between links `stroke.subtle`. No new tokens.

## Accessibility

- A `<section>` named by its heading; each links section and Attachments has its own heading.
- The + is named "Add link" or "Add video link", 24 to look at and 40 to press.
- Everything else is the composed pieces': real inputs with messages, real links, real buttons.

## Don't

- **Don't upload from the card.** It reports the files; the page uploads them.
- **Don't offer the add forms in a view.** Pass `mode="view"`.
