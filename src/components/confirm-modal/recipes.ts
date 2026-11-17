/**
 * The questions the Added Value pages ask before something is lost, written once. Each is the copy of a dialog Figma draws
 * (`AV Page: Editing AVs`, `AV Deliverables Card`, `Multipart` in Pages & Flows); spread one into `ConfirmModal`:
 *
 * ```tsx
 * <ConfirmModal open={asking} onClose={stay} onConfirm={discard} {...confirmations.discardAV()} />
 * ```
 *
 * Their answer is "Confirm", in the red, as Figma draws it. A recipe is copy and nothing else: when to ask, and what happens after the answer
 * (a redirect, a toast), is the page's.
 */
export interface ConfirmCopy {
  /** The question, and the dialog's name. */
  title: string;
  /** What it will cost, under the question. */
  description?: string;
}

/** Deleting a problem set that has a multipart child: the child goes with it. */
const deleteProblemSet = (): ConfirmCopy => ({
  title: 'Are you sure you want to delete this Problem Set?',
  description: 'Removing this problem set will also remove the associated multipart child permanently.',
});

/** Discarding an Added Value that is being created or edited. After the answer: back to My Values, and the `discarded()` toast recipe. */
const discardAV = (): ConfirmCopy => ({
  title: 'Are you sure you want to discard this Added Value?',
  description: 'This action cannot be undone. The item will be permanently removed.',
});

/** Removing a link from the Deliverables card. */
const removeLink = (): ConfirmCopy => ({ title: 'Are you sure you want to remove this link?' });

/** Removing an attached file from the Deliverables card (the same step the design draws for a link). */
const removeFile = (): ConfirmCopy => ({ title: 'Are you sure you want to remove this file?' });

/** Leaving a page with edits that were not saved. */
const leavePage = (): ConfirmCopy => ({
  title: 'Are you sure you want to leave?',
  description: 'You have unsaved changes which will be lost if you leave this page.',
});

export const confirmations = { deleteProblemSet, discardAV, removeLink, removeFile, leavePage };
