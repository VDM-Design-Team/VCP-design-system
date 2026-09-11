import * as React from 'react';
import { Modal } from '../../components/modal';
import { Field } from '../../components/field';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';

/**
 * ConfirmDeleteAVModal — the confirmation an Added Value has to pass before it
 * is deleted. Read off the Figma `Confirm_Delete_AV_Popup` (`7829:105404`,
 * audit batch 4, 11 September 2026).
 *
 * It is an **alert layout, not the dialog layout `Modal` draws by default**: a
 * warning glyph, then the question, then the consequence, all centred, and the
 * AV's own title underneath so nobody deletes the wrong one. So `Modal`'s
 * header is left unused (`title` omitted, `showClose={false}`) and the heading
 * lives in the body.
 *
 * Not dismissible by a backdrop click — a stray click must not delete anything —
 * and `role="alertdialog"`, so the consequence is part of the announcement.
 * Escape still closes it, as it does on every dialog.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface ConfirmDeleteAVModalProps {
  open: boolean;
  /** Asked to close: Escape, or Cancel. Never fires from the backdrop. */
  onClose: () => void;
  /** The user answered yes. The dialog does not close itself — you own `open`. */
  onConfirm: () => void;
  /** The Added Value's title, shown so the user can see what they are deleting. */
  avTitle: string;
  /**
   * The question, and the dialog's accessible name — one string, so the
   * announced name and the visible heading cannot drift.
   */
  title?: string;
  /** The consequence, under the question. */
  description?: React.ReactNode;
  /**
   * The destructive button's label. **The design says "Complete"**, which is
   * a copy error on a delete confirmation — see docs/confirm-delete-av-modal.md.
   * The default is the word the action actually performs.
   */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Spins the destructive button while the delete is in flight. */
  loading?: boolean;
}

export function ConfirmDeleteAVModal({
  open,
  onClose,
  onConfirm,
  avTitle,
  title = 'Are you sure you want to delete?',
  description = 'This action cannot be undone. The item will be permanently removed.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading,
}: ConfirmDeleteAVModalProps) {
  const id = React.useId();
  const descriptionId = `${id}-description`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      /* The same string as the visible heading below, from one variable, so
         the two cannot drift. `Modal` cannot take `aria-labelledby` — see the
         doc — which is why the name is passed rather than referenced. */
      aria-label={title}
      aria-describedby={descriptionId}
      role="alertdialog"
      size="md"
      dismissible={false}
      showClose={false}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 text-center">
          <Icon
            name="warning"
            aria-hidden="true"
            className="mx-auto size-12 text-accent-critical-outline-content-default"
          />
          <h2 className="text-heading-md text-text-primary">{title}</h2>
          <p id={descriptionId} className="text-body-sm text-text-tertiary">
            {description}
          </p>
        </div>

        {/* Read-only: this names what is about to go, it does not collect
            anything. It stays a real field so the title can be selected and
            copied out before the AV disappears. */}
        <Field label="Added Value">
          <Input readOnly fullWidth value={avTitle} />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
        <Button variant="neutral" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
ConfirmDeleteAVModal.displayName = 'ConfirmDeleteAVModal';
