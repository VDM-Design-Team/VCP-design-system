import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { DomainItem, type DomainItemVariant } from '../../components/domain-item';

/**
 * DomainCard — one list in Tag Management: a titled card with an "Add New"
 * button and a column of `DomainItem` rows. Built to Figma's `Domain_Card`
 * (`7464:93369`) on `_Domain_Card_Base`.
 *
 * The seven cards in the design are one component: Domains, Global Tags,
 * Domain Tags, Roles, Status, Assignee Types, Projects. They differ only in
 * title and rows, so both are props — and which cards a user *sees* (Super
 * Admin: Domains and Global Tags; Design Admin: the rest) is the page's
 * decision, not a prop here.
 *
 * **Reordering.** Rows with `variant: 'draggable'` can be moved, among
 * themselves — a locked row never moves, and a draggable row never passes one.
 * Two ways in, same result (`onReorder` gets the whole new order of ids):
 *
 * - **Keyboard and assistive tech** — a move is deliberate, so an arrow key
 *   alone does nothing. Focus the grip and press Space or Enter to *pick the
 *   row up*, ↑ / ↓ to move it, Space or Enter to *drop* it (that is when
 *   `onReorder` fires), Escape — or tabbing away — to cancel and put it back.
 *   Focus stays on the grip throughout, and a polite live region says each
 *   step ("In Progress moved to position 2 of 2").
 * - **Pointer** — drag the row onto another draggable row.
 *
 * The card never reorders itself: it asks, you own `items`.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DomainCardItem {
  /** Stable id — the reorder callback and focus return key on it. */
  id: string;
  label: string;
  variant?: DomainItemVariant;
}

export interface DomainCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The card's heading — "Domains", "Roles", "Status"… */
  title: string;
  items: DomainCardItem[];
  /** "Add New" was pressed. Omit it and the button is not drawn. */
  onAdd?: () => void;
  /** Label of the add button. */
  addLabel?: string;
  onEdit?: (item: DomainCardItem) => void;
  onDelete?: (item: DomainCardItem) => void;
  /** The new order, as ids, after a move. You own `items`. */
  onReorder?: (ids: string[]) => void;
}

/** Moves `from` to `to` in a copy of `ids`. */
function moved(ids: string[], from: number, to: number): string[] {
  const next = ids.slice();
  const [id] = next.splice(from, 1);
  next.splice(to, 0, id);
  return next;
}

