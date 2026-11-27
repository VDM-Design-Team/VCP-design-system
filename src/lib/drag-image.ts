import type * as React from 'react';

/**
 * The picture that follows the pointer while a row is dragged: that row, and nothing else.
 *
 * Left to itself, Chrome takes the drag image from the screen around the row, and inside a card with rounded corners
 * and `overflow: hidden` (a `DomainCard`) it took in the whole section below the row as well. So a copy of the row is
 * drawn on its own, out of sight, handed to `setDragImage` at the spot where the pointer holds the row, and removed
 * once the browser has its picture.
 *
 * Call it from the row's `onDragStart`. The copy carries no ids and is hidden from assistive tech; it sits under the
 * nearest `.dark` so it keeps the theme, with the elevated surface, the card's radius and the menu shadow, so it reads
 * as the row lifted off the card.
 */
export function dragImageOfRow(event: React.DragEvent<HTMLElement>): void {
  const row = event.currentTarget;
  if (!event.dataTransfer || typeof event.dataTransfer.setDragImage !== 'function') return;
  const box = row.getBoundingClientRect();
  const copy = row.cloneNode(true) as HTMLElement;
  copy.removeAttribute('id');
  copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  copy.setAttribute('aria-hidden', 'true');
  copy.classList.add('bg-surface-elevated', 'rounded-md', 'shadow-menu');
  Object.assign(copy.style, {
    position: 'fixed',
    top: '0',
    /* Off the left of the screen by its own width twice: drawn, so the browser can take its picture, but not seen. */
    left: `${-2 * box.width}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    pointerEvents: 'none',
  });
  (row.closest<HTMLElement>('.dark') ?? document.body).appendChild(copy);
  event.dataTransfer.setDragImage(copy, event.clientX - box.left, event.clientY - box.top);
  window.setTimeout(() => copy.remove());
}
