import * as React from 'react';

/**
 * useSelectionToolbar — the "float over selected text" behaviour, so every editor
 * does not rewrite it. Point `containerRef` at the editor's positioned container
 * (`relative`), render the toolbar inside it with `open` and `position`, and it
 * appears centred over a selection and goes away when there is none.
 *
 * - **Shows** when a selection inside the container is finished: on `mouseup` and
 *   `keyup` (so a drag does not flicker it), placed centred over the selection and 8 above it.
 * - **Hides the moment there is no selection to point at** — a click anywhere on
 *   the page, an arrow key, a programmatic collapse. It listens to the document's
 *   `selectionchange`, not just clicks inside the editor, so it cannot be left floating
 *   over text that is no longer selected.
 *
 * It does not follow scrolling or resizing, and does no collision handling — a selection
 * near an edge can push the toolbar past it. Both are the editor's to add.
 */
export function useSelectionToolbar<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = React.useRef<T>(null);
  const [state, setState] = React.useState({ open: false, left: 0, top: 0 });

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const hasSelection = () => {
      const sel = window.getSelection();
      return !!sel && !sel.isCollapsed && sel.rangeCount > 0 && el.contains(sel.anchorNode);
    };
    const hide = () => setState((s) => (s.open ? { ...s, open: false } : s));

    const place = () => {
      if (!hasSelection()) return hide();
      const r = window.getSelection()!.getRangeAt(0).getBoundingClientRect();
      const b = el.getBoundingClientRect();
      setState({ open: true, left: r.left + r.width / 2 - b.left, top: r.top - b.top - 8 });
    };
    const onSelectionChange = () => {
      if (!hasSelection()) hide();
    };

    el.addEventListener('mouseup', place);
    el.addEventListener('keyup', place);
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      el.removeEventListener('mouseup', place);
      el.removeEventListener('keyup', place);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, []);

  return {
    containerRef,
    open: state.open,
    /** Pixels from the container's top-left; feed to `style` on an `absolute` toolbar. */
    position: { left: state.left, top: state.top },
  };
}
