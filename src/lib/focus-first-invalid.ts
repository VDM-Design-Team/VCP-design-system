/** Whether the whole of `el` shows: inside the window, and not cut off by any ancestor that scrolls or clips. */
function fullyInView(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.top < 0 || rect.bottom > window.innerHeight) return false;
  for (let box = el.parentElement; box; box = box.parentElement) {
    if (getComputedStyle(box).overflowY === 'visible') continue;
    const edge = box.getBoundingClientRect();
    if (rect.top < edge.top || rect.bottom > edge.bottom) return false;
  }
  return true;
}

const FOCUSABLE = 'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * After a submit is blocked, take the person to the first field that needs
 * attention: scroll it into view and focus it. Call it once the errors have
 * rendered (in the effect that follows the failed submit), pass the form (or
 * the modal body) as `root`, and say it in the toast with `missingInput()`.
 *
 * "First" is document order, found by `aria-invalid="true"` — what `Field`
 * puts on its control when it has an `error`. A group that is invalid as a
 * whole (a radio group, a segmented control) is `aria-invalid` on the group, so
 * focus goes to its first enabled control. Returns the element it focused, or
 * `null` when nothing in `root` is invalid.
 *
 * It scrolls smoothly and centres the field, unless the person asks for less
 * motion, when it jumps. The field is not scrolled when it is already fully in
 * view: inside the window and inside every box that scrolls round it (a
 * dialog's body, a page's main area), since a field can be within the window
 * and still be scrolled out of its box.
 */
export function focusFirstInvalid(root: ParentNode | null | undefined): HTMLElement | null {
  const invalid = root?.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (!invalid) return null;
  const target = invalid.matches(FOCUSABLE) ? invalid : (invalid.querySelector<HTMLElement>(FOCUSABLE) ?? invalid);
  if (!fullyInView(target)) {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  }
  /* The scroll is already done (or not needed); focusing must not start another. */
  target.focus({ preventScroll: true });
  return target;
}
