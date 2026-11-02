import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { DeliverableLink } from '../../components/deliverable-link';
import { DeliverableLinkForm, type DeliverableLinkDraft } from '../../components/deliverable-link-form';
import type { DomainKey } from '../../components/domain-label';
import { AttachmentViewer } from '../../components/attachment-viewer';
import { Dropzone, type DropzoneProps } from '../../atoms/dropzone';
import { FileAttachment, type FileAttachmentKind } from '../../components/file-attachment';

/**
 * DeliverablesCard — what an Added Value delivers: the links to it and the files attached. Read off
 * Figma's `Deliverables_Card` (View and Edit, for the Design and Development domains).
 *
 * **`domain` picks the sections.** Design has Links; Development has Video Links, then Links; both
 * have Attachments. **`mode` is `view` or `edit`.** Viewing is the lists and the files, nothing to
 * press but the links and the files themselves. Editing adds a blue + beside each links title that
 * opens the add form under it (a URL and a title, "+ Add another link", Cancel and Add), the pencil
 * and bin on each added link, a ✕ on each file, and a drop area under Attachments.
 *
 * The page owns the data. The card reports: `onAddLinks` with every link the form handed over,
 * `onEditLink`, `onRemoveLink`, `onFiles`, `onRemoveFile`.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type DeliverablesDomain = 'design' | 'development';
export type DeliverablesLinkSection = 'links' | 'video';

export interface DeliverableLinkItem {
  id: string;
  title: string;
  url: string;
  /** The domain that added it. */
  domain: DomainKey;
}

export interface DeliverableFile {
  id: string;
  name: string;
  kind?: FileAttachmentKind;
  /** An image's own thumbnail, for the card and the viewer's strip. */
  thumb?: string;
  /** The file itself: what the viewer shows when its card is pressed. */
  src?: string;
  /** The domain it was added from. */
  domain?: DomainKey;
}

export interface DeliverablesCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  domain: DeliverablesDomain;
  mode: 'view' | 'edit';
  /** Development only: the Video Links. */
  videoLinks?: readonly DeliverableLinkItem[];
  links?: readonly DeliverableLinkItem[];
  files?: readonly DeliverableFile[];
  /** The heading level to draw the title as. Default `h2`. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  /** Edit: the form handed over these links (one or several). */
  onAddLinks?: (section: DeliverablesLinkSection, links: DeliverableLinkDraft[]) => void;
  onEditLink?: (section: DeliverablesLinkSection, id: string, link: DeliverableLinkDraft) => void;
  onRemoveLink?: (section: DeliverablesLinkSection, id: string) => void;
  /** Edit: files chosen or dropped. */
  onFiles?: (files: File[]) => void;
  onRemoveFile?: (id: string) => void;
  /** Renders the viewer's download button and fires with the open file's id. The page does the download. */
  onDownloadFile?: (id: string) => void;
  /** The drop area's own message, for a rejected file. */
  fileError?: DropzoneProps['error'];
  /** The drop area's accepted-types line. */
  fileHint?: string;
  fileAccept?: string;
}

