import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Modal } from '../modal';

/**
 * AttachmentViewer — a full-screen gallery for the files attached to something: open one and see it
 * large, step to the next, jump with the strip of thumbnails along the bottom, download it, close it.
 * It is what a click on a `FileAttachment` opens.
 *
 * What it does, by what is in the file:
 *
 * - **Every file:** a header with the file's glyph, its name and "2 of 4", a download button and a close
 *   button; previous and next arrows at the sides (stopped at the first and last); a strip of thumbnails
 *   (the picture itself for an image, a document glyph otherwise) with the open one marked; Escape closes.
 * - **An image** is shown to fit, and can be **zoomed**: − and + buttons and a reset, with the percentage
 *   read out beside them (25 to 400, in steps of 25; the keys `+`, `-` and `0` do the same). Zoomed in, it
 *   scrolls. A PDF has no zoom of ours: it shows in the browser's own viewer, which has its own.
 * - **A PDF** is embedded in a frame; **a video** plays with its controls; **anything else** (a document, a
 *   sheet) honestly says there is no preview and offers the download.
 *
 * It is built on `Modal` at its `full` size, so the focus contract is Modal's: focus moves in, the page behind
 * is inert, Tab stays inside, and closing returns focus to the card that opened it. The viewer draws in the
 * dark theme whatever the page is, as a viewer for pictures should.
 *
 * It reports: the page owns which file is open (`index`, or `defaultIndex`) and what downloading means.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type AttachmentViewerKind = 'image' | 'pdf' | 'video' | 'doc' | 'csv';

export interface AttachmentViewerFile {
  id: string;
  name: string;
  kind: AttachmentViewerKind;
  /** The file itself: what the stage shows. Without it the stage says there is no preview. */
  src?: string;
  /** A small picture for the strip. An image falls back to `src`. */
  thumb?: string;
}

export interface AttachmentViewerProps {
  files: readonly AttachmentViewerFile[];
  open: boolean;
  /** Controlled: which file is open. */
  index?: number;
  /** Uncontrolled: which file opens first. Default 0. */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  onClose: () => void;
  /** Renders the download button and fires with the open file. The page does the download. */
  onDownload?: (file: AttachmentViewerFile) => void;
}

const KIND_ICON: Record<AttachmentViewerKind, IconName> = {
  image: 'image',
  pdf: 'file',
  video: 'film-reel',
  doc: 'file',
  csv: 'file',
};

/* The viewer's quiet controls (download, close, zoom) wear the neutral palette, not the brand blue of a
   ghost button: they are chrome around a picture, not actions to invite. */
const NEUTRAL_GLYPH =
  'text-neutral-outline-content-default hover:text-neutral-outline-content-hover active:text-neutral-outline-content-pressed disabled:text-neutral-outline-content-disabled';

const ZOOM_MIN = 25;
const ZOOM_MAX = 400;
const ZOOM_STEP = 25;
const ZOOM_DEFAULT = 100;

