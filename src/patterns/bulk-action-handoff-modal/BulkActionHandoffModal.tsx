import * as React from 'react';
import { Button } from '../../atoms/button';
import { Checkbox } from '../../atoms/checkbox';
import { Dropzone } from '../../atoms/dropzone';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Input } from '../../atoms/input';
import { PaginationDots } from '../../atoms/pagination-dots';
import { Select } from '../../atoms/select';
import { Banner } from '../../components/banner';
import { DateField } from '../../components/date-field';
import { isValidLinkUrl, LINK_URL_ERROR } from '../../components/deliverable-link-form';
import { Field } from '../../components/field';
import { FileAttachment, type FileAttachmentKind } from '../../components/file-attachment';
import { Modal } from '../../components/modal';
import { OVERDUE_REASONS, type HandoffDomain } from '../handoff-av-modal';

/**
 * BulkActionHandoffModal — handing several Added Values on at once. One page per Added Value, a **Handoff Date**, **Demo Links** and **Attachments** each (and, for a late one,
 * the banner, the **Overdue Reason** and **Additional Notes**), a **Publish** checkbox for Development, and `PaginationDots` between two arrow buttons to step between them. Built to Figma's
 * `Bulk_Action_Handoff_Popup` (both `Overdue` variants) and its `_Bulk_Action_Handoff_Popup_Footer`.
 *
 * - **Handoff waits until every Added Value is complete** ("All Handoff Details Filled = No" is the disabled button): each needs a **date**, a late one needs its reason, and a link that is typed must be a valid `https://` URL. Which other details are mandatory is for design to confirm.
 * - **The pager is pinned with the buttons**, not in the scroll. Cancel is
 *   always there. Stepping to an incomplete Added Value is how you finish it; the button's description says how many are still missing.
 * - **What you filled in stays while you step**: going to the next page and back loses nothing. Everything resets each time the popup opens.
 * - **`onHandoff` gets one draft per Added Value** (by `ref`), once. The page then makes the change and says so (a toast, or `BulkActionFailedModal` for the ones that failed).
 * - **Publish is Development's.** Other domains do not draw it.
 * - **A reference with an `href` is a blue link that opens the Added Value in a new tab**; without one it is plain grey text.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface BulkHandoffAV {
  /** "VCP-12345". */
  ref: string;
  title: string;
  /** Given, the reference is a blue link that opens the Added Value in a new tab. */
  href?: string;
  /** How many days late it is. Given, this Added Value's page has the banner, the reason and the notes. */
  overdueDays?: number;
  /** Files already attached to it. */
  attachments?: Array<{ name: string; thumb?: string }>;
  /** Prefills its date (ISO `yyyy-mm-dd`). It starts blank: a handoff date is chosen, not assumed. */
  defaultDate?: string;
}

export interface BulkHandoffDraft {
  date: string;
  links: string[];
  attachments: File[];
  /** Names of the files already on the Added Value that were removed here. */
  removedAttachments: string[];
  /** Development only. */
  publish: boolean;
  /** Only present when the Added Value is overdue. */
  overdueReason?: string;
  notes?: string;
}

export interface BulkActionHandoffModalProps {
  open: boolean;
  onClose: () => void;
  items: readonly BulkHandoffAV[];
  /** `development` also draws Publish. */
  domain?: HandoffDomain;
  /** The handoffs, once, by `ref`. */
  onHandoff: (drafts: Record<string, BulkHandoffDraft>) => void;
  /** Handoff is in flight: it spins and Cancel locks. */
  loading?: boolean;
}

interface Entry {
  date: string;
  links: string[];
  files: File[];
  removed: string[];
  publish: boolean;
  overdueReason: string;
  notes: string;
}

/** The card's glyph for a file the person picked. */
const kindOf = (file: File): FileAttachmentKind =>
  file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type === 'application/pdf' ? 'pdf' : file.type === 'text/csv' ? 'csv' : 'doc';

/* The neutral palette, as `Carousel`'s arrows: the colour of a control that is not an action. */
const ARROW =
  'text-neutral-outline-content-default hover:text-neutral-outline-content-hover active:text-neutral-outline-content-pressed disabled:text-neutral-outline-content-disabled';

