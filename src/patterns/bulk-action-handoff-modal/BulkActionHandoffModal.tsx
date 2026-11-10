import * as React from 'react';
import { cn } from '../../lib/cn';
import { Checkbox } from '../../atoms/checkbox';
import { IconButton } from '../../atoms/icon-button';
import { PaginationDots } from '../../atoms/pagination-dots';
import { Modal, ModalCancel, ModalConfirm } from '../../components/modal';
import { HandoffForm, blankHandoffEntry, isHandoffComplete, type HandoffAttachment, type HandoffEntry } from '../handoff-form';
import type { HandoffDomain } from '../handoff-av-modal';

/**
 * BulkActionHandoffModal — handing several Added Values on at once. One page per Added Value, each the shared **`HandoffForm`** (a **Handoff Date**, **Demo Links** and **Attachments** and, for a late one,
 * the banner, the **Overdue Reason** and **Additional Notes**), a **Publish** checkbox for Development, and `PaginationDots` between two arrow buttons to step between them. Built to Figma's
 * `Bulk_Action_Handoff_Popup` (both `Overdue` variants) and its `_Bulk_Action_Handoff_Popup_Footer`.
 *
 * - **The form is the one `HandoffAVModal` draws**, so a single handoff and a bulk one ask for the same things: a date, chosen from the calendar, is required; a late one must say why; links, files and notes are optional; a link that is typed must be a valid `https://` address.
 * - **Handoff waits until every Added Value is complete** ("All Handoff Details Filled = No" is the disabled button), by `isHandoffComplete`. The pager is pinned with the buttons, not in the scroll; stepping to an incomplete Added Value is how you finish it, and the button's description says how many are still missing.
 * - **What you filled in stays while you step**: every page stays mounted (the others are hidden), so going to the next and back loses nothing. Everything resets each time the popup opens.
 * - **The arrows never drop focus.** At the first or last Added Value the arrow you pressed is `aria-disabled`, not `disabled`, so it keeps focus instead of sending it to the page.
 * - **`onHandoff` gets one draft per Added Value** (by `ref`), once. The page then makes the change and says so (a toast, or `BulkActionFailedModal` for the ones that failed).
 * - **Publish is Development's.** Other domains do not draw it.
 * - **A reference with an `href` is a blue link that opens the Added Value in a new tab**; without one it is plain grey text.
 * - **The popup is the system's `lg` (640)**, not Figma's 592.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface BulkHandoffAV {
  /** "VCP-12345". */
  ref: string;
  title: string;
  /** Given, the reference is a blue link that opens the Added Value in a new tab. */
  href?: string;
  /** How many days late it is. Given, this Added Value's page has the banner, the reason and the notes. */
  overdueDays?: number;
  /** Files already attached to it: each a card that previews on click and can be removed. */
  attachments?: readonly HandoffAttachment[];
  /** Prefills its date (ISO `yyyy-mm-dd`). It starts blank: a handoff date is chosen, not assumed. */
  defaultDate?: string;
}

export interface BulkHandoffDraft {
  date: string;
  links: string[];
  attachments: File[];
  /** The ids (the names, when none was given) of the files already on the Added Value that were removed here. */
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
  /** Handoff is in flight: it spins, Cancel locks, and nothing closes the dialog until it is done. */
  loading?: boolean;
}

export function BulkActionHandoffModal({ open, onClose, items, domain = 'design-governance', onHandoff, loading }: BulkActionHandoffModalProps) {
  const [page, setPage] = React.useState(0);
  const [entries, setEntries] = React.useState<Record<string, HandoffEntry>>({});
  const [publish, setPublish] = React.useState<Record<string, boolean>>({});
  const missingId = React.useId();

  /* Each time it opens, start again (the forms start again with it: they are mounted only while it is open). */
  React.useEffect(() => {
    if (!open) return;
    setPage(0);
    setEntries({});
    setPublish({});
    /* On open only. */
  }, [open]); // eslint-disable-line

  const n = items.length;
  const current = Math.min(page, Math.max(n - 1, 0));
  const entryOf = (each: BulkHandoffAV) => entries[each.ref] ?? blankHandoffEntry(each.defaultDate);
  const missing = items.filter((each) => !isHandoffComplete(each.overdueDays != null, entryOf(each))).length;

  const submit = () => {
    const drafts: Record<string, BulkHandoffDraft> = {};
    for (const each of items) {
      const e = entryOf(each);
      drafts[each.ref] = {
        date: e.date,
        links: e.links.filter((link) => link.trim() !== ''),
        attachments: e.files,
        removedAttachments: e.removed,
        publish: domain === 'development' && Boolean(publish[each.ref]),
        ...(each.overdueDays != null ? { overdueReason: e.overdueReason, notes: e.notes } : {}),
      };
    }
    onHandoff(drafts);
  };

  if (n === 0) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Handoff ${n} Added Value${n === 1 ? '' : 's'}`}
      size="lg"
      showClose={false}
      footer={
        <>
          {/* Pinned with the buttons, so stepping does not scroll away. A full row of its own above them. */}
          {n > 1 && (
            <div className="flex basis-full items-center justify-center gap-2">
              {/* `aria-disabled`, not `disabled`: at the end the arrow you pressed keeps focus instead of dropping it to the page. */}
              <IconButton
                icon="caret-left"
                label="Previous Added Value"
                variant="neutral-text"
                aria-disabled={current <= 0 || undefined}
                onClick={() => current > 0 && setPage(current - 1)}
              />
              <PaginationDots count={n} index={current} onChange={setPage} label="Added Values" />
              <IconButton
                icon="caret-right"
                label="Next Added Value"
                variant="neutral-text"
                aria-disabled={current >= n - 1 || undefined}
                onClick={() => current < n - 1 && setPage(current + 1)}
              />
            </div>
          )}
          <ModalCancel disabled={loading} />
          <ModalConfirm disabled={missing > 0} loading={loading} aria-describedby={missing > 0 ? missingId : undefined} onClick={submit}>
            Handoff
          </ModalConfirm>
          {missing > 0 && (
            <span id={missingId} className="sr-only">
              {`${missing} of ${n} Added Values still need their handoff details.`}
            </span>
          )}
        </>
      }
    >
      {items.map((item, index) => (
        <div key={item.ref} hidden={index !== current} className={cn('flex-col gap-6', index === current ? 'flex' : 'hidden')}>
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
          <HandoffForm
            overdueDays={item.overdueDays}
            attachments={item.attachments}
            defaultDate={item.defaultDate}
            onChange={(entry) => setEntries((now) => ({ ...now, [item.ref]: entry }))}
          />
          {domain === 'development' && (
            <Checkbox label="Publish" checked={Boolean(publish[item.ref])} onChange={(checked) => setPublish((now) => ({ ...now, [item.ref]: checked }))} />
          )}
        </div>
      ))}
    </Modal>
  );
}
BulkActionHandoffModal.displayName = 'BulkActionHandoffModal';