export function AttachmentViewer({
  files,
  open,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  onClose,
  onDownload,
}: AttachmentViewerProps) {
  const [inner, setInner] = React.useState(defaultIndex);
  const index = Math.min(Math.max(indexProp ?? inner, 0), Math.max(files.length - 1, 0));
  const [zoom, setZoom] = React.useState(ZOOM_DEFAULT);
  const file = files[index];

  const go = React.useCallback(
    (next: number) => {
      if (next < 0 || next >= files.length) return;
      if (indexProp === undefined) setInner(next);
      onIndexChange?.(next);
      setZoom(ZOOM_DEFAULT);
    },
    [files.length, indexProp, onIndexChange],
  );
  const zoomBy = React.useCallback(
    (delta: number) => setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta))),
    [],
  );

  /* Arrows step; + - 0 zoom an image. Not while typing, and not inside the PDF frame (its own keys). */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (event.key === 'ArrowLeft') go(index - 1);
      else if (event.key === 'ArrowRight') go(index + 1);
      else if (file?.kind === 'image') {
        if (event.key === '+' || event.key === '=') zoomBy(ZOOM_STEP);
        else if (event.key === '-') zoomBy(-ZOOM_STEP);
        else if (event.key === '0') setZoom(ZOOM_DEFAULT);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, index, file?.kind, go, zoomBy]);

  if (!file) return null;

  const stage = () => {
    if (!file.src) return <NoPreview file={file} onDownload={onDownload} />;
    if (file.kind === 'image') {
      return (
        /* Scrolls when zoomed in. `m-auto` on the inner box centres it and still lets the left and top
           edges be reached, which centring with a grid does not. */
        <div className="flex h-full w-full overflow-auto">
          {/* 100% is the picture fitted to the frame, whichever of its height and width is the longer: it
              fills that side and never clips. Zoom scales that box, so 200% is twice the fit. */}
          <div className="m-auto flex-none" style={{ width: `${zoom}%`, height: `${zoom}%` }}>
            {/* The header already names the file; the picture does not announce it again. */}
            <img src={file.src} alt="" className="size-full object-contain" />
          </div>
        </div>
      );
    }
    if (file.kind === 'pdf') {
      return <iframe title={file.name} src={file.src} className="h-full w-full border-0 bg-surface-elevated" />;
    }
    if (file.kind === 'video') {
      return <video controls src={file.src} className="max-h-full max-w-full" aria-label={file.name} />;
    }
    return <NoPreview file={file} onDownload={onDownload} />;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      showClose={false}
      aria-label={`Attachment: ${file.name}`}
      bodyClassName="flex min-h-0 flex-1 flex-col p-0"
    >
      {/* `dark`: the viewer is drawn in the dark theme whatever the page is. */}
      <div className="dark flex h-full min-h-0 flex-col bg-surface-canvas font-sans text-text-primary">
        <header className="flex shrink-0 items-center gap-3 border-b border-stroke-subtle px-4 py-3">
          <Icon name={KIND_ICON[file.kind]} size="md" aria-hidden="true" className="shrink-0 text-text-tertiary" />
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="truncate text-label-sm-medium text-text-primary" title={file.name}>
              {file.name}
            </h2>
            <p className="text-caption-md-regular text-text-tertiary">
              {index + 1} of {files.length}
            </p>
          </div>
          {onDownload && (
            <IconButton
              icon="download-simple"
              variant="tertiary"
              label={`Download ${file.name}`}
              onClick={() => onDownload(file)}
              className={NEUTRAL_GLYPH}
            />
          )}
          <IconButton icon="x" variant="tertiary" label="Close" onClick={onClose} className={NEUTRAL_GLYPH} />
        </header>

        <div className="relative flex min-h-0 flex-1 items-stretch">
          {/* Padded at the sides by the arrows' width, so the file never goes behind a caret. */}
          <div className="min-h-0 min-w-0 flex-1 px-20 py-4">{stage()}</div>

          {files.length > 1 && (
            <>
              <IconButton
                icon="caret-left"
                variant="neutral"
                label="Previous attachment"
                disabled={index === 0}
                onClick={() => go(index - 1)}
                className="absolute top-1/2 left-4 -translate-y-1/2"
              />
              <IconButton
                icon="caret-right"
                variant="neutral"
                label="Next attachment"
                disabled={index === files.length - 1}
                onClick={() => go(index + 1)}
                className="absolute top-1/2 right-4 -translate-y-1/2"
              />
            </>
          )}
        </div>

        {/* The strip is centred; the zoom group sits at the right in its own column, so they never overlap
            (a narrow screen scrolls the strip). */}
        <footer className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 border-t border-stroke-subtle px-4 py-3">
          <span aria-hidden="true" />
          <ul className="flex max-w-full gap-2 overflow-x-auto p-1">
            {files.map((f, i) => (
              <li key={f.id} className="shrink-0">
                <button
                  type="button"
                  aria-label={`${f.name}, ${i + 1} of ${files.length}`}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => go(i)}
                  className={cn(
                    'grid size-14 place-items-center overflow-hidden rounded-sm bg-surface-neutral-subtle outline-none',
                    'text-text-tertiary transition-colors hover:bg-surface-neutral-medium',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                    i === index && 'outline-2 outline-offset-2 outline-stroke-focused',
                  )}
                >
                  {(f.thumb ?? (f.kind === 'image' ? f.src : undefined)) ? (
                    <img src={f.thumb ?? f.src} alt="" className="size-full object-cover" />
                  ) : (
                    <Icon name={KIND_ICON[f.kind]} size="md" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {file.kind === 'image' && file.src && (
            <div
              role="group"
              aria-label="Zoom"
              className="col-start-3 flex items-center gap-1 justify-self-end rounded-pill bg-surface-neutral-subtle p-1"
            >
              <IconButton
                icon="minus"
                variant="tertiary"
                size="sm"
                label="Zoom out"
                disabled={zoom <= ZOOM_MIN}
                onClick={() => zoomBy(-ZOOM_STEP)}
                className={NEUTRAL_GLYPH}
              />
              <IconButton
                icon="arrows-clockwise"
                variant="tertiary"
                size="sm"
                label="Reset zoom"
                disabled={zoom === ZOOM_DEFAULT}
                onClick={() => setZoom(ZOOM_DEFAULT)}
                className={NEUTRAL_GLYPH}
              />
              <IconButton
                icon="plus"
                variant="tertiary"
                size="sm"
                label="Zoom in"
                disabled={zoom >= ZOOM_MAX}
                onClick={() => zoomBy(ZOOM_STEP)}
                className={NEUTRAL_GLYPH}
              />
              <span
                aria-live="polite"
                className="min-w-12 px-2 text-center text-caption-md-medium text-text-primary"
              >
                {zoom}%
              </span>
            </div>
          )}
        </footer>
      </div>
    </Modal>
  );
}

/** A file with nothing to show inline: says so, and offers the download. */
function NoPreview({
  file,
  onDownload,
}: {
  file: AttachmentViewerFile;
  onDownload?: (file: AttachmentViewerFile) => void;
}) {
  return (
    <div className="grid h-full w-full place-items-center p-8">
      <div className="flex flex-col items-center gap-3 text-text-tertiary">
        <Icon name={KIND_ICON[file.kind]} size="lg" aria-hidden="true" />
        <p className="text-body-sm-regular">No preview available for this file.</p>
        {onDownload && (
          <button
            type="button"
            onClick={() => onDownload(file)}
            className="text-body-sm-medium text-text-link-default underline-offset-2 hover:underline"
          >
            Download {file.name}
          </button>
        )}
      </div>
    </div>
  );
}
