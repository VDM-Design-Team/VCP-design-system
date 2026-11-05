import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * CopyText — a value that is not a link but is interactive: it underlines on
 * hover, and clicking it copies `text` to the clipboard and shows a "Copied"
 * bubble that goes away by itself after 800ms. A reference number, an id, an
 * email address — anything a person copies far more often than they follow.
 *
 * Read off Figma's `_AV_Table_ID` (`7247:39763`): Default, Hover (underlined)
 * and Tooltip (underlined, with the bubble) states; 14 regular in
 * `text.tertiary`, the bubble 12 regular in `text.primary` on a raised
 * surface with a shadow.
 *
 * **It is a `<button>`, not a link and not a bare span.** Nothing navigates, so
 * it must not claim to; and a clickable span is unreachable by keyboard. The
 * accessible name is the visible text, so a screen-reader user hears "VCP-12345,
 * button", and "Copied" arrives in a polite live region — the bubble is for
 * sighted users, the live region is for everyone else, and they are the same
 * element so they cannot disagree.
 *
 * **Why not `Tooltip`?** A tooltip opens on hover and focus and closes on
 * leave; this bubble opens on *click* and closes on a *timer*. Different
 * trigger, different lifetime, and a tooltip that appears after you have acted
 * is a toast, not a tooltip.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface CopyTextProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onCopy'> {
  /** What goes on the clipboard. Also the visible text unless `children` is given. */
  text: string;
  /** Visible content, when it differs from what is copied. */
  children?: React.ReactNode;
  /** The bubble's message. Default "Copied". */
  copiedLabel?: string;
  /** How long the bubble stays, in ms. Default 800, the design's. */
  duration?: number;
  /** Fires after the copy, with the text. A failed clipboard write still shows the bubble's absence — see docs. */
  onCopy?: (text: string) => void;
}

export const CopyText = React.forwardRef<HTMLButtonElement, CopyTextProps>(
  (
    { className, text, children, copiedLabel = 'Copied', duration = 800, onCopy, onClick, ...props },
    ref,
  ) => {
    const [copied, setCopied] = React.useState(false);
    const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
    React.useEffect(() => () => clearTimeout(timer.current), []);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* No clipboard (insecure context, or permission denied): say nothing
           rather than claim a copy that did not happen. */
        return;
      }
      onCopy?.(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), duration);
    };

    return (
      <span className="relative inline-flex">
        <button
          ref={ref}
          type="button"
          onClick={handleClick}
          className={cn(
            'cursor-pointer rounded-sm text-left font-sans text-body-sm-regular text-text-tertiary transition-colors',
            'hover:underline',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            className,
          )}
          {...props}
        >
          {children ?? text}
        </button>
        {/* The bubble is for sighted users and keeps its text while it fades. */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute bottom-full left-1/2 z-50 -translate-x-1/2 pb-2',
            'transition-opacity duration-150 motion-reduce:transition-none',
            copied ? 'opacity-100' : 'opacity-0',
          )}
        >
          <span className="block whitespace-nowrap rounded-sm bg-surface-elevated p-2 font-sans text-caption-md-regular text-text-primary shadow-menu">
            {copiedLabel}
          </span>
        </span>
        {/* Always mounted, so the live region exists before it has anything to say. */}
        <span role="status" className="sr-only">
          {copied ? copiedLabel : ''}
        </span>
      </span>
    );
  },
);
CopyText.displayName = 'CopyText';
