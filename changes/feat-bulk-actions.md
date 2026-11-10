---
bump: minor
---
### Bulk actions in the AV table: `BulkActionBar`, `BulkActionConfirmModal`, `BulkActionFailedModal` (November 2026)

New **`BulkActionBar`** (Figma's `Bulk_Action_Bar_AV_Table`): "4 Selected ✕", a menu each for Status, Urgency, Type and Cycle that opens upward, and Delete; every choice only asks. New **`BulkActionConfirmModal`**: one component for every bulk action. Pass the `action` (`urgency`, `type`, `cycle`, `status`, `backlog`, `accept-pending`, `accept`, `reject-pending`, `reject`) and the selected Added Values, and it draws the title, the field the action collects (Feedback, Multipart Value, Require Cypress Test Script, Copy to Dev, Rejection Reason) or the value it changes to, a collapsible list with a field per Added Value that can override the bulk one, and Cancel / Confirm (both rejects are red: a grey Cancel and a red Confirm). `onConfirm` hands back `{ value, overrides }`. New **`BulkActionFailedModal`**: which Added Values failed and why. The `OnTheTable` story shows select → choose → confirm → toast (or the failure summary) on a real `AVTable`.

`ConfirmDeleteAVModal` takes `avTitles` for deleting several at once (one line each, growing to eight before it scrolls), 

`Menu` gains `heading` (in the library's category style — small bold grey type over a rule, no caret — and it names the menu), `placement` (`top` to prefer opening upward) and **submenus**: an item with `items` shows a right caret and opens its choices beside it (hover, click or ArrowRight; ArrowLeft or Escape closes just the submenu). A submenu follows its parent item when something scrolls or the window resizes, flips left when there is no room on the right and stays on screen; how far above the item it starts is measured, not a constant. The stories fill the Status menu in for development (Figma's list, with submenus on Pending Review and Review) and design (built from the status progression, for design to confirm).

Rejecting takes `reasons: { value, label, explanation?, other? }[]`: the chosen reason's explanation shows under the select, and the reason marked `other` shows an optional note instead (`onConfirm` adds `detail` / `overrideDetails`). A select-all checkbox (Multipart Value, Cypress, Copy to Dev) now reads the Added Values' own: all, none, or **indeterminate**. An Added Value's `href` makes its reference a blue link that opens in a new tab (no `href`, no blue); the lists have more space between items; the menus sit above tooltips; the bar clips its scrollbar.

New **`BulkActionHandoffModal`** (Figma's `Bulk_Action_Handoff_Popup`): one page per Added Value, overdue variant, Publish for Development, Handoff disabled until every Added Value has a date (blank to start, picked from a calendar) and any link typed is a valid `https://` URL, links can be removed, and the pager is pinned beside the buttons; attachments are `FileAttachment` cards that can be removed and, on click, previewed (`AttachmentViewer` over the popup), and it steps with `PaginationDots` between two `IconButton` arrows.

`Menu` also gains `searchable` (Figma's `_Menu_Item_Search`): a search box over the items, which the bar's Cycle menu uses.

Not built yet: the Status flows beyond those above (design to confirm).

**Review fixes (6 Nov).** `Button` gains two text variants, **`neutral-text`** (`neutral.textual`, for a toolbar's actions) and **`critical-text`** (red text, for a toolbar's Delete), so the bar sets no colours itself. `BulkActionBar` takes **`returnFocusRef`** (the table's select-all checkbox): when the selection empties and the bar goes with it, after a confirmed Delete or the chip, focus goes there instead of falling to the page. `BulkActionConfirmModal`: the footer is `ModalCancel` and `ModalConfirm`, `confirming` is now `loading` (and nothing closes the dialog mid-save), a status is a `StatusTag`, and a checkbox's name is no longer an `aria-label` on a plain span.
