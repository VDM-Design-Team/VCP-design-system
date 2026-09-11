import * as React from 'react';
import { cn } from '../../lib/cn';
import { Modal } from '../../components/modal';
import { Button } from '../../atoms/button';
import { Checkbox } from '../../atoms/checkbox';

/**
 * AcceptPendingAVModal — the confirmation an admin answers to accept a pending
 * Added Value, and the one decision that comes with it: whether the value is
 * **multipart**.
 *
 * Read off the Figma `Accept_Added_Value_Modal` (`5939:149041`, audit batch 4,
 * 11 September 2026). The node carries a designer's note — "Used by Admins to
 * accept a pending AV" — which is why the doc says admin and this does not
 * pretend to be a general accept dialog.
 *
 * **It is a benign confirmation, unlike the delete one**, and the design draws
 * that difference: Cancel here is the brand-outlined `secondary`, not the grey
 * `neutral` that sits beside a destructive answer. Nothing is lost by closing
 * it, so a backdrop click closes it too.
 *
 * **Multipart is the whole point of the dialog.** Accepting is otherwise a
 * yes/no, and the checkbox is the only thing the admin actually decides, so it
 * is a card rather than a line: the title, what it does, and a target big
 * enough to hit.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface AcceptPendingAVModalProps {
  open: boolean;
  /** Escape, Cancel, or a backdrop click. Nothing is destroyed by closing. */
  onClose: () => void;
  /** Accepted, carrying the one decision. The dialog does not close itself. */
  onConfirm: (options: { multipart: boolean }) => void;
  /** Whether the value is split into parts. Controlled. */
  multipart?: boolean;
  onMultipartChange?: (multipart: boolean) => void;
  /**
   * Hides the multipart card, for a domain where splitting makes no sense.
   * The design's own boolean — it draws the dialog both ways.
   */
  showMultipart?: boolean;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Spins the confirm button while the accept is in flight. */
  loading?: boolean;
}

export function AcceptPendingAVModal({
  open,
  onClose,
  onConfirm,
  multipart = false,
  onMultipartChange,
  showMultipart = true,
  title = 'Are you sure you want to accept this task?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading,
}: AcceptPendingAVModalProps) {
  const id = React.useId();
  const descriptionId = `${id}-multipart-description`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      /* No close button in the design: the two answers are the way out, and
         Escape as always. It stays dismissible because nothing is lost. */
      showClose={false}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button size="sm" loading={loading} onClick={() => onConfirm({ multipart })}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {showMultipart && (
        <Checkbox
          checked={multipart}
          onChange={onMultipartChange}
          /* The card is the label, so the whole thing is a target. The
             announced name is the title alone — reading the explanation as
             part of the name would bury it. */
          aria-label="Multipart Value"
          aria-describedby={descriptionId}
          className={cn(
            'w-full items-start gap-3 rounded-md border p-4',
            multipart
              ? 'border-stroke-focused bg-surface-brand-faint'
              : 'border-stroke-default bg-surface-elevated',
          )}
          label={
            <span className="flex flex-col gap-1">
              <span className="text-label-sm text-text-primary">Multipart Value</span>
              <span id={descriptionId} className="text-label-sm text-text-tertiary">
                Split this value into parts based on its sets, while keeping the original as the
                parent for overall progress tracking.
              </span>
            </span>
          }
        />
      )}
    </Modal>
  );
}
AcceptPendingAVModal.displayName = 'AcceptPendingAVModal';
