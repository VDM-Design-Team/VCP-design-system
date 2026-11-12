import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Tag } from '../../atoms/tag';

/**
 * DomainItem — one row in a Tag Management card: a name, with edit and delete
 * at the far end. Built to Figma's `_Domains_Item` (`7463:91894`), three types:
 *
 * - **default** — the name in `text.primary`, a pencil and a bin.
 * - **locked** — the name in `text.tertiary` and a "Default" `Tag` in place of
 *   the buttons. A value the product ships with: it shows in the list so
 *   nobody adds a duplicate, but it cannot be renamed, deleted or moved.
 * - **draggable** — default, plus a six-dot grip at the left to reorder it.
 *
 * **Reordering has a keyboard path, and it is deliberate.** The grip is a real
 * toggle button, not a drag-only affordance, and an arrow key alone never moves
 * a row: Space or Enter *picks it up* (`grabbed`, `aria-pressed`), ↑ / ↓ then
 * call `onMove`, Space or Enter drops it (`onGrabToggle`), and Escape — or
 * leaving the grip — cancels (`onCancel`). So a stray key cannot reorder
 * anything. The pointer path (dragging the row) is the caller's to wire through
 * the plain `draggable` / `onDrag*` attributes this row passes down to its
 * `<div>`; `DomainCard` does both and announces each step.
 *
 * The row is 40 tall, the same as the 40 `IconButton`s in it, so the buttons
 * meet the touch minimum without growing the row past the design.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type DomainItemVariant = 'default' | 'locked' | 'draggable';

export interface DomainItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The item's name. A string on purpose — it names the edit, delete and move buttons. */
  label: string;
  variant?: DomainItemVariant;
  /** The tag on a `locked` row. */
  lockedLabel?: string;
  /** Renders the pencil (default and draggable rows). */
  onEdit?: () => void;
  /** Renders the bin (default and draggable rows). */
  onDelete?: () => void;
  /** The row is picked up for a keyboard move: ↑ / ↓ call `onMove` only while this is true. */
  grabbed?: boolean;
  /** Space, Enter or a click on the grip — pick the row up, or drop it. */
  onGrabToggle?: () => void;
  /**
   * ↑ and ↓ while `grabbed`. Whether the move is possible is the caller's; the
   * grip only reports the direction.
   */
  onMove?: (direction: 'up' | 'down') => void;
  /** Escape, or focus leaving the grip, while `grabbed` — put the row back. */
  onCancel?: () => void;
  /** This row is the one being dragged — it takes a neutral fill. */
  dragging?: boolean;
  /** A dragged row is over this one — it takes the drop-target fill. */
  dropTarget?: boolean;
  /** Stable key for the grip, so a parent can return focus to it after a move. */
  handleId?: string;
}

export const DomainItem = React.forwardRef<HTMLDivElement, DomainItemProps>(
  (
    {
      className,
      label,
      variant = 'default',
      lockedLabel = 'Default',
      onEdit,
      onDelete,
      grabbed,
      onGrabToggle,
      onMove,
      onCancel,
      dragging,
      dropTarget,
      handleId,
      ...props
    },
    ref,
  ) => {
    const hintId = React.useId();
    const locked = variant === 'locked';
    const draggable = variant === 'draggable';

    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-10 items-center justify-between gap-4 bg-surface-elevated pr-7 font-sans transition-colors',
          draggable ? 'pl-5' : 'pl-7',
          (dragging || grabbed) && 'bg-surface-neutral-subtle',
          dropTarget && 'bg-surface-brand-faint',
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 items-center">
          {draggable && (
            <>
              <button
                type="button"
                data-domain-handle={handleId}
                aria-label={`Move ${label}`}
                aria-describedby={hintId}
                aria-pressed={grabbed ?? false}
                onClick={onGrabToggle}
                onBlur={() => grabbed && onCancel?.()}
                onKeyDown={(event) => {
                  if (!grabbed) return;
                  if (event.key === 'Escape') {
                    /* Cancels the move, not an enclosing dialog. */
                    event.preventDefault();
                    event.stopPropagation();
                    onCancel?.();
                    return;
                  }
                  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                  event.preventDefault();
                  onMove?.(event.key === 'ArrowUp' ? 'up' : 'down');
                }}
                className={cn(
                  '-ml-1 inline-flex size-10 shrink-0 cursor-grab items-center justify-center rounded-sm hover:text-text-primary',
                  grabbed ? 'text-text-primary' : 'text-text-tertiary',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                )}
              >
                <Icon name="dots-six-vertical" size="lg" aria-hidden="true" />
              </button>
              <span id={hintId} className="sr-only">
                Press space to pick up, then the up or down arrow keys to move, space to drop, escape to cancel
              </span>
            </>
          )}
          <span
            className={cn(
              'truncate text-title-sm-regular',
              locked ? 'text-text-tertiary' : 'text-text-primary',
            )}
          >
            {label}
          </span>
        </div>

        {locked ? (
          <Tag size="sm" tone="neutral">
            {lockedLabel}
          </Tag>
        ) : (
          (onEdit || onDelete) && (
            <div className="flex shrink-0 items-center">
              {onEdit && (
                <IconButton icon="note-pencil" label={`Edit ${label}`} onClick={onEdit} />
              )}
              {onDelete && (
                <IconButton
                  icon="trash-simple"
                  variant="critical-tertiary"
                  label={`Delete ${label}`}
                  onClick={onDelete}
                />
              )}
            </div>
          )
        )}
      </div>
    );
  },
);
DomainItem.displayName = 'DomainItem';
