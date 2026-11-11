import * as React from 'react';
import { cn } from '../../lib/cn';
import type { AttachmentItem } from '../../lib/attachment-files';
import { Dropzone, type DropzoneProps } from '../../atoms/dropzone';
import { AttachmentViewer } from '../attachment-viewer';
import { FileAttachment } from '../file-attachment';

/**
 * Attachments — a set of attached files: **the cards, the drop area and the viewer** as one piece. The attachments dialog, the handoff forms and the deliverables card each
 * assembled these three by hand, with their own copies of the glyph and picture logic and their own gaps in focus handling; this is the one version.
 *
 * - **The cards are `FileAttachment`s**, in a list named "Attachments". Pressing a card (not its ✕) opens it in the viewer, in view and in edit alike.
 * - **The drop area is `Dropzone`** and shows when the caller can take files (`onFiles`). What it accepts and how it refuses a file (type, size, the sentence it says) is its own and a refused file never reaches
 *   `onFiles`; `error`, `hint`, `accept` and `maxSize` pass straight through, so an upload that failed on the server can say so under it.
 * - **The ✕ shows when the caller can remove** (`onRemove`), on every card. Removing is the caller's to decide: a dialog that stages removals until Save simply stops passing the file in `items`.
 * - **The viewer is `AttachmentViewer`**, over whatever is on screen (a dialog included: the stack closes the preview first on Escape, and focus returns to the card that opened it). `onDownload` adds its button.
 * - **Focus never drops.** Removing a card takes its ✕ with it, so focus goes to the next card's ✕, else the previous one's, else the drop area. Do it for the keyboard, in one place.
 *
 * It holds no files. `items` in, `onFiles` and `onRemove` out; `useAttachmentFiles` (`lib/attachment-files`) is the hook for a dialog or form that holds the files just picked, and `fileKind` the one place that
 * chooses a glyph for a `File`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface AttachmentsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onError'> {
  /** The files to show as cards: the ones already attached, then any just picked (`useAttachmentFiles().items`). */
  items: readonly AttachmentItem[];
  /** Files chosen or dropped, already past the drop area's type and size checks. Given, the drop area shows; left out, the set is view only. */
  onFiles?: (files: File[]) => void;
  /** A card's ✕ was pressed. Given, every card has a ✕; left out, none does. */
  onRemove?: (item: AttachmentItem) => void;
  /** Adds the viewer's download button, and says which file. The page does the download. */
  onDownload?: (item: AttachmentItem) => void;
  /** Said under the drop area: what only the caller knows (an upload that failed). A refused file's own message shows without it. */
  error?: DropzoneProps['error'];
  /** The drop area's accepted-types line. */
  hint?: string;
  /** What the picker takes. Defaults to `Dropzone`'s. */
  accept?: string;
  /** The size limit in bytes. Defaults to `Dropzone`'s. */
  maxSize?: number;
  /** Called with every file the drop area refused, and why. */
  onReject?: DropzoneProps['onReject'];
  /** Locks the drop area (an upload is in flight). */
  disabled?: boolean;
  /** The list's accessible name. */
  label?: string;
}

export const Attachments = React.forwardRef<HTMLDivElement, AttachmentsProps>(
  ({ className, items, onFiles, onRemove, onDownload, error, hint, accept, maxSize, onReject, disabled, label = 'Attachments', ...props }, ref) => {
    /* Which card the viewer has open, if any. */
    const [viewing, setViewing] = React.useState<number | null>(null);
    const list = React.useRef<HTMLUListElement>(null);
    const zone = React.useRef<HTMLInputElement>(null);
    /* The card whose ✕ was pressed, and where focus goes once it has left `items`: a neighbour's ✕, or the drop area. */
    const afterRemove = React.useRef<{ gone: string; to: string | null } | null>(null);

    React.useEffect(() => {
      const pending = afterRemove.current;
      if (!pending || items.some((item) => item.id === pending.gone)) return;
      afterRemove.current = null;
      /* The ✕ is named "Remove {file}", and is a sibling of the card's own button. */
      const next = pending.to ? list.current?.querySelector<HTMLElement>(`[data-attachment-id="${CSS.escape(pending.to)}"] button[aria-label^="Remove "]`) : null;
      (next ?? zone.current)?.focus();
    }, [items]);

    /* A card went while the viewer was open on it (a caller that removes from elsewhere): close it rather than show another file. */
    React.useEffect(() => {
      if (viewing !== null && viewing >= items.length) setViewing(null);
    }, [viewing, items.length]);

    return (
      <div ref={ref} className={cn('flex flex-col gap-3 font-sans', className)} {...props}>
        {items.length > 0 && (
          <ul ref={list} aria-label={label} className="m-0 flex list-none flex-wrap gap-2.5 p-0">
            {items.map((item, index) => (
              <li key={item.id} data-attachment-id={item.id}>
                <FileAttachment
                  name={item.name}
                  kind={item.kind}
                  thumb={item.thumb}
                  domain={item.domain}
                  onClick={() => setViewing(index)}
                  onRemove={
                    onRemove
                      ? () => {
                          const neighbour = items[index + 1] ?? items[index - 1] ?? null;
                          afterRemove.current = { gone: item.id, to: neighbour?.id ?? null };
                          onRemove(item);
                        }
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
        {onFiles && <Dropzone ref={zone} multiple onFiles={onFiles} onReject={onReject} error={error} hint={hint} accept={accept} maxSize={maxSize} disabled={disabled} />}
        {items.length > 0 && (
          <AttachmentViewer
            open={viewing !== null}
            index={viewing ?? 0}
            onIndexChange={setViewing}
            onClose={() => setViewing(null)}
            onDownload={onDownload ? (file) => {
              const item = items.find((candidate) => candidate.id === file.id);
              if (item) onDownload(item);
            } : undefined}
            files={items.map((item) => ({ id: item.id, name: item.name, kind: item.kind ?? 'doc', src: item.src ?? item.thumb, thumb: item.thumb }))}
          />
        )}
      </div>
    );
  },
);
Attachments.displayName = 'Attachments';
