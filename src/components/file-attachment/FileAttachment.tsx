import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';

/**
 * FileAttachment — one attached file as a small card: kind glyph and name,
 * optional open and remove. The gallery row under a comment or an evidence
 * panel is a run of these; `Dropzone` is how they arrive, `AttachmentPreview`
 * is where opening one leads.
 *
 * Built to Figma's `_File_Attachment_Card`, `_File_Attachment_Card_States`,
 * `_File_Attachment_Remove_Button` and `_Domain_Label` (aligned 2 Oct 2026):
 *
 * - **One bordered card**, 8 padding, glyph (32) centred over the name — the
 *   name sits *inside* the card, not under a separate thumbnail well.
 * - **Name** in `body-sm-regular` (14 regular), `text.secondary`, centred under
 *   the glyph. A long name shortens its stem and keeps the extension:
 *   "2)-Some….pdf" for "2)-Some-very-long-file-name.pdf", never
 *   "2)-Some-very-long-…".
 * - **No file size.** Figma's card is the glyph and the name, nothing else.
 * - **Edit mode** (has `onRemove`): hovering the card fills it
 *   `surface.brand.faint` and shows the ✕; hovering the ✕ itself does not fill
 *   the card ("Hover Remove Only"); pressing an openable card fills it
 *   `surface.brand.subtle` and hides the ✕, so it's clear the press opens the
 *   file. **View mode** (no `onRemove`): hover `surface.brand.faint`, pressed
 *   `surface.brand.subtle`, no ✕. A card that is neither openable nor removable
 *   doesn't react at all.
 * - **Remove** is a 28 critical-tonal circle in the card's top-right corner,
 *   inset 2 from the edge on both sides, revealed on hover or focus, with its
 *   own default, hover and pressed fills (`accent.critical.tonal.surface`).
 * - **Glyph** `neutral.outline.content.default`; the ✕ is
 *   `accent.critical.outline.content` on `accent.critical.tonal.surface`.
 * - **`domain`** is the badge for an AV handed over from another domain: a
 *   neutral-tonal pill (20 high, 8 either side, 2 above and below, 4 between,
 *   `caption-sm-medium`, inverse 1 border) inset 4 from the card's top-left
 *   corner — glyph then code. Six domains, and this component owns that mapping
 *   (below): Design DS, Development DV, Governance GV, Content CN, Partners PT,
 *   QA QA. `domainLabel` / `domainIcon` remain for a code outside the six.
 *
 * The export made the tile a clickable `<div>` and only mounted the remove
 * button while the pointer hovered — a control keyboards could never reach.
 * Built on the Chip rule: the openable area is a real `<button>`, the remove
 * ✕ is its own sibling button (never nested), always in the tab order, and
 * *revealed* by hover or by focus rather than mounted by hover.
 *
 * `kind` is generic file vocabulary (image/pdf/doc/csv/video), which is why
 * this is a component; what counts as "evidence" is a pattern's business.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type FileAttachmentKind = 'image' | 'pdf' | 'doc' | 'csv' | 'video';

/** The domain an AV was handed over from — the corner badge. */
export type FileAttachmentDomain =
  | 'design'
  | 'development'
  | 'governance'
  | 'content'
  | 'partners'
  | 'qa';

/* THE mapping — domain → glyph and code, off Figma's `_Domain_Label` set. The
   badge colour is the same for every domain (`neutral.tonal`, fixed); only the
   glyph and the two letters tell them apart. */
const DOMAIN: Record<FileAttachmentDomain, { icon: IconName; code: string; name: string }> = {
  design: { icon: 'pen-nib', code: 'DS', name: 'Design' },
  development: { icon: 'code', code: 'DV', name: 'Development' },
  governance: { icon: 'bank', code: 'GV', name: 'Governance' },
  content: { icon: 'image', code: 'CN', name: 'Content' },
  partners: { icon: 'handshake', code: 'PT', name: 'Partners' },
  qa: { icon: 'file-magnifying-glass', code: 'QA', name: 'QA' },
};

const KIND_ICON: Record<FileAttachmentKind, IconName> = {
  image: 'image',
  video: 'film-reel',
  pdf: 'file',
  doc: 'file',
  csv: 'file',
};

