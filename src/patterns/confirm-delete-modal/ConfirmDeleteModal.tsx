import * as React from 'react';
import { Modal } from '../../components/modal';
import { Field } from '../../components/field';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';

/**
 * ConfirmDeleteModal — the confirmation anything has to pass before it is deleted: a user, a contact, a domain. The same alert
 * layout as `ConfirmDeleteAVModal` (Figma's `Confirm_Delete_AV_Popup`), with the word for the thing configurable
 * (`itemLabel`) instead of fixed to "Added Value".
 *
 * It is an **alert layout, not the dialog layout `Modal` draws by default**: a warning glyph, then the question, then the
 * consequence, all centred, and the item's own name underneath so nobody deletes the wrong one. So `Modal`'s header is left
 * unused (`title` omitted, `showClose={false}`) and the heading lives in the body.
 *
 * Not dismissible by a backdrop click — a stray click must not delete anything — and `role="alertdialog"`, so the
 * consequence is part of the announcement. Escape still closes it, as it does on every dialog.
 *
 * It asks and reports; it deletes nothing. You own `open`: `onConfirm` fires, you delete, then you close it — and say so
 * with a toast.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface ConfirmDeleteModalProps {
  open: boolean;
  /** Asked to close: Escape, or Cancel. Never fires from the backdrop. */
  onClose: () => void;
  /** The user answered yes. The dialog does not close itself — you own `open`. */
  onConfirm: () => void;
  /** What kind of thing it is, as the field's label reads: "User", "Contact". */
  itemLabel: string;
  /** Its name, shown so the user can see what they are deleting. */
  itemName: string;
  /** The question, and the dialog's accessible name — one string, so the announced name and the visible heading cannot drift. */
  title?: string;
  /** The consequence, under the question. */
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Spins the destructive button while the delete is in flight. */
  loading?: boolean;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  itemLabel,
  itemName,
  title = 'Are you sure you want to delete?',
  description = 'This action cannot be undone. The item will be permanently removed.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading,
}: ConfirmDeleteModalProps) {
  const id = React.useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={loading}
      /* Named by the heading it renders in its own body, so the announced name *is* the visible question. */
      aria-labelledby={titleId}
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
          <h2 id={titleId} className="text-title-md-semibold text-text-primary">
            {title}
          </h2>
          <p id={descriptionId} className="text-caption-md-regular text-text-tertiary">
            {description}
          </p>
        </div>

        {/* Read-only: this names what is about to go, it does not collect anything. It stays a real field so the name can be
            selected and copied out before it disappears. */}
        <Field label={itemLabel}>
          <Input readOnly fullWidth value={itemName} />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
        <Button variant="neutral" disabled={loading} onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
ConfirmDeleteModal.displayName = 'ConfirmDeleteModal';
