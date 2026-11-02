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
 * - **Keyboard and assistive tech** — focus a row's grip, press ↑ / ↓. Focus
 *   stays on the grip after the move, and a polite live region says where the
 *   row went ("In Progress moved to position 2 of 2").
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
    /* The grip to give focus back to once the reorder has rendered. */
    const refocus = React.useRef<string | null>(null);

    const ids = items.map((item) => item.id);
    const draggable = items.filter((item) => item.variant === 'draggable');

    React.useLayoutEffect(() => {
      if (!refocus.current) return;
      const grip = Array.from(
        cardRef.current?.querySelectorAll<HTMLElement>('[data-domain-handle]') ?? [],
      ).find((el) => el.dataset.domainHandle === refocus.current);
      refocus.current = null;
      grip?.focus();
    }, [items]);

    const move = (item: DomainCardItem, direction: 'up' | 'down') => {
      const from = ids.indexOf(item.id);
      const to = from + (direction === 'up' ? -1 : 1);
      /* Only past another draggable row — never over a locked one. */
      if (items[to]?.variant !== 'draggable') return;
      refocus.current = item.id;
      setAnnouncement(
        `${item.label} moved to position ${draggable.findIndex((d) => d.id === items[to].id) + 1} of ${draggable.length}`,
      );
      onReorder?.(moved(ids, from, to));
    };

    const drop = (target: DomainCardItem) => {
      const dragged = items.find((item) => item.id === dragId);
      setDragId(null);
      setOverId(null);
      if (!dragged || dragged.id === target.id || target.variant !== 'draggable') return;
      const from = ids.indexOf(dragged.id);
      const to = ids.indexOf(target.id);
      setAnnouncement(
        `${dragged.label} moved to position ${draggable.findIndex((d) => d.id === target.id) + 1} of ${draggable.length}`,
      );
      onReorder?.(moved(ids, from, to));
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
          {items.map((item) => {
            const variant = item.variant ?? 'default';
            const canDrag = variant === 'draggable';
            const position = draggable.findIndex((d) => d.id === item.id);
            return (
              <div role="listitem" key={item.id} className="contents">
                <DomainItem
                  label={item.label}
                  variant={variant}
                  handleId={item.id}
                  onEdit={onEdit ? () => onEdit(item) : undefined}
                  onDelete={onDelete ? () => onDelete(item) : undefined}
                  onMove={canDrag ? (direction) => move(item, direction) : undefined}
                  dragging={dragId === item.id}
                  dropTarget={overId === item.id && dragId !== item.id}
                  draggable={canDrag && position >= 0 && draggable.length > 1 ? true : undefined}
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
                          drop(item);
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
