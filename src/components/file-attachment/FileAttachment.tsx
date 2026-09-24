import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';

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
 * **Three states corrected against Figma's `_File_Attachment_Card_States`**
 * (design audit, 24 Sep 2026):
 *
 * - **Hover** tints the tile's border `stroke.focused`, not just its shadow.
 * - **Hover, remove only** — hovering the ✕ specifically gives *it* a filled
 *   background, on top of (not instead of) the tile's own hover border.
 * - **Pressed** fills the whole tile `surface.brand.faint` with a
 *   `stroke.focused` border — a stronger version of hover, not a separate
 *   look. Figma's exact values for these three aren't independently
 *   confirmed beyond the border-colour case; treat them as the best
 *   reading of the reference, not a measurement.
 *
 * Also new: **`domainLabel`**, a small corner badge (Figma's `Domain
 * Label=Yes` variant) — decorative on its own, so its text is repeated for
 * assistive tech via visually-hidden text rather than left `aria-hidden`
 * and silent.
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
  /**
   * A short domain/workspace code shown as a corner badge on the thumbnail —
   * "DS" for the domain a file was uploaded under. Omit it and there is no
   * badge: a file with nothing to disambiguate has nothing to add.
   */
  domainLabel?: string;
  /** Makes the tile a real button — usually "open the preview". */
  onClick?: () => void;
  onRemove?: () => void;
}

export const FileAttachment = React.forwardRef<HTMLDivElement, FileAttachmentProps>(
  ({ className, name, size, kind = 'doc', thumb, domainLabel, onClick, onRemove, ...props }, ref) => {
    const preview = (
      <>
        <span
          className={cn(
            'relative grid h-18 w-full place-items-center overflow-hidden rounded-md border border-stroke-subtle text-text-tertiary transition-colors',
            thumb ? 'bg-surface-elevated' : 'bg-surface-canvas',
            /* Hover/pressed tint this box, not the button around it — this is
               the only bordered element the export's own design has. Named
               group so hovering the sibling ✕ button (outside this button)
               never triggers it — that's the separate "Hover Remove Only"
               state below. */
            'group-hover/tile:border-stroke-focused group-focus-visible/tile:border-stroke-focused',
            'group-active/tile:border-stroke-focused group-active/tile:bg-surface-brand-faint',
          )}
        >
          {thumb ? (
            /* The name below is the caption; the thumbnail repeats it. */
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name={KIND_ICON[kind]} size="lg" aria-hidden="true" />
          )}
          {domainLabel && (
            <span
              aria-hidden="true"
              className={cn(
                'absolute left-1 top-1 inline-flex h-4 items-center gap-0.5 rounded-sm px-1',
                'border border-stroke-subtle bg-surface-elevated text-text-secondary',
              )}
            >
              <Icon name="link" className="size-2.5" />
              <span className="text-caption-md leading-none">{domainLabel}</span>
            </span>
          )}
        </span>
        {domainLabel && <span className="sr-only">{domainLabel} domain.</span>}
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
            /* Named group — the thumbnail span (in `preview`) reacts to this
               button's own hover/active/focus, not to the outer `group` div
               the sibling ✕ button also sits in. */
            className={cn(
              'group/tile flex w-full flex-col gap-1 rounded-md font-sans transition-shadow hover:shadow-raised',
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
              '-right-1.5 -top-1.5 absolute grid size-6 place-items-center rounded-full transition-colors',
              'border border-stroke-subtle bg-surface-elevated text-text-secondary shadow-raised',
              /* The button's own hover is a fill, layered on top of the tile's
                 already-revealed ✕ — "Hover Remove Only" in Figma's states,
                 distinct from just the tile being hovered. */
              'hover:bg-surface-neutral-subtle hover:text-text-primary',
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
