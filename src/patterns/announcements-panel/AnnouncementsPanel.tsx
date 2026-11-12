import * as React from 'react';
import { cn } from '../../lib/cn';
import type { Announcement } from '../../lib/announcement';
import { AnnouncementModal, type AnnouncementDraft, type AnnouncementModalProps } from '../announcement-modal';
import { AnnouncementsOverview, type AnnouncementsOverviewProps } from '../announcements-overview';
import { AnnouncementsTable, type AnnouncementsTableProps } from '../announcements-table';
import { ConfirmDeleteModal } from '../confirm-delete-modal';

/**
 * AnnouncementsPanel — the Announcements tab of Settings: the overview (the total, the latest version, the last update), the list, and the dialogs behind it. Built to Figma's
 * `Announcements` tab, `Create Announcement` and its delete question.
 *
 * **The page passes the announcements; this draws them and runs the dialogs**, as `TagManagement` does for the Admin Panel:
 *
 * - **New Announcement** opens "Create Announcement" (`AnnouncementModal`); a row's **Edit** opens it filled ("Edit Announcement").
 * - **Delete** asks first (`ConfirmDeleteModal`, with the announcement's title): nothing is deleted until it is confirmed.
 * - **View Changelog** and **Refresh** only *ask* (`onViewChangelog`, `onRefresh`): going to the System Changelog is the page's, as is reloading.
 *
 * All five callbacks are required: the table always draws its buttons and its row menu, so a panel without them would show controls that do nothing. A page that must only read the list uses `AnnouncementsTable` on its own.
 *
 * **It is controlled.** `announcements` is the truth, and `onCreate`, `onUpdate` and `onDelete` only *ask*. A callback may return a promise: the dialog's button spins until it
 * settles, the dialog closes when it succeeds and **stays open when the promise rejects**, so the page can say why (`errors` for the form's fields, a toast for the rest) and the person
 * can try again. A callback that returns nothing closes the dialog at once. The page also does the toast on success ("Announcement deleted"): this holds no toasts of its own.
 *
 * **Focus is never dropped.** A closed dialog gives focus back to what opened it. A deleted row takes its menu button with it, so after a delete focus goes, as the table's docs say, to the next
 * row's menu button, or the previous one's if it was the last, or to **New Announcement** when the list is empty.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

/** What a callback may return: nothing, or a promise the dialog waits for. */
type Pending = void | Promise<unknown>;

export interface AnnouncementsPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The list, newest first as the page wants it. Whole records: Edit starts the form from them. */
  announcements: readonly Announcement[];
  /** The overview's figures (`total`, `latestVersion`, `lastUpdated`). They are the page's: a list may be paged, so the total is not always the rows. */
  overview: AnnouncementsOverviewProps;
  /** The create form was submitted. */
  onCreate: (draft: AnnouncementDraft) => Pending;
  /** The edit form was submitted. */
  onUpdate: (announcement: Announcement, draft: AnnouncementDraft) => Pending;
  /** A deletion was confirmed. */
  onDelete: (announcement: Announcement) => Pending;
  /** View Changelog was pressed: going there is the page's. */
  onViewChangelog: () => void;
  /** Refresh was pressed. */
  onRefresh: () => void;
  /** Placeholder rows instead of the list, while it loads. */
  loading?: boolean;
  /** A reload: Refresh spins and the rows stay. The page clears it when the list is back. */
  refreshing?: boolean;
  /** What an empty list says. */
  empty?: AnnouncementsTableProps['empty'];
  /** The table's accessible name. */
  caption?: string;
  /** What the server said was wrong with the form, by field. */
  errors?: AnnouncementModalProps['errors'];
}

type Dialog = { action: 'new' } | { action: 'edit'; id: Announcement['id'] } | { action: 'delete'; id: Announcement['id'] };

export function AnnouncementsPanel({
  className,
  announcements,
  overview,
  onCreate,
  onUpdate,
  onDelete,
  onViewChangelog,
  onRefresh,
  loading,
  refreshing,
  empty,
  caption,
  errors,
  ...props
}: AnnouncementsPanelProps) {
  const root = React.useRef<HTMLDivElement>(null);
  const [dialog, setDialog] = React.useState<Dialog | null>(null);
  const [busy, setBusy] = React.useState(false);
  /* After a confirmed delete: where the row was, so focus can go to the one that took its place once the page has removed it. */
  const [after, setAfter] = React.useState<{ id: Announcement['id']; index: number } | null>(null);

  const target = dialog && dialog.action !== 'new' ? announcements.find((a) => a.id === dialog.id) : undefined;
  const open = Boolean(dialog && (dialog.action === 'new' || target));

  React.useEffect(() => {
    if (!after || dialog) return;
    if (announcements.some((a) => a.id === after.id)) return; // the page has not removed it yet
    const id = window.setTimeout(() => {
      const menus = Array.from(root.current?.querySelectorAll<HTMLElement>('tbody button[aria-haspopup]') ?? []);
      const next = menus[Math.min(after.index, menus.length - 1)];
      (next ?? Array.from(root.current?.querySelectorAll<HTMLElement>('button') ?? []).find((b) => /New Announcement/.test(b.textContent ?? '')))?.focus();
      setAfter(null);
    }, 0);
    return () => window.clearTimeout(id);
  }, [after, dialog, announcements]);

  const run = async (work: () => Pending, then?: () => void) => {
    setBusy(true);
    try {
      await work();
    } catch {
      /* The page says why (it owns the request); the dialog stays so the person can try again. */
      return;
    } finally {
      setBusy(false);
    }
    setDialog(null);
    then?.();
  };

  const close = () => {
    if (!busy) setDialog(null);
  };

  return (
    <div ref={root} className={cn('flex min-w-0 flex-col gap-4 font-sans', className)} {...props}>
      <AnnouncementsOverview {...overview} />
      <AnnouncementsTable
        rows={announcements}
        loading={loading}
        refreshing={refreshing}
        empty={empty}
        caption={caption}
        onNew={() => setDialog({ action: 'new' })}
        onEdit={(row) => setDialog({ action: 'edit', id: row.id })}
        onDelete={(row) => setDialog({ action: 'delete', id: row.id })}
        onViewChangelog={onViewChangelog}
        onRefresh={onRefresh}
      />

      {/* Create or edit: the one form. */}
      <AnnouncementModal
        open={open && (dialog?.action === 'new' || dialog?.action === 'edit')}
        mode={dialog?.action === 'edit' ? 'edit' : 'new'}
        initial={target}
        latestVersion={overview.latestVersion}
        submitting={busy}
        errors={errors}
        onClose={close}
        onSubmit={(draft) => {
          if (dialog?.action === 'edit' && target) void run(() => onUpdate(target, draft));
          else void run(() => onCreate(draft));
        }}
      />

      {/* Delete: ask first. Nothing goes until it is confirmed. */}
      <ConfirmDeleteModal
        open={open && dialog?.action === 'delete'}
        itemLabel="Announcement"
        itemName={target?.title ?? ''}
        title="Are you sure you want to delete this announcement?"
        loading={busy}
        onClose={close}
        onConfirm={() => {
          if (target) {
            const index = announcements.findIndex((a) => a.id === target.id);
            void run(() => onDelete(target), () => setAfter({ id: target.id, index }));
          }
        }}
      />
    </div>
  );
}
AnnouncementsPanel.displayName = 'AnnouncementsPanel';
