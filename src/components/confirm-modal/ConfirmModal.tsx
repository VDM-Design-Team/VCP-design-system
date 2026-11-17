import * as React from 'react';
import { Modal } from '../modal';

/**
 * ConfirmModal — the question a person answers before something is lost: "Are you sure you want to discard this Added Value?", with what it will cost, then
 * **Cancel** and **Confirm**. It is `Modal` in its `critical` tone and nothing else, so it takes the tone's defaults: an alert dialog (the cost is part of
 * the announcement), no ✕, no click-outside to dismiss (a stray click must not answer it), a grey Cancel beside a red Confirm; Escape still closes it.
 *
 * It asks and reports; it changes nothing. You own `open`: `onConfirm` fires, you do the thing, then you close it. `loading` spins Confirm and holds the dialog
 * open until the work is done.
 *
 * The copy for the dialogs Figma draws is in `confirmations` (`deleteProblemSet`, `discardAV`, `removeLink`, `removeFile`, `leavePage`): spread one in. For a
 * deletion that names the thing being deleted (a user, a contact, an Added Value) use `ConfirmDeleteModal` or `ConfirmDeleteAVModal`, which show its name.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface ConfirmModalProps {
  open: boolean;
  /** Cancel, or Escape. Never from a click outside. */
  onClose: () => void;
  /** Confirm was pressed. The dialog does not close itself. */
  onConfirm: () => void;
  /** The question, and the dialog's name. */
  title: string;
  /** What it will cost, under the question. */
  description?: React.ReactNode;
  /** Confirm's label. Default "Confirm", as Figma draws it. */
  confirmLabel?: string;
  /** Cancel's label. Default "Cancel". */
  cancelLabel?: string;
  /** The work is in flight: Confirm spins and nothing closes the dialog until it is done. */
  loading?: boolean;
}

export function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', cancelLabel, loading }: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      tone="critical"
      size="md"
      title={title}
      description={description}
      busy={loading}
      actions={{ cancelLabel, confirm: { label: confirmLabel, onClick: onConfirm, loading } }}
    />
  );
}
ConfirmModal.displayName = 'ConfirmModal';
