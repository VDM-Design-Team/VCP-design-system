# BulkActionHandoffModal *(pattern)*

Handing several Added Values on at once: **"Handoff 4 Added Values"**, one page per Added Value with a **Handoff Date**, **Demo Links** and **Attachments** (a late one also has the Overdue banner, **Overdue Reason** and **Additional Notes**), **Publish** for Development, and `PaginationDots` between two arrows to step between them. Built to Figma's `Bulk_Action_Handoff_Popup` (both `Overdue` variants) and `_Bulk_Action_Handoff_Popup_Footer`.

## Composed of

| Piece | Tier |
|---|---|
| `Checkbox` | atom |
| `IconButton` | atom |
| `PaginationDots` | atom |
| `Modal` | component |
| `HandoffForm` | pattern |
| `HandoffAvModal` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `BulkActionHandoffModal` | Handing off two or more selected Added Values, each with its own details |
| `HandoffAVModal` | Handing off one |
| `BulkActionConfirmModal` | The other bulk actions, which collect one field |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | |
| `items` | `BulkHandoffAV[]` | required | `{ ref, title, href?, overdueDays?, attachments?, defaultDate? }`; `overdueDays` gives that Added Value the banner, reason and notes |
| `domain` | `'design-governance' \| 'development'` | `design-governance` | `development` also draws **Publish** |
| `onHandoff` | `(drafts: Record<ref, BulkHandoffDraft>) => void` | required | One draft per Added Value, once |
| `loading` | `boolean` | `false` | Handoff spins, Cancel locks, and nothing closes the dialog until it is done |

## Behaviour

- **Each page is `HandoffForm`**, the form `HandoffAVModal` draws, so a single handoff and a bulk one ask for the same things: a **Handoff Date**, chosen from the calendar, is required; a late one must say why (**Overdue Reason**); **links, files and notes are optional**; a link that is typed must be a valid `https://` address. See `docs/handoff-form.md` for the form's own behaviour (links, attachments, focus).
- **Handoff is disabled until every Added Value is complete** (Figma's "All Handoff Details Filled = No"), by `isHandoffComplete`. Its description says how many are missing. (The single dialog asks on submit instead.)
- **Attachments are `Attachments`**: the files already on the Added Value and the ones just picked, each previewable on click (the viewer opens over the popup: a modal over a modal is fine, Escape closes only the preview and focus returns to the card) and removable (staged: the ids come back in `removedAttachments`).
- **The pager is pinned beside the buttons**, so it does not scroll with the form. **At the first or last Added Value the arrow you pressed is `aria-disabled`, not `disabled`**, so it keeps focus instead of dropping it to the page.
- **Stepping loses nothing**: every page stays mounted (the others are hidden), so each keeps what was typed. It resets when the popup opens.
- **The reference is a blue link that opens the Added Value in a new tab** when it has an `href`; otherwise plain grey text.

## Tokens

`Modal` at the system's **`lg` (640)**, not Figma's 592; the footer is `ModalCancel` and `ModalConfirm` (40 high), the arrows are `IconButton`'s `neutral-text`. The line under the title is the reference in `text.link` or `text.tertiary` and the title in `text.primary`.

## Accessibility

- A `dialog` named by its title. The pager is a named group (`PaginationDots`) between two named arrow buttons, `aria-disabled` at the ends (so they keep focus).
- The disabled Handoff carries a description of what is missing; the Overdue banner is not announced on open.

## Don't

- **Don't enable Handoff with an Added Value still incomplete.** The one you are not looking at is the one that was missed.
- **Don't use it for one Added Value.** Use `HandoffAVModal`.
