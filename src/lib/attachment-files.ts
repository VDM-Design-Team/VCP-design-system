import * as React from 'react';
import type { FileAttachmentKind } from '../components/file-attachment';

/**
 * The files a person has just picked, as the cards that show them. **This is the one place that turns a `File` into a card**: the glyph (`fileKind`) and a picture of an image
 * (`useAttachmentFiles`). The attachments dialog, the handoff forms and the deliverables card each had their own copy of both, word for word.
 */

const EXTENSION_KIND: ReadonlyArray<readonly [RegExp, FileAttachmentKind]> = [
  [/\.(png|jpe?g|gif|webp|svg|avif|heic)$/i, 'image'],
  [/\.(mp4|mov|webm|m4v|avi)$/i, 'video'],
  [/\.pdf$/i, 'pdf'],
  [/\.csv$/i, 'csv'],
];

/** The card's glyph for a file: by its type, and by its extension when the browser gave no type (it often does not, for a .csv or a .docx). Anything else is a document. */
export const fileKind = (file: Pick<File, 'type' | 'name'>): FileAttachmentKind => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type === 'text/csv') return 'csv';
  return EXTENSION_KIND.find(([pattern]) => pattern.test(file.name))?.[1] ?? 'doc';
};

/** One card's worth of an attached file: what `Attachments` takes. */
export interface AttachmentItem {
  /** Tells it apart, and keys its card. */
  id: string;
  name: string;
  kind?: FileAttachmentKind;
  /** A small picture, for an image. */
  thumb?: string;
  /** The whole file, for the preview. */
  src?: string;
  /** The domain it was handed over from: the card's corner badge. */
  domain?: import('../components/file-attachment').FileAttachmentDomain;
}

interface Picked {
  id: string;
  file: File;
  /** An address for an image, so its card can show a crop of it and the preview can open it. */
  url?: string;
}

let nextId = 0;
const addressOf = (file: File) => (fileKind(file) === 'image' ? URL.createObjectURL(file) : undefined);

/**
 * The files picked in a dialog or a form, kept as cards. `add` takes what `Dropzone` hands over, `remove` drops one by its card's `id`, `clear` empties it (an upload went through,
 * the dialog reopened). `items` is what `Attachments` shows; `files` is the `File`s themselves, for the upload.
 *
 * An image's address is made when it is picked and **let go of when its card goes**, so a card never shows the crop of the file that sat in its place before (an index-keyed list
 * did, for a render), and nothing is held after the dialog is gone.
 */
export function useAttachmentFiles() {
  const [picked, setPicked] = React.useState<Picked[]>([]);
  const latest = React.useRef(picked);
  latest.current = picked;
  /* A StrictMode cleanup lets every address go and then runs the effect again: the cards must get theirs back. */
  const released = React.useRef(false);

  React.useEffect(() => {
    if (released.current) {
      released.current = false;
      setPicked((now) => now.map((entry) => ({ ...entry, url: addressOf(entry.file) })));
    }
    return () => {
      latest.current.forEach((entry) => entry.url && URL.revokeObjectURL(entry.url));
      released.current = true;
    };
  }, []);

  const add = React.useCallback((files: readonly File[]) => {
    setPicked((now) => [...now, ...files.map((file) => ({ id: `picked-${++nextId}`, file, url: addressOf(file) }))]);
  }, []);

  const remove = React.useCallback((id: string) => {
    setPicked((now) => {
      now.filter((entry) => entry.id === id).forEach((entry) => entry.url && URL.revokeObjectURL(entry.url));
      return now.filter((entry) => entry.id !== id);
    });
  }, []);

  const clear = React.useCallback(() => {
    setPicked((now) => {
      now.forEach((entry) => entry.url && URL.revokeObjectURL(entry.url));
      return [];
    });
  }, []);

  const items = React.useMemo<AttachmentItem[]>(
    () => picked.map(({ id, file, url }) => ({ id, name: file.name, kind: fileKind(file), thumb: url, src: url })),
    [picked],
  );
  const files = React.useMemo(() => picked.map((entry) => entry.file), [picked]);

  return { items, files, add, remove, clear };
}
