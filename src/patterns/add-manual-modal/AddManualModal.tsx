import * as React from 'react';
import { Modal, ModalCancel, ModalConfirm } from '../../components/modal';
import { Field } from '../../components/field';
import { Attachments } from '../../components/attachments';
import { Input } from '../../atoms/input';
import { useAttachmentFiles } from '../../lib/attachment-files';

/**
 * AddManualModal — the dialog behind the Settings Manuals tab's **Add Manual** (Figma draws the button in the top bar,
 * `1046:242262`, and not the dialog; decided 10 Nov 2026: a name and one or more files, with the shared `Attachments`).
 *
 * It holds the draft: the name, and the files picked (`useAttachmentFiles`). **Submit** checks both and hands over
 * `{ name, files }`; it uploads nothing itself. While `submitting`, the dialog can't be closed and Submit spins.
 * Who can read the manual is the product's rule (every user in the domain), not the dialog's.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface AddManualDraft {
  /** Trimmed. */
  name: string;
  files: File[];
}

export interface AddManualModalProps {
  open: boolean;
  onClose: () => void;
  /** Valid: a name and at least one file. The dialog stays open; the page closes it once the upload is through. */
  onSubmit: (draft: AddManualDraft) => void;
  /** The upload is in flight: Submit spins, the fields lock, nothing closes the dialog. */
  submitting?: boolean;
  /** What only the server knows, under the field. */
  errors?: { name?: React.ReactNode; files?: React.ReactNode };
  /** What the picker takes, and the limit in bytes (`Dropzone`'s). */
  accept?: string;
  maxSize?: number;
  /** The accepted-types line under the drop area. */
  hint?: string;
  title?: string;
}

export function AddManualModal({
  open,
  onClose,
  onSubmit,
  submitting,
  errors,
  accept,
  maxSize,
  hint,
  title = 'Add Manual',
}: AddManualModalProps) {
  const formId = React.useId();
  const nameId = React.useId();
  const [name, setName] = React.useState('');
  /* Errors show from the first Submit on, and each clears as it's fixed. */
  const [tried, setTried] = React.useState(false);
  const picked = useAttachmentFiles();
  const { clear } = picked;

  /* Each opening starts empty: the last draft doesn't come back. */
  React.useEffect(() => {
    if (open) return;
    setName('');
    setTried(false);
    clear();
  }, [open, clear]);

  const trimmed = name.trim();
  const nameError = errors?.name ?? (tried && !trimmed ? 'Give the manual a name.' : undefined);
  const filesError = errors?.files ?? (tried && picked.files.length === 0 ? 'Add at least one file.' : undefined);

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      title={title}
      size="md"
      footer={
        <>
          <ModalCancel />
          <ModalConfirm type="submit" form={formId} loading={submitting}>
            Submit
          </ModalConfirm>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          setTried(true);
          if (!trimmed || picked.files.length === 0) return;
          onSubmit({ name: trimmed, files: picked.files });
        }}
      >
        <Field label="Manual Name" htmlFor={nameId} required error={nameError}>
          <Input id={nameId} fullWidth value={name} onChange={(event) => setName(event.target.value)} invalid={!!nameError} disabled={submitting} />
        </Field>
        <Field label="Files" required error={filesError}>
          <Attachments
            items={picked.items}
            onFiles={picked.add}
            onRemove={(item) => picked.remove(item.id)}
            accept={accept}
            maxSize={maxSize}
            hint={hint}
            disabled={submitting}
            label="Files"
          />
        </Field>
      </form>
    </Modal>
  );
}
AddManualModal.displayName = 'AddManualModal';
