import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * Footer — the page's copyright line: a year and a wordmark, and nothing else.
 *
 * Read off the Figma `Page_Template` (`Footer`, 8 Sep 2026). It is genuinely
 * this small — the component's whole subtree is a `Year` text and a `Text`
 * beside it, left-aligned at the content's own 24 inset, in a 72-tall band.
 *
 * **It is an atom, not a pattern.** `docs/inventory.md` filed it under "Page
 * structure" patterns, but a pattern is two or more components composed into a
 * page section (CLAUDE.md) and this composes nothing. Corrected when it was
 * built.
 *
 * The year defaults to the current one rather than being hardcoded, because a
 * copyright line that silently goes stale is worse than one that is obviously
 * generated.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Defaults to the current year. Pass one to pin it in a test or a story. */
  year?: number;
  /** What follows the year. The design's own wording. */
  owner?: string;
}

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, year, owner = '© Valuechainplus', ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(
        'flex h-18 shrink-0 items-center gap-1 px-6 font-sans text-body-md text-text-tertiary',
        className,
      )}
      {...props}
    >
      <span>{year ?? new Date().getFullYear()}</span>
      <span>{owner}</span>
    </footer>
  ),
);
Footer.displayName = 'Footer';