export const DeliverablesCard = React.forwardRef<HTMLElement, DeliverablesCardProps>(
  (
    {
      className,
      domain,
      mode,
      videoLinks = [],
      links = [],
      files = [],
      headingLevel: Heading = 'h2',
      onAddLinks,
      onEditLink,
      onRemoveLink,
      onFiles,
      onRemoveFile,
      onDownloadFile,
      fileError,
      fileHint,
      fileAccept,
      ...props
    },
    ref,
  ) => {
    const editing = mode === 'edit';
    const headingId = React.useId();
    /* Which file the viewer has open, if any. A press on any file card opens it, in view or edit. */
    const [viewing, setViewing] = React.useState<number | null>(null);

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cn('flex flex-col gap-6 rounded-md bg-surface-elevated p-6 font-sans', className)}
        {...props}
      >
        <Heading id={headingId} className="text-title-sm-bold text-text-primary">
          Deliverables
        </Heading>

        {domain === 'development' && (
          <LinkSection
            title="Video Links"
            titleIcon
            items={videoLinks}
            editing={editing}
            onAdd={(drafts) => onAddLinks?.('video', drafts)}
            onEdit={(id, link) => onEditLink?.('video', id, link)}
            onRemove={(id) => onRemoveLink?.('video', id)}
          />
        )}
        <LinkSection
          title="Links"
          items={links}
          editing={editing}
          onAdd={(drafts) => onAddLinks?.('links', drafts)}
          onEdit={(id, link) => onEditLink?.('links', id, link)}
          onRemove={(id) => onRemoveLink?.('links', id)}
        />

        {(files.length > 0 || editing) && (
          <div className="flex flex-col gap-2">
            <h3 className="text-body-sm-medium text-text-primary">Attachments</h3>
            {files.length > 0 && (
              <ul className="flex flex-wrap gap-2.5">
                {files.map((file, fileIndex) => (
                  <li key={file.id}>
                    <FileAttachment
                      name={file.name}
                      kind={file.kind}
                      thumb={file.thumb}
                      domain={file.domain}
                      onClick={() => setViewing(fileIndex)}
                      onRemove={editing ? () => onRemoveFile?.(file.id) : undefined}
                    />
                  </li>
                ))}
              </ul>
            )}
            {editing && (
              <Dropzone
                multiple
                onFiles={onFiles}
                error={fileError}
                hint={fileHint}
                accept={fileAccept}
              />
            )}
          </div>
        )}
        {files.length > 0 && (
          <AttachmentViewer
            open={viewing !== null}
            index={viewing ?? 0}
            onIndexChange={setViewing}
            onClose={() => setViewing(null)}
            onDownload={onDownloadFile ? (file) => onDownloadFile(file.id) : undefined}
            files={files.map((f) => ({
              id: f.id,
              name: f.name,
              kind: f.kind ?? 'doc',
              src: f.src,
              thumb: f.thumb,
            }))}
          />
        )}
      </section>
    );
  },
);
DeliverablesCard.displayName = 'DeliverablesCard';

/** A titled list of links, and in edit mode the + and the add form under it. */
function LinkSection({
  title,
  titleIcon,
  items,
  editing,
  onAdd,
  onEdit,
  onRemove,
}: {
  title: string;
  /** The video glyph after the title (Video Links). */
  titleIcon?: boolean;
  items: readonly DeliverableLinkItem[];
  editing: boolean;
  onAdd: (links: DeliverableLinkDraft[]) => void;
  onEdit: (id: string, link: DeliverableLinkDraft) => void;
  onRemove: (id: string) => void;
}) {
  const [adding, setAdding] = React.useState(false);
  if (!editing && items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h3 className="flex items-center gap-1 text-body-sm-medium text-text-primary">
          {title}
          {titleIcon && <Icon name="video-camera" size="sm" aria-hidden="true" />}
        </h3>
        {editing && (
          <IconButton
            icon="plus"
            variant="primary"
            size="xs"
            label={`Add ${title === 'Links' ? 'link' : 'video link'}`}
            disabled={adding}
            onClick={() => setAdding(true)}
            /* 24 to look at, 40 to press. */
            className="relative before:absolute before:-inset-2"
          />
        )}
      </div>
      {editing && adding && (
        <DeliverableLinkForm
          onCancel={() => setAdding(false)}
          onSubmit={(drafts) => {
            onAdd(drafts);
            setAdding(false);
          }}
        />
      )}
      {items.length > 0 && (
        <ul className="flex flex-col divide-y divide-stroke-subtle">
          {items.map((item) => (
            <li key={item.id}>
              <DeliverableLink
                title={item.title}
                url={item.url}
                domain={item.domain}
                editable={editing}
                onSave={(link) => onEdit(item.id, link)}
                onRemove={() => onRemove(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