export interface FileAttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  kind?: FileAttachmentKind;
  /**
   * Image src. Shown in the glyph's place, at the glyph's size — the card
   * stays the same shape whether or not there's a real image behind it.
   */
  thumb?: string;
  /**
   * The domain this AV was handed over from — draws the corner badge with that
   * domain's glyph and code. Omit it and there is no badge: a file with nothing
   * to disambiguate has nothing to add.
   */
  domain?: FileAttachmentDomain;
  /**
   * A badge code outside the six domains. Ignored when `domain` is set.
   */
  domainLabel?: string;
  /** The glyph for `domainLabel`. Ignored when `domain` is set. */
  domainIcon?: IconName;
  /** Makes the card a real button — usually "open the preview". */
  onClick?: () => void;
  onRemove?: () => void;
}

/**
 * Split "report-final.pdf" into "report-final" and ".pdf" so the stem can
 * shorten while the extension stays readable. A name with no extension, or
 * one that is only an extension (".env"), stays whole.
 */
function splitName(name: string): [string, string] {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return [name, ''];
  return [name.slice(0, dot), name.slice(dot)];
}

export const FileAttachment = React.forwardRef<HTMLDivElement, FileAttachmentProps>(
  (
    { className, name, kind = 'doc', thumb, domain, domainLabel, domainIcon = 'pen-nib', onClick, onRemove, ...props },
    ref,
  ) => {
    const [stem, ext] = splitName(name);
    const badge = domain
      ? DOMAIN[domain]
      : domainLabel
        ? { icon: domainIcon, code: domainLabel, name: domainLabel }
        : undefined;

    const card = (
      <span className="relative flex w-full flex-col items-center rounded-sm border border-stroke-subtle p-2">
        {thumb ? (
          /* The name below is the caption; the image repeats it. */
          <img src={thumb} alt="" className="size-8 rounded-xs object-cover" />
        ) : (
          <Icon name={KIND_ICON[kind]} className="size-8 text-neutral-outline-content-default" aria-hidden="true" />
        )}
        <span
          className="flex w-full items-center justify-center whitespace-nowrap font-sans text-body-sm-regular text-text-secondary"
          title={name}
        >
          {/* Hugs its text, so a short name stays centred under the glyph; it
              only shrinks (with an ellipsis) when the name is too long, and the
              extension never does. */}
          <span className="min-w-0 truncate">{stem}</span>
          {ext && <span className="shrink-0">{ext}</span>}
        </span>
      </span>
    );

    return (
      /* `group` drives the ✕ reveal on hover; focus reveals it too. */
      <div ref={ref} className={cn('group relative w-26', className)} {...props}>
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            /* `peer/tile` lets the sibling ✕ hide while this card is pressed.
               Hover and pressed fill this button, not the bordered card inside
               it — Figma's states frame fills the 8-radius container around a
               6-radius card. */
            className={cn(
              'peer/tile flex w-full rounded-md transition-colors',
              'hover:bg-surface-brand-faint active:bg-surface-brand-subtle',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            {card}
          </button>
        ) : (
          /* Edit mode without an open action still reacts to hover, as the
             design draws it. The ✕ is a sibling overlay, so hovering it leaves
             this unfilled. */
          <span
            className={cn(
              'flex w-full rounded-md transition-colors',
              onRemove && 'hover:bg-surface-brand-faint',
            )}
          >
            {card}
          </span>
        )}
        {badge && (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute left-1 top-1 inline-flex items-center gap-1 rounded-pill px-2 py-0.5',
                'border border-stroke-inverse bg-neutral-tonal-surface-default text-neutral-tonal-content-default',
              )}
            >
              <Icon name={badge.icon} className="size-3" />
              <span className="text-caption-sm-medium">{badge.code}</span>
            </span>
            {/* The badge is decorative; the domain still reaches a screen reader. */}
            <span className="sr-only">{badge.name} domain.</span>
          </>
        )}
        {onRemove && (
          <button
            type="button"
            aria-label={`Remove ${name}`}
            onClick={onRemove}
            className={cn(
              'group/remove absolute right-0.5 top-0.5 grid size-7 place-items-center rounded-full p-0.5',
              /* In the tab order always; visible on card hover or any focus —
                 never mounted-by-hover, which no keyboard can trigger. Hidden
                 while the card itself is pressed, per Figma's note. */
              'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100',
              'peer-active/tile:invisible',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            <span
              className={cn(
                'grid size-full place-items-center rounded-full transition-colors',
                'bg-accent-critical-tonal-surface-default text-accent-critical-outline-content-default',
                'group-hover/remove:bg-accent-critical-tonal-surface-hover group-hover/remove:text-accent-critical-outline-content-hover',
                'group-active/remove:bg-accent-critical-tonal-surface-pressed group-active/remove:text-accent-critical-outline-content-pressed',
              )}
            >
              <Icon name="x" size="sm" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
    );
  },
);
FileAttachment.displayName = 'FileAttachment';
