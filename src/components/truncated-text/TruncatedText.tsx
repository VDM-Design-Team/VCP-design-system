import * as React from 'react';
import { cn } from '../../lib/cn';
import { Tooltip } from '../../atoms/tooltip';

/**
 * TruncatedText — one line of text that is cut with "…" when it does not fit, and **says the whole of it on hover and focus when (and only when) it has been cut**. For the name in a table's
 * first column — an Added Value's title, a holiday's name, a task — which is almost always the longest thing in its row.
 *
 * - **The tooltip is the system's `Tooltip`**, not the browser's `title` (slow, unstyled, shown even for text that fits, and no use from the keyboard). It is off while the text fits, so a short name
 *   has nothing to say about itself.
 * - **It is a tab stop only while it is cut**: a keyboard user reaches the full name the way a pointer does, and a name that fits adds no stop to the row.
 * - **The full text is always in the page**, since the cut is only CSS — a screen reader reads the whole name, so the tooltip does not describe it a second time.
 * - It measures itself: when its box is resized (a narrower table) or its text changes.
 *
 * `useIsTruncated` is the same measurement for a case where the text lives in something else — a button that opens the row — which wraps its own `Tooltip`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */

/** Is the text in `ref`'s element wider than its box? Re-measured when the box is resized and when `deps` change. */
export function useIsTruncated<T extends HTMLElement>(ref: React.RefObject<T | null>, deps: React.DependencyList = []): boolean {
  const [truncated, setTruncated] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setTruncated(el.scrollWidth > el.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [ref, ...deps]);
  return truncated;
}

export interface TruncatedTextProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The text. A string, because the tooltip says exactly this. */
  children: string;
}

export const TruncatedText = React.forwardRef<HTMLSpanElement, TruncatedTextProps>(({ className, children, ...props }, ref) => {
  const inner = React.useRef<HTMLSpanElement | null>(null);
  const truncated = useIsTruncated(inner, [children]);
  return (
    <Tooltip content={children} describe={false} disabled={!truncated} className="min-w-0 max-w-full">
      <span
        {...props}
        ref={(node) => {
          inner.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        tabIndex={truncated ? 0 : undefined}
        className={cn(
          'block min-w-0 max-w-full truncate',
          truncated && 'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
          className,
        )}
      >
        {children}
      </span>
    </Tooltip>
  );
});
TruncatedText.displayName = 'TruncatedText';
