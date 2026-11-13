# HandoffForm *(pattern)*

**The one handoff form**, for one Added Value: the **Handoff Date**, the **Demo Links**, the **Attachments** and, when the value is late, the Overdue banner,
the **Overdue Reason** and **Additional Notes**. `HandoffAVModal` (one Added Value) and `BulkActionHandoffModal` (several, a page each) both draw it, so what a
handoff asks for is decided in one place. Built to Figma's `Handoff_AV_Modal` (`5342:78539`) and `Bulk_Action_Handoff_Popup`.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `IconButton` | atom |
| `Input` | atom |
| `Select` | atom |
| `Attachments` | component |
| `Banner` | component |
| `DateField` | component |
| `DeliverableLinkForm` | component |
| `Field` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `HandoffForm` | The body of any dialog or page that hands an Added Value on |
| `HandoffAVModal` | Handing off one: the dialog around the form, asking on submit |
| `BulkActionHandoffModal` | Handing off several: a form per Added Value, Handoff waiting until every one is complete |

## What it asks for

| Field | Rule |
|---|---|
| **Handoff Date** | **Required.** Chosen from the calendar (`DateField`); it starts blank (`defaultDate`, ISO, is there for a caller that has one) |
| **Overdue Reason** | **Required when the value is late** (`overdueDays` given). The six reasons are `OVERDUE_REASONS`, drawn in the design file, not configured per domain |
| **Additional Notes** | Optional; late values only |
| **Demo Links** and **Attachments** | **At least one of the two: a demo link or an attachment.** A handoff needs something to review (decided 13 Nov 2026). The rule is said under Demo Links all the time ("A handoff needs at least one demo link or one attachment."), so a dialog that waits has told the person why |
| **Demo Links** | A link that is typed must be a valid `https://` address, said under the box once it is left; an empty one is dropped |
| **Attachments** | `Attachments`: the files already on the value and the ones just picked, each previewable on click and removable. A file already on the value counts as something to review until it is removed here |

`isHandoffComplete(overdue, entry, attached)` is the one rule for "can this be handed off"; `attached` is how many files are already on the Added Value (the form's `attachments`), `0` when left out. `handoffHasEvidence(entry, attached)` is the link-or-file half on its own. Whether to **wait** (a disabled Handoff) or to **ask on submit** is the dialog's: pass `errors` to show a message under a field.

**Why a link or a file, when the live product asks for a link:** the reviewer needs something to look at, and not all work has a URL (a document, a recording). Requiring a link would make people paste a placeholder.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `overdueDays` | `number` | — | Switches the overdue variant: the banner, the required reason, the notes |
| `attachments` | `{ id?, name, kind?, thumb?, src? }[]` | `[]` | Files already on the Added Value. `id` defaults to the name. A PDF is `kind: 'pdf'` (the glyph is the caller's to know) |
| `defaultDate` | `string` | `''` | ISO |
| `onChange` | `(entry: HandoffEntry) => void` | — | Whenever the form changes: `{ date, links, files, removed, overdueReason, notes }` |
| `errors` | `{ date?, overdueReason?, links?, evidence? }` | — | A message under the field (for a dialog that asks on submit); focus goes to the first. `links: true` shows every link that is not an address. `evidence` (use `HANDOFF_EVIDENCE_ERROR`, "Add a demo link or attach a file.") replaces the hint under Demo Links and focuses the first link box |

## It keeps its own entry

The form holds what was typed and reports it (`onChange`), so a page that steps between several keeps every one it has mounted: `BulkActionHandoffModal` mounts a form per Added Value and hides the ones you are not looking at, so stepping loses nothing. It starts again when it is unmounted (a dialog closing).

**Removing a file already on the value is staged**: it comes back in `removed` (the ids), and the page applies it with the handoff.

## Accessibility

- **Focus never drops.** Removing a link moves focus to the next box (else the previous one); adding one focuses it; a file's ✕ is `Attachments`' (the next card's ✕, else the previous one's, else the drop area); an error moves focus to the first field that has one.
- **Each link is named by its position**, "Demo link 2", because a row of identical boxes is unusable by ear otherwise. The `Field` label names the group.
- A required field has the required marker and "(required)" for screen readers (`Field`'s); an error is an alert wired to its field.
- **The banner does not announce itself**: it is there when the form opens rather than arriving.
- The attached files are a list named "Attached files" (so the field's own label "Attachments" is not said twice).

## Don't

- **Don't make a second copy of this form.** A dialog that needs it composes `HandoffForm`.
- **Don't make the date optional, or the reason optional for a late value, or let a handoff through with nothing to review.** That is the rule `isHandoffComplete` states.
- **Don't require a link when there is a file**, or a file when there is a link. One of the two is the rule.
- **Don't forget `attached`** when the Added Value already has files: without it `isHandoffComplete` cannot see them.
- **Don't validate links yourself.** The form does, with `DeliverableLinkForm`'s rule.
