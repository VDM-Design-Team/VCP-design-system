import * as React from 'react';
import { Attachments, type AttachmentsProps } from '../../components/attachments';
import { Modal, ModalCancel, ModalConfirm } from '../../components/modal';
import { useAttachmentFiles, type AttachmentItem } from '../../lib/attachment-files';

/**
 * AttachmentsModal — adding files to an Added Value: the files already attached as cards, the drop area, and **Upload**. Built to Figma's `Attachment_Modal` (`3970:23235`, AV Page Attachment Elements)
 * and its Example, and the file card's flows (hover shows the ✕, pressing the ✕ removes the file, clicking the card — not its ✕ — opens the preview).
 *
 * The cards, the drop area and the preview are `Attachments` (so what it accepts, how it refuses a file, where focus goes after a ✕ and the preview over this dialog are all its own):
 *
 * - **Removing a file already attached is staged.** The ✕ takes the card out of the dialog, and nothing is removed from the Added Value until **Upload** (or **Save**): **Cancel**, Escape and the backdrop undo it. There is no confirm step.
 * - **Upload sends the change** (`onUpload({ files, removed })`): the files just picked and the files already attached that were removed here. It is enabled once either exists, and reads **Save** when the only change is a removal.
 * - **Upload is not pressed twice.** While `loading` it spins and the drop area locks; when it settles without an `error` the picked files and the removals are cleared, so a dialog left open cannot send them again.
 *   With an `error` they stay, under the drop area, so the person can try again.
 * - It resets each time it opens, and does nothing itself: uploading, then closing, is the page's.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type AttachmentsModalFile = AttachmentItem;

/** What Upload hands over. */
export interface AttachmentsChange {
  /** The files just picked. */
  files: File[];
  /** The files already attached that were removed here. */
  removed: AttachmentsModalFile[];
}

export interface AttachmentsModalProps {
  open: boolean;
  onClose: () => void;
  /** Files already on the Added Value. */
  attachments?: readonly AttachmentsModalFile[];
  /** Upload (or Save) was pressed: what was picked and what was removed. */
  onUpload: (change: AttachmentsChange) => void;
  /** Uploading is in flight: Upload spins and the drop area locks. */
  loading?: boolean;
  /** Said under the drop area: an upload that failed. The picked files stay so it can be tried again. */
  error?: AttachmentsProps['error'];
}

export function AttachmentsModal({ open, onClose, attachments = [], onUpload, loading, error }: AttachmentsModalProps) {
  const picked = useAttachmentFiles();
  const [removed, setRemoved] = React.useState<string[]>([]);

  /* Each time it opens, start again. */
  React.useEffect(() => {
    if (!open) return;
    picked.clear();
    setRemoved([]);
    /* On open only: `picked.clear` is stable, and `picked` itself changes with every pick. */
  }, [open]); // eslint-disable-line

  /* An upload that has settled without an error is done: what it sent must not be sent again. */
  const wasLoading = React.useRef(false);
  React.useEffect(() => {
    if (wasLoading.current && !loading && !error) {
      picked.clear();
      setRemoved([]);
    }
    wasLoading.current = Boolean(loading);
  }, [loading, error]); // eslint-disable-line

  const kept = attachments.filter((file) => !removed.includes(file.id));
  const items = [...kept, ...picked.items];
  const dropped = attachments.filter((file) => removed.includes(file.id));
  const changed = picked.files.length > 0 || dropped.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Attachments"
      size="md"
      showClose={false}
      footer={
        <>
          <ModalCancel disabled={loading} />
          <ModalConfirm disabled={!changed} loading={loading} onClick={() => onUpload({ files: picked.files, removed: dropped })}>
            {picked.files.length === 0 && dropped.length > 0 ? 'Save' : 'Upload'}
          </ModalConfirm>
        </>
      }
    >
      <Attachments
        items={items}
        onFiles={picked.add}
        onRemove={(item) => (attachments.some((file) => file.id === item.id) ? setRemoved((now) => [...now, item.id]) : picked.remove(item.id))}
        error={error}
        disabled={loading}
      />
    </Modal>
  );
}
