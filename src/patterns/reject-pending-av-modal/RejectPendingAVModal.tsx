import * as React from 'react';
import { Modal } from '../../components/modal';
import { RejectionReason, PENDING_REJECTION_REASONS } from '../../components/rejection-reason';
import { Button } from '../../atoms/button';

/**
 * RejectPendingAVModal — rejecting an Added Value that is still `Pending`,
 * before anyone has worked on it. One question: why.
 *
 * Read off the Figma `Reject_Pending_AV_Modal` (`7847:106048`, audit batch 4,
 * 11 September 2026), all three of its states.
 *
 * **The design draws its validation rather than stating it.** In the first
 * state, with no reason chosen, the Reject button is faded — disabled. In the
 * second it is solid. So a rejection cannot be sent without a reason, and the
 * dialog says so by what it lets you press rather than by an error after the
 * fact, which is the better half of the two.
 *
 * **Reject is the `primary` button, not `danger`.** Rejecting a pending value
 * is a decision, not a destruction — nothing is lost, and the submitter is
 * told why. `ConfirmDeleteAVModal` is where the red button lives.
 *
 * The reason list and the "Other" free-text behaviour are `RejectionReason`'s,
 * built once for this dialog and for `Review`'s handoff rejection.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
const REASON_LABEL = 'Rejection Reason';

export interface RejectPendingAVModalProps {
  open: boolean;
  onClose: () => void;
  /** The rejection, once. `detail` is only set when the reason asks for it. */
  onReject: (rejection: { reason: string; detail?: string }) => void;
  /** Spins the Reject button while it is in flight. */
  loading?: boolean;
}

export function RejectPendingAVModal({
  open,
  onClose,
  onReject,
  loading,
}: RejectPendingAVModalProps) {
  const [reason, setReason] = React.useState('');
  const [detail, setDetail] = React.useState('');

  /* A fresh dialog every time it opens: a reason picked and abandoned should
     not be sitting there on the next rejection. */
  React.useEffect(() => {
    if (open) return;
    setReason('');
    setDetail('');
  }, [open]);

  const chosen = PENDING_REJECTION_REASONS.find((option) => option.value === reason);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reject Added Value"
      size="md"
      showClose={false}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            /* The design's own validation: faded until a reason is chosen. */
            disabled={!reason}
            loading={loading}
            onClick={() =>
              onReject({ reason, ...(chosen?.freeText && detail ? { detail } : {}) })
            }
          >
            Reject
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        {/* The design shows a visible label above the select. `RejectionReason`
            names its own select through `label`, so both come from one
            constant and cannot drift — see the doc. */}
        <span className="text-label-md text-text-primary">{REASON_LABEL}</span>
        <RejectionReason
          reasons={PENDING_REJECTION_REASONS}
          label={REASON_LABEL}
          value={reason}
          onChange={setReason}
          detail={detail}
          onDetailChange={setDetail}
        />
      </div>
    </Modal>
  );
}
RejectPendingAVModal.displayName = 'RejectPendingAVModal';
