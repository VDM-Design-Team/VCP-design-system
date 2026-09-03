import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../icon';

/**
 * FileAttachment — one attached file as a small tile: thumbnail or kind
 * glyph, name, size, optional open and remove. The gallery row under a
 * comment or an evidence panel is a run of these; `Dropzone` is how they
 * arrive, `AttachmentPreview` is where opening one leads.
 *
 * The export made the tile a clickable `<div>` and only mounted the remove
 * button while the pointer hovered — a control keyboards could never reach.
 * Rebuilt on the Chip rule: the openable area is a real `<button>`, the
 * remove ✕ is its own sibling button (never nested), always in the tab
 * order, and *revealed* by hover or by focus rather than mounted by hover.
 *
 * `kind` is generic file vocabulary (image/pdf/doc/csv/video), which is why
 * this is a component; what counts as "evidence" is a pattern's business.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type FileAttachmentKind = 'image' | 'pdf' | 'doc' | 'csv' | 'video';

const KIND_ICON: Record<FileAttachmentKind, IconName> = {
  image: 'image',
  video: 'film-reel',
  pdf: 'file',
  doc: 'file',
  csv: 'file',
};

export interface FileAttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  /** Human-readable — '1.2 MB'. Formatting is the caller's. */
  size?: string;
  kind?: FileAttachmentKind;
  /** Image src for a real thumbnail; otherwise the kind glyph. */
  thumb?: string;
  /** Makes the tile a real button — usually "open the preview". */
  onClick?: () => void;
  onRemove?: () => void;
}

export const FileAttachment = React.forwardRef<HTMLDivElement, FileAttachmentProps>(
  ({ className, name, size, kind = 'doc', thumb, onClick, onRemove, ...props }, ref) => {
    const preview = (
      <>
        <span
          className={cn(
            'grid h-18 w-full place-items-center overflow-hidden rounded-md border border-stroke-subtle text-text-tertiary',
            thumb ? 'bg-surface-elevated' : 'bg-surface-canvas',
          )}
        >
          {thumb ? (
            /* The name below is the caption; the thumbnail repeats it. */
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name={KIND_ICON[kind]} size="lg" aria-hidden="true" />
          )}
        </span>
        <span className="w-full truncate text-left text-label-sm text-text-secondary" title={name}>
          {name}
        </span>
        {size && <span className="w-full text-left text-label-sm text-text-subtle">{size}</span>}
      </>
    );

    return (
      /* `group` drives the ✕ reveal on hover; focus reveals it too. */
      <div ref={ref} className={cn('group relative w-26', className)} {...props}>
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            className={cn(
              'flex w-full flex-col gap-1 rounded-md font-sans transition-shadow hover:shadow-raised',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            {preview}
          </button>
        ) : (
          <span className="flex w-full flex-col gap-1 font-sans">{preview}</span>
        )}
        {onRemove && (
          <button
            type="button"
            aria-label={`Remove ${name}`}
            onClick={onRemove}
            className={cn(
              '-right-1.5 -top-1.5 absolute grid size-6 place-items-center rounded-full',
              'border border-stroke-subtle bg-surface-elevated text-text-secondary shadow-raised',
              'hover:text-text-primary',
              /* In the tab order always; visible on tile hover or any focus —
                 never mounted-by-hover, which no keyboard can trigger. */
              'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            <Icon name="x" className="size-3" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  },
);
FileAttachment.displayName = 'FileAttachment';
