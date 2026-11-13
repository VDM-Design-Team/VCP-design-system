---
bump: minor
---
### Backlog, handoff and the AV menu follow the 13 November decisions (November 2026)

The live product was tested against the design on 13 Nov 2026 and each difference was decided. Three of those decisions change pieces here.

- **`MoveToBacklogModal`, `BulkActionConfirmModal` (`backlog`): feedback is required.** Parking an Added Value says why, the way rejecting one does. The single dialog marks Feedback as required and
  **Move to Backlog waits until something is typed** (spaces alone do not count), so `onMove` never gets a blank string. The bulk dialog asks on Confirm: every selected Added Value needs feedback, the bulk
  one or its own, and it says "Enter feedback, or some for each Added Value." under the field otherwise. Its placeholder no longer says "(optional)".
- **`HandoffForm`, `HandoffAVModal`, `BulkActionHandoffModal`: a handoff needs something to review**, at least one demo link or one attachment. The live product asks for a link; this accepts a file too,
  so work without a URL can be handed off. The form says so under Demo Links. `HandoffAVModal` refuses a handoff with neither ("Add a demo link or attach a file.", focus in the first link box);
  `BulkActionHandoffModal` keeps Handoff disabled until every Added Value has one. A file already on the Added Value counts until it is removed. New: `handoffHasEvidence(entry, attached)`,
  `HANDOFF_EVIDENCE_ERROR`, `errors.evidence` on the form, and a third argument to `isHandoffComplete(overdue, entry, attached)`.
- **`DetailCardMenu`: an admin gets the moves the live product offers after Pending.** A **Rejected** Added Value can be moved to Backlog, Pending or Draft, so a rejection is no longer final for an admin
  (this replaces the 9 Nov 2026 rule). One that is **accepted or in progress** (Accepted, a domain step, Review) can be moved to Backlog or Draft. Completed keeps Edit and Delete, and a user's menu is
  unchanged.

**What callers change:** nothing has to, but two things behave differently. A page that called `isHandoffComplete(overdue, entry)` for an Added Value that already has files should pass their count as the
third argument, or those files are not seen. And an admin page that showed `DetailCardMenu` on a Rejected or in-progress Added Value now gets the move items, so it needs `onMoveToBacklog`,
`onMoveToDraft` and `onMoveToPending` there (a move with no handler is a menu item that does nothing).
