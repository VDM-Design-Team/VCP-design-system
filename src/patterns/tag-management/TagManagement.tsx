import * as React from 'react';
import { cn } from '../../lib/cn';
import { ConfirmDeleteModal } from '../confirm-delete-modal';
import { DomainCard, type DomainCardItem } from '../domain-card';
import { TagManagementModal } from '../tag-management-modal';

/**
 * TagManagement — the Admin Panel tab of Settings: the lists an admin keeps (Domains, Global Tags, Domain Tags, Roles, Status, Assignee Types,
 * Projects) as a grid of `DomainCard`s, and the dialogs behind them. Built to Figma's `Tag_Management` (`921:126353`) and its three states
 * (Add New Tag, Add New Domain, Delete Domain).
 *
 * **The page passes the lists; this draws them and runs the dialogs.** A card's **Add New** opens "Add a new Tag" (or Domain), a row's pencil opens
 * the same form to rename it, and a row's bin asks before deleting. Which lists a person sees (Super Admin: Domains and Global Tags; Design Admin:
 * the rest) is the page's choice: pass only those.
 *
 * - **A list's `kind`** is `tag` (the default) or `domain`. It picks the dialog's words, and the delete question: a domain's is the system's
 *   "Are you sure you want to delete this domain?" (`TagManagementModal`); a tag's is the same `ConfirmDeleteModal` with "Tag". Figma draws only
 *   the domain's.
 * - **It is controlled.** `lists` is the truth, and `onAdd`, `onRename`, `onDelete` and `onReorder` only *ask*. A callback may return a promise: the
 *   dialog's button spins until it settles, the dialog closes when it succeeds, and it **stays open when the promise rejects**, so the page can say
 *   why (a toast, say) and the person can try again. A callback that returns nothing closes the dialog at once.
 * - **Focus is never dropped.** A closed dialog gives focus back to what opened it, and a deleted row takes that with it, so after a delete focus
 *   goes to the card's **Add New**.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface TagManagementList {
  /** Stable id, handed back with every callback: "domains", "global-tags"… */
  id: string;
  /** The card's heading. */
  title: string;
  items: DomainCardItem[];
  /** What the list holds: it picks the dialogs' words. Default `tag`. */
  kind?: 'tag' | 'domain';
  /** The add button's label. Default "Add New". */
  addLabel?: string;
}

/** What a callback may return: nothing, or a promise the dialog waits for. */
type Pending = void | Promise<unknown>;

export interface TagManagementProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  lists: readonly TagManagementList[];
  /** A name was submitted in "Add a new …". Leave it out and no card has an Add New. */
  onAdd?: (list: TagManagementList, name: string) => Pending;
  /** A new name was saved for a row. Leave it out and no row has a pencil. */
  onRename?: (list: TagManagementList, item: DomainCardItem, name: string) => Pending;
  /** A row's deletion was confirmed. Leave it out and no row has a bin. */
  onDelete?: (list: TagManagementList, item: DomainCardItem) => Pending;
  /** A list's draggable rows were moved: the whole new order of that list's ids. */
  onReorder?: (list: TagManagementList, ids: string[]) => void;
}

type Dialog =
  | { action: 'add'; listId: string }
  | { action: 'rename'; listId: string; itemId: string }
  | { action: 'delete'; listId: string; itemId: string };

export function TagManagement({ className, lists, onAdd, onRename, onDelete, onReorder, ...props }: TagManagementProps) {
  const [dialog, setDialog] = React.useState<Dialog | null>(null);
  const [busy, setBusy] = React.useState(false);
  const cards = React.useRef(new Map<string, HTMLElement | null>());
  /* The list to put focus back on once a deleted row is gone. */
  const [refocus, setRefocus] = React.useState<string | null>(null);

  const list = dialog ? lists.find((l) => l.id === dialog.listId) : undefined;
  const item = dialog && dialog.action !== 'add' ? list?.items.find((i) => i.id === dialog.itemId) : undefined;
  const open = Boolean(dialog && list && (dialog.action === 'add' || item));
  const kind = list?.kind ?? 'tag';

  /* A deleted row takes focus with it: hand it to the card's Add New, once the dialog has finished closing and given its own focus back. */
  React.useEffect(() => {
    if (!refocus || dialog) return;
    const id = window.setTimeout(() => {
      cards.current.get(refocus)?.querySelector<HTMLElement>('button')?.focus();
      setRefocus(null);
    }, 0);
    return () => window.clearTimeout(id);
  }, [refocus, dialog]);

  const run = async (work: () => Pending, after?: () => void) => {
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
    after?.();
  };

  const close = () => {
    if (!busy) setDialog(null);
  };

  return (
    <div className={cn('@container font-sans', className)} {...props}>
      <div className="grid grid-cols-1 items-stretch gap-3 @3xl:grid-cols-2 @6xl:grid-cols-3">
        {lists.map((l) => (
          <DomainCard
            key={l.id}
            ref={(node) => {
              cards.current.set(l.id, node);
            }}
            className="h-full min-w-0"
            title={l.title}
            items={l.items}
            addLabel={l.addLabel}
            onAdd={onAdd ? () => setDialog({ action: 'add', listId: l.id }) : undefined}
            onEdit={onRename ? (row) => setDialog({ action: 'rename', listId: l.id, itemId: row.id }) : undefined}
            onDelete={onDelete ? (row) => setDialog({ action: 'delete', listId: l.id, itemId: row.id }) : undefined}
            onReorder={onReorder ? (ids) => onReorder(l, ids) : undefined}
          />
        ))}
      </div>

      {/* Add or rename: the one form, with the list's noun. */}
      <TagManagementModal
        open={open && (dialog?.action === 'add' || dialog?.action === 'rename')}
        type={kind}
        mode={dialog?.action === 'rename' ? 'edit' : 'add'}
        initialName={item?.label}
        loading={busy}
        onClose={close}
        onSubmit={(name) => {
          if (!list) return;
          if (dialog?.action === 'rename' && item) void run(() => onRename?.(list, item, name));
          else void run(() => onAdd?.(list, name));
        }}
      />

      {/* Delete: a domain's question is Tag Management's own; a tag's is the system's confirmation, with the tag's wording. */}
      {kind === 'domain' ? (
        <TagManagementModal
          open={open && dialog?.action === 'delete'}
          type="delete-domain"
          initialName={item?.label}
          loading={busy}
          onClose={close}
          onConfirm={() => {
            if (list && item) void run(() => onDelete?.(list, item), () => setRefocus(list.id));
          }}
        />
      ) : (
        <ConfirmDeleteModal
          open={open && dialog?.action === 'delete'}
          itemLabel="Tag"
          itemName={item?.label ?? ''}
          title="Are you sure you want to delete this tag?"
          loading={busy}
          onClose={close}
          onConfirm={() => {
            if (list && item) void run(() => onDelete?.(list, item), () => setRefocus(list.id));
          }}
        />
      )}
    </div>
  );
}
TagManagement.displayName = 'TagManagement';
