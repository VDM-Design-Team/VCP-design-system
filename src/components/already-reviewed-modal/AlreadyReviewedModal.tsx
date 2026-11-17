import * as React from 'react';
import { Modal, ModalConfirm } from '../modal';

/**
 * AlreadyReviewedModal — what a reviewer is told when the Added Value they came to review has already been reviewed: **"Already Reviewed"**, "This Value has already
 * been reviewed.", and one **Close**. Built to Figma's `Review_Already_Reviewed_Popup`, which the design draws on the Review modal's page and assembles into no flow.
 * Figma's line says "…by the initiator"; the default drops that so it holds whoever did the reviewing (a second admin, the initiator), and a page that knows can say who
 * through `message`.
 *
 * **It tells and does nothing else.** There is no review to do any more, so the one button closes it, and `onClose` is Close, Escape and a click outside. The page decides when
 * it shows (the AV was reviewed while the reviewer had it open, or they followed an old link to it): this component does not look at the AV. Where the page has the
 * reviewer's name it can say who, through `message`.
 *
 * **Close is the footer's one answer, at the right**, like every dialog's (`ModalConfirm`, as `BulkActionFailedModal`'s "Got it"). Figma draws it the dialog's whole width, from
 * the old design this popup was drawn in; every standard dialog's footer is right-aligned (the Change Log carousel is the one exception), so this one follows them.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface AlreadyReviewedModalProps {
  open: boolean;
  /** Close, Escape or a click outside. Nothing is changed by closing. */
  onClose: () => void;
  /** The heading, and the dialog's name. Default "Already Reviewed". */
  title?: string;
  /** The line under it. Default "This Value has already been reviewed." */
  message?: React.ReactNode;
  /** The button's label. Default "Close". */
  closeLabel?: string;
}

export function AlreadyReviewedModal({
  open,
  onClose,
  title = 'Already Reviewed',
  message = 'This Value has already been reviewed.',
  closeLabel = 'Close',
}: AlreadyReviewedModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      /* Figma hides the popup's ✕ (`Show X Close Button` is off): Close is the one control, and a second "Close" would be heard twice. */
      showClose={false}
      size="md"
      footer={
        <ModalConfirm onClick={onClose}>{closeLabel}</ModalConfirm>
      }
    >
      <p className="font-sans text-body-md-regular text-text-secondary">{message}</p>
    </Modal>
  );
}
AlreadyReviewedModal.displayName = 'AlreadyReviewedModal';