/** A card for a file just picked. An image shows a small crop of itself, not only the glyph; the preview address is let go when the card goes. */
function PickedFile({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [thumb, setThumb] = React.useState<string>();
  React.useEffect(() => {
    if (!file.type.startsWith('image/')) return undefined;
    const url = URL.createObjectURL(file);
    setThumb(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <FileAttachment name={file.name} kind={kindOf(file)} thumb={thumb} onRemove={onRemove} />;
}

const blank = (item: BulkHandoffAV): Entry => ({ date: item.defaultDate ?? '', links: [''], files: [], removed: [], publish: false, overdueReason: '', notes: '' });

/** A link may be left empty, but one that is typed must be a valid `https://` URL. */
const linksValid = (entry: Entry) => entry.links.every((link) => link.trim() === '' || isValidLinkUrl(link));

/** What a handoff needs: a date (and, if late, why). A link that is typed must be valid. Which other details are mandatory is for design to confirm. */
const complete = (item: BulkHandoffAV, entry: Entry) => entry.date !== '' && (item.overdueDays == null || entry.overdueReason !== '') && linksValid(entry);

export function BulkActionHandoffModal({ open, onClose, items, domain = 'design-governance', onHandoff, loading }: BulkActionHandoffModalProps) {
  const [page, setPage] = React.useState(0);
  const [entries, setEntries] = React.useState<Record<string, Entry>>({});
  const missingId = React.useId();
  /* Which link boxes have been left (blurred), so a half-typed URL is not shouted at while it is typed. */
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  /* Each time it opens, start again. */
  React.useEffect(() => {
    if (!open) return;
    setPage(0);
    setTouched({});
    setEntries(Object.fromEntries(items.map((item) => [item.ref, blank(item)])));
    /* On open only. */
  }, [open]); // eslint-disable-line

  const item = items[Math.min(page, items.length - 1)];
  if (!item) return null;
  const entry = entries[item.ref] ?? blank(item);
  const patch = (change: Partial<Entry>) => setEntries((current) => ({ ...current, [item.ref]: { ...(current[item.ref] ?? blank(item)), ...change } }));

  const missing = items.filter((each) => !complete(each, entries[each.ref] ?? blank(each))).length;
  const n = items.length;

  const submit = () => {
    const drafts: Record<string, BulkHandoffDraft> = {};
    for (const each of items) {
      const e = entries[each.ref] ?? blank(each);
      drafts[each.ref] = {
        date: e.date,
        links: e.links.filter((link) => link.trim() !== ''),
        attachments: e.files,
        removedAttachments: e.removed,
        publish: domain === 'development' && e.publish,
        ...(each.overdueDays != null ? { overdueReason: e.overdueReason, notes: e.notes } : {}),
      };
    }
    onHandoff(drafts);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Handoff ${n} Added Value${n === 1 ? '' : 's'}`}
      size="md"
      showClose={false}
      footer={
        <>
          {/* Pinned with the buttons, so stepping does not scroll away. A full row of its own above them. */}
          {n > 1 && (
            <div className="flex basis-full items-center justify-center gap-2">
              <IconButton icon="caret-left" label="Previous Added Value" variant="tertiary" className={ARROW} disabled={page <= 0} onClick={() => setPage(page - 1)} />
              <PaginationDots count={n} index={page} onChange={setPage} label="Added Values" />
              <IconButton icon="caret-right" label="Next Added Value" variant="tertiary" className={ARROW} disabled={page >= n - 1} onClick={() => setPage(page + 1)} />
            </div>
          )}
          <Button variant="secondary" size="sm" type="button" disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="button" disabled={missing > 0} loading={loading} aria-describedby={missing > 0 ? missingId : undefined} onClick={submit}>
            Handoff
          </Button>
          {missing > 0 && (
            <span id={missingId} className="sr-only">
              {`${missing} of ${n} Added Values still need their handoff details.`}
            </span>
          )}
        </>
      }
    >
      <div key={item.ref} className="flex flex-col gap-6">
        <p className="m-0 flex min-w-0 gap-2 text-body-sm-regular" data-testid="handoff-av">
          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-sm text-text-link-default hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
            >
              {item.ref}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <span className="shrink-0 text-text-tertiary">{item.ref}</span>
          )}
          <span className="min-w-0 truncate text-body-sm-semibold text-text-primary" title={item.title}>
            {item.title}
          </span>
        </p>

        {item.overdueDays != null && (
          <Banner tone="warning">
            This value is <strong>Overdue</strong> by{' '}
            <strong>
              {item.overdueDays} {item.overdueDays === 1 ? 'day' : 'days'}
            </strong>
            .
          </Banner>
        )}

        <Field label="Handoff Date">
          {(c) => (
          <DateField {...c} value={entry.date || undefined} onChange={(iso) => patch({ date: iso })} placeholder="Select a date" />
          )}
        </Field>

        {item.overdueDays != null && (
          <>
            <Field label="Overdue Reason">
              <Select
                fullWidth
                options={OVERDUE_REASONS.map((reason) => ({ value: reason.value, label: `${reason.label}: ${reason.description}` }))}
                value={entry.overdueReason}
                onChange={(value) => patch({ overdueReason: value })}
                placeholder="Select a reason"
              />
            </Field>
            <Field label="Additional Notes (optional)">
              <Input fullWidth value={entry.notes} onChange={(event) => patch({ notes: event.target.value })} />
            </Field>
          </>
        )}

        <Field label="Demo Links">
          <div className="flex flex-col items-start gap-2">
            {entry.links.map((link, index) => {
              const key = `${item.ref}-${index}`;
              const bad = touched[key] && link.trim() !== '' && !isValidLinkUrl(link);
              return (
                <div key={index} className="flex w-full flex-col gap-1">
                  <div className="flex w-full items-center gap-2">
                    <Input
                      fullWidth
                      value={link}
                      aria-label={`Demo link ${index + 1}`}
                      placeholder="Paste Link Here"
                      invalid={bad}
                      aria-describedby={bad ? `${missingId}-link-${index}` : undefined}
                      onBlur={() => setTouched((current) => ({ ...current, [key]: true }))}
                      onChange={(event) => patch({ links: entry.links.map((value, i) => (i === index ? event.target.value : value)) })}
                    />
                    {/* The first box is cleared, not removed: there is always one to type in. */}
                    {entry.links.length > 1 && (
                      <IconButton
                        icon="minus-circle"
                        label={`Remove demo link ${index + 1}`}
                        onClick={() => patch({ links: entry.links.filter((_, i) => i !== index) })}
                      />
                    )}
                  </div>
                  {bad && (
                    <p id={`${missingId}-link-${index}`} role="alert" className="m-0 text-caption-md-medium text-accent-critical-outline-content-default">
                      {LINK_URL_ERROR}
                    </p>
                  )}
                </div>
              );
            })}
            <Button type="button" size="sm" iconLeft={<Icon name="plus" size="sm" />} onClick={() => patch({ links: [...entry.links, ''] })}>
              Add Another Link
            </Button>
          </div>
        </Field>

        <Field label="Attachments">
          <div className="flex flex-col gap-3">
            {/* The files already on it and the ones just picked, each a card that reacts and can be removed. */}
            {((item.attachments ?? []).some((file) => !entry.removed.includes(file.name)) || entry.files.length > 0) && (
              <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
                {(item.attachments ?? [])
                  .filter((file) => !entry.removed.includes(file.name))
                  .map((file) => (
                    <li key={`existing-${file.name}`}>
                      <FileAttachment name={file.name} thumb={file.thumb} kind="image" onRemove={() => patch({ removed: [...entry.removed, file.name] })} />
                    </li>
                  ))}
                {entry.files.map((file, fileIndex) => (
                  <li key={`new-${fileIndex}-${file.name}`}>
                    <PickedFile file={file} onRemove={() => patch({ files: entry.files.filter((_, i) => i !== fileIndex) })} />
                  </li>
                ))}
              </ul>
            )}
            <Dropzone multiple onFiles={(picked) => patch({ files: [...entry.files, ...picked] })} />
          </div>
        </Field>

        {domain === 'development' && <Checkbox label="Publish" checked={entry.publish} onChange={(checked) => patch({ publish: checked })} />}

      </div>
    </Modal>
  );
}
