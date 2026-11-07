import * as React from 'react';
import { Button } from '../../atoms/button';
import { Dropzone } from '../../atoms/dropzone';
import { AttachmentViewer } from '../../components/attachment-viewer';
import { FileAttachment, type FileAttachmentKind } from '../../components/file-attachment';
import { Modal } from '../../components/modal';

/**
 * AttachmentsModal — adding files to an Added Value: the files already attached as cards, the drop area, and **Upload**. Built to Figma's `Attachment_Modal` (`3970:23235`, AV Page Attachment Elements)
 * and its Example, and the file card's flows (hover shows the ✕, pressing the ✕ removes the file, clicking the card — not its ✕ — opens the preview).
 *
 * - **The cards are `FileAttachment`**: the files already on the Added Value (`attachments`) and the ones just picked, each removable; a picked image shows a small crop of itself. Clicking a card opens its
 *   preview (`AttachmentViewer`) over the dialog.
 * - **The drop area is `Dropzone`**, so what it accepts and how it refuses a file (type, size) is its own: a refused file never reaches the cards.
 * - **Upload sends only what was just picked** (`onUpload(files)`), and is disabled until something is. Files already on the Added Value that were removed here are reported (`onRemoveAttachment`) as they go.
 * - It resets each time it opens, and does nothing itself: uploading, then closing, is the page's.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface AttachmentsModalFile {
  /** Names it, and tells it apart. */
  id: string;
  name: string;
  kind?: FileAttachmentKind;
  /** A small picture, for an image. */
  thumb?: string;
  /** The whole file, for the preview. */
  src?: string;
}

export interface AttachmentsModalProps {
  open: boolean;
  onClose: () => void;
  /** Files already on the Added Value. */
  attachments?: readonly AttachmentsModalFile[];
  /** A file already on the Added Value was removed here. */
  onRemoveAttachment?: (file: AttachmentsModalFile) => void;
  /** Upload was pressed: the files just picked. */
  onUpload: (files: File[]) => void;
  /** Uploading is in flight: Upload spins. */
  loading?: boolean;
}

/** The card's glyph for a file the person picked. */
const kindOf = (file: File): FileAttachmentKind =>
  file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type === 'application/pdf' ? 'pdf' : file.type === 'text/csv' ? 'csv' : 'doc';

/** An address for each picked image, so its card can show a crop of it and the preview can open it. Let go when the files change or the dialog goes. */
function useFileUrls(files: readonly File[]): Array<string | undefined> {
  const [urls, setUrls] = React.useState<Array<string | undefined>>([]);
  React.useEffect(() => {
    const made = files.map((file) => (file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined));
    setUrls(made);
    return () => made.forEach((url) => url && URL.revokeObjectURL(url));
  }, [files]);
  return urls;
}

export function AttachmentsModal({ open, onClose, attachments = [], onRemoveAttachment, onUpload, loading }: AttachmentsModalProps) {
  const [picked, setPicked] = React.useState<File[]>([]);
  const [removed, setRemoved] = React.useState<string[]>([]);
  const [viewing, setViewing] = React.useState<number | null>(null);
  const urls = useFileUrls(picked);

  /* Each time it opens, start again. */
  React.useEffect(() => {
    if (!open) return;
    setPicked([]);
    setRemoved([]);
    setViewing(null);
  }, [open]);

  /* One list for the cards and the preview: what is already attached, then what was just picked. */
  const cards = [
    ...attachments
      .filter((file) => !removed.includes(file.id))
      .map((file) => ({
        id: file.id,
        name: file.name,
        kind: file.kind ?? ('doc' as FileAttachmentKind),
        thumb: file.thumb,
        src: file.src ?? file.thumb,
        remove: () => {
          setRemoved((now) => [...now, file.id]);
          onRemoveAttachment?.(file);
        },
      })),
    ...picked.map((file, index) => ({
      id: `new-${index}-${file.name}`,
      name: file.name,
      kind: kindOf(file),
      thumb: urls[index],
      src: urls[index],
      remove: () => setPicked((now) => now.filter((_, i) => i !== index)),
    })),
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Attachments"
        size="md"
        showClose={false}
        footer={
          <Button size="sm" type="button" disabled={picked.length === 0} loading={loading} onClick={() => onUpload(picked)}>
            Upload
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          {cards.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
              {cards.map((card, index) => (
                <li key={card.id}>
                  <FileAttachment name={card.name} kind={card.kind} thumb={card.thumb} onClick={() => setViewing(index)} onRemove={card.remove} />
                </li>
              ))}
            </ul>
          )}
          <Dropzone multiple onFiles={(files) => setPicked((now) => [...now, ...files])} />
        </div>
      </Modal>
      {/* A second modal over the first — its Escape closes only itself. */}
      {cards.length > 0 && (
        <AttachmentViewer
          open={viewing !== null}
          index={viewing ?? 0}
          onIndexChange={setViewing}
          onClose={() => setViewing(null)}
          files={cards.map((card) => ({ id: card.id, name: card.name, kind: card.kind, src: card.src, thumb: card.thumb }))}
        />
      )}
    </>
  );
}