export const DomainCard = React.forwardRef<HTMLElement, DomainCardProps>(
  (
    { className, title, items, onAdd, addLabel = 'Add New', onEdit, onDelete, onReorder, ...props },
    ref,
  ) => {
    const headingId = React.useId();
    const cardRef = React.useRef<HTMLElement | null>(null);
    const [announcement, setAnnouncement] = React.useState('');
    const [dragId, setDragId] = React.useState<string | null>(null);
    const [overId, setOverId] = React.useState<string | null>(null);
    /* A keyboard move in progress: the row picked up, and the order as it
       would be if dropped now. `onReorder` hears nothing until the drop. */
    const [grabId, setGrabId] = React.useState<string | null>(null);
    const [draft, setDraft] = React.useState<string[] | null>(null);
    /* The grip to give focus back to once a reorder has rendered. Moving a
       node can blur it, so a pending refocus also means "that blur is ours". */
    const refocus = React.useRef<string | null>(null);

    const byId = new Map(items.map((item) => [item.id, item]));
    const realIds = items.map((item) => item.id);
    const ids = draft ?? realIds;
    const rows = ids.map((id) => byId.get(id)!).filter(Boolean);
    const draggable = rows.filter((item) => item.variant === 'draggable');
    const positionOf = (id: string) => draggable.findIndex((d) => d.id === id) + 1;

    React.useLayoutEffect(() => {
      if (!refocus.current) return;
      const grip = Array.from(
        cardRef.current?.querySelectorAll<HTMLElement>('[data-domain-handle]') ?? [],
      ).find((el) => el.dataset.domainHandle === refocus.current);
      refocus.current = null;
      grip?.focus();
    }, [ids.join('|')]);

    const grab = (item: DomainCardItem) => {
      setGrabId(item.id);
      setDraft(realIds);
      setAnnouncement(
        `${item.label} picked up, position ${positionOf(item.id)} of ${draggable.length}. ` +
          'Use the up and down arrow keys to move it, space to drop it, escape to cancel.',
      );
    };

    const drop = (item: DomainCardItem) => {
      const changed = draft !== null && draft.join('|') !== realIds.join('|');
      const next = draft;
      setGrabId(null);
      setDraft(null);
      setAnnouncement(`${item.label} dropped at position ${positionOf(item.id)} of ${draggable.length}`);
      if (changed && next) onReorder?.(next);
    };

    const cancel = (item: DomainCardItem) => {
      /* The blur from our own refocus is not the user leaving. */
      if (refocus.current) return;
      setGrabId(null);
      setDraft(null);
      setAnnouncement(`Move cancelled, ${item.label} is back at its original position`);
    };

    const move = (item: DomainCardItem, direction: 'up' | 'down') => {
      const from = ids.indexOf(item.id);
      const to = from + (direction === 'up' ? -1 : 1);
      /* Only past another draggable row — never over a locked one. */
      if (byId.get(ids[to])?.variant !== 'draggable') return;
      refocus.current = item.id;
      const next = moved(ids, from, to);
      setDraft(next);
      const among = next.map((id) => byId.get(id)!).filter((row) => row.variant === 'draggable');
      setAnnouncement(`${item.label} moved to position ${among.indexOf(item) + 1} of ${among.length}`);
    };

    const dropOn = (target: DomainCardItem) => {
      const dragged = byId.get(dragId ?? '');
      setDragId(null);
      setOverId(null);
      if (!dragged || dragged.id === target.id || target.variant !== 'draggable') return;
      setAnnouncement(`${dragged.label} moved to position ${positionOf(target.id)} of ${draggable.length}`);
      onReorder?.(moved(realIds, realIds.indexOf(dragged.id), realIds.indexOf(target.id)));
    };

    return (
      <section
        ref={(node) => {
          cardRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        aria-labelledby={headingId}
        className={cn('overflow-hidden rounded-md bg-surface-elevated font-sans', className)}
        {...props}
      >
        <header className="flex items-center justify-between gap-4 border-b border-stroke-default bg-surface-elevated px-7 py-5">
          <h2 id={headingId} className="text-title-sm-semibold text-text-primary">
            {title}
          </h2>
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              {addLabel}
            </Button>
          )}
        </header>

        <div role="list" className="flex flex-col bg-surface-elevated py-4">
          {rows.map((item) => {
            const variant = item.variant ?? 'default';
            const canDrag = variant === 'draggable';
            return (
              <div role="listitem" key={item.id} className="contents">
                <DomainItem
                  label={item.label}
                  variant={variant}
                  handleId={item.id}
                  onEdit={onEdit ? () => onEdit(item) : undefined}
                  onDelete={onDelete ? () => onDelete(item) : undefined}
                  grabbed={grabId === item.id}
                  onGrabToggle={
                    canDrag ? () => (grabId === item.id ? drop(item) : grab(item)) : undefined
                  }
                  onMove={canDrag ? (direction) => move(item, direction) : undefined}
                  onCancel={canDrag ? () => cancel(item) : undefined}
                  dragging={dragId === item.id}
                  dropTarget={overId === item.id && dragId !== item.id}
                  draggable={canDrag && draggable.length > 1 && !grabId ? true : undefined}
                  onDragStart={canDrag ? () => setDragId(item.id) : undefined}
                  onDragEnd={canDrag ? () => (setDragId(null), setOverId(null)) : undefined}
                  onDragOver={
                    dragId && canDrag
                      ? (event) => {
                          event.preventDefault();
                          setOverId(item.id);
                        }
                      : undefined
                  }
                  onDrop={
                    dragId && canDrag
                      ? (event) => {
                          event.preventDefault();
                          dropOn(item);
                        }
                      : undefined
                  }
                />
              </div>
            );
          })}
        </div>

        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>
      </section>
    );
  },
);
DomainCard.displayName = 'DomainCard';
