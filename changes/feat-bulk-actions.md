---
bump: minor
---
### Bulk actions in the AV table: `BulkActionBar`, `BulkActionConfirmModal`, `BulkActionFailedModal` (November 2026)

New **`BulkActionBar`** (Figma's `Bulk_Action_Bar_AV_Table`): "4 Selected ✕", a menu each for Status, Urgency, Type and Cycle that opens upward, and Delete; every choice only asks. New **`BulkActionConfirmModal`**: one component for every bulk action. Pass the `action` (`urgency`, `type`, `cycle`, `status`, `backlog`, `accept-pending`, `accept`, `reject-pending`, `reject`) and the selected Added Values, and it draws the title, the field the action collects (Feedback, Multipart Value, Require Cypress Test Script, Copy to Dev, Rejection Reason) or the value it changes to, a collapsible list with a field per Added Value that can override the bulk one, and Cancel / Confirm (red for Reject). `onConfirm` hands back `{ value, overrides }`. New **`BulkActionFailedModal`**: which Added Values failed and why. The `OnTheTable` story shows select → choose → confirm → toast (or the failure summary) on a real `AVTable`.

`ConfirmDeleteAVModal` takes `avTitles` for deleting several at once (one line each, growing to eight before it scrolls), 

`Menu` gains `heading` (in the library's category style — small bold grey type over a rule, no caret — and it names the menu), `placement` (`top` to prefer opening upward) and **submenus**: an item with `items` shows a right caret and opens its choices beside it (hover, click or ArrowRight; ArrowLeft or Escape closes just the submenu). The bar's actions use the `neutral.textual` palette. The stories fill the Status menu in for development (Figma's list, with submenus on Pending Review and Review) and design (built from the status progression, for design to confirm).

Not built yet: the Status flows (Accept / Reject Pending, Accept / Reject, Handoff with its multi-step popup) and the Cycle menu's search.
