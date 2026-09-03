import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';

/**
 * AttachmentPreview — the opened attachment: a header naming the file with
 * download/close affordances, and a body showing the image or an honest "no
 * inline preview". An inline panel, not a modal — put it in a `Modal` when it
 * should interrupt; alone it is the right column of an evidence screen.
 *
 * The header's affordances are the system's own `IconButton` (`tertiary`,
 * `sm`), named "Download ${name}" / "Close preview" — the export sized its
 * own odd buttons and reached components through the window-global registry.
 *
 * The body never pretends: `kind="doc"` (or an image without `src`) states
 * "No inline preview" instead of rendering a broken frame, and the download
 * affordance is how the person actually gets to the content.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface AttachmentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  /** Image source — required for an inline image preview. */
  src?: string;
  kind?: 'image' | 'doc';
  /** Human-readable — '1.2 MB'. */
  size?: string;
  onDownload?: () => void;
  onClose?: () => void;
}

export const AttachmentPreview = React.forwardRef<HTMLDivElement, AttachmentPreviewProps>(
  ({ className, name, src, kind = 'image', size, onDownload, onClose, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col overflow-hidden rounded-md border border-stroke-subtle bg-surface-elevated font-sans shadow-menu',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 border-b border-stroke-subtle py-2 pl-3 pr-2">
        <Icon
          name={kind === 'image' ? 'image' : 'file'}
          size="sm"
          aria-hidden="true"
          className="shrink-0 text-text-tertiary"
        />
        <span className="min-w-0 flex-1 truncate text-label-md text-text-primary" title={name}>
          {name}
        </span>
        {size && <span className="shrink-0 text-label-sm text-text-subtle">{size}</span>}
        {onDownload && (
          <IconButton
            variant="tertiary"
            size="sm"
            icon="download-simple"
            label={`Download ${name}`}
            onClick={onDownload}
          />
        )}
        {onClose && (
          <IconButton variant="tertiary" size="sm" icon="x" label="Close preview" onClick={onClose} />
        )}
      </div>
      <div
        className={cn(
          'grid min-h-50 place-items-center bg-surface-canvas',
          !(kind === 'image' && src) && 'p-8',
        )}
      >
        {kind === 'image' && src ? (
          /* The header already names the file; the image does not re-announce it. */
          <img src={src} alt="" className="block max-h-105 max-w-full" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-tertiary">
            <Icon name="file" size="lg" aria-hidden="true" />
            <span className="text-body-sm">No inline preview</span>
          </div>
        )}
      </div>
    </div>
  ),
);
AttachmentPreview.displayName = 'AttachmentPreview';
