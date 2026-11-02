import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../../atoms/icon-button';
import { DomainLabel, type DomainKey } from '../domain-label';
import { DeliverableLinkForm, type DeliverableLinkDraft } from '../deliverable-link-form';
import { Tooltip } from '../tooltip';

/**
 * DeliverableLink — one link added to a deliverable: the domain it was added by, and its title as a
 * hyperlink. Read off Figma's `_Deliverable_Added_Link_Item` (Default, Hover, Editing),
 * `_Deliverable_Added_Title_Hyperlinked` and `_Deliverable_Link_Actions`.
 *
 * **Viewing** is just the label and the link, opening in a new tab. **Editable** adds a pencil and a
 * bin on the right, shown while the row is hovered or has focus: the bin removes the link, and the
 * pencil turns the row, in its own place, into the form for that link (Cancel and Save). A long
 * title is cut with "…"; its tooltip gives the whole title and the address.
 *
 * It reports; the list, and where the data lives, are the page's.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DeliverableLinkProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  url: string;
  /** Which domain added it: the label before the title. */
  domain?: DomainKey;
  /** Shows the pencil and the bin. Off for a read-only view. */
  editable?: boolean;
  /** Fires with the changed link when Save is pressed. */
  onSave?: (link: DeliverableLinkDraft) => void;
  /** Fires when the bin is pressed. The page removes it. */
  onRemove?: () => void;
}

export const DeliverableLink = React.forwardRef<HTMLDivElement, DeliverableLinkProps>(
  ({ className, title, url, domain, editable, onSave, onRemove, ...props }, ref) => {
    const [editing, setEditing] = React.useState(false);

    if (editing) {
      return (
        <div ref={ref} className={cn('py-3', className)} {...props}>
          <DeliverableLinkForm
            mode="edit"
            initial={{ url, title }}
            onCancel={() => setEditing(false)}
            onSubmit={([link]) => {
              onSave?.(link!);
              setEditing(false);
            }}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'group/link flex min-h-12 items-center gap-2 rounded-sm px-2 transition-colors',
          editable && 'hover:bg-surface-brand-faint focus-within:bg-surface-brand-faint',
          className,
        )}
        {...props}
      >
        {domain && <DomainLabel domain={domain} tooltip />}
        <Tooltip
          content={
            <span className="flex flex-col">
              <span>{title}</span>
              <span>{url}</span>
            </span>
          }
          className="min-w-0 flex-1"
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'block truncate text-body-sm-regular text-text-link-default underline-offset-2',
              'hover:text-text-link-hover hover:underline active:text-text-link-pressed',
              'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            {title}
          </a>
        </Tooltip>
        {editable && (
          /* In the page and the tab order always; only unseen until hover or focus. */
          <span
            className={cn(
              'flex shrink-0 items-center gap-1 opacity-0 transition-opacity motion-reduce:transition-none',
              'group-hover/link:opacity-100 group-focus-within/link:opacity-100 pointer-coarse:opacity-100',
            )}
          >
            <IconButton
              icon="pencil-simple"
              variant="tertiary"
              size="xs"
              label={`Edit Link`}
              onClick={() => setEditing(true)}
            />
            <IconButton
              icon="trash"
              variant="tertiary"
              size="xs"
              label="Delete Link"
              onClick={onRemove}
              className="text-accent-critical-outline-content-default hover:text-accent-critical-outline-content-hover"
            />
          </span>
        )}
      </div>
    );
  },
);
DeliverableLink.displayName = 'DeliverableLink';
