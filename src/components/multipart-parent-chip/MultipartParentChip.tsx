import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';

/**
 * MultipartParentChip — on a child part's row, a small link to its parent: "Parent: VCP-4321 ↗". Built to Figma's
 * `Child_Multipart_Parent_Reference_Chip` (`Default` / `Hover`).
 *
 * `surface.neutral.faint`, 24 high, the label in the link colour (`text.link.default`, `caption-md-medium`) with an arrow, and **underlined on
 * hover**. It is **164 wide at most: a long reference is cut with "…"** (the whole text is still the accessible name).
 *
 * **It opens the parent in a new tab** when it has an `href` (a real link, with `target="_blank"`, and it says so to a screen reader), and keeps its ↗ because the arrow is then true. With only `onOpen` it is a
 * button — the page decides how the parent opens, and pressing it only asks. **With neither there is nowhere to go, so it is plain text** ("Parent: VCP-4321"), not a focusable control that does nothing, and
 * with no arrow.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface MultipartParentChipProps {
  /** The parent's reference, as it reads: "VCP-4321". */
  parentRef: string;
  /** Where the parent is. Given, the chip is a link that opens it in a new tab. */
  href?: string;
  /** The chip was pressed. Given without `href`, the chip is a button; given with it, it is called as the link opens. */
  onOpen?: () => void;
  className?: string;
}

const CHIP = cn(
  'inline-flex h-6 max-w-41 shrink-0 items-center gap-1 rounded-sm bg-surface-neutral-faint pl-3 pr-2 font-sans',
  'text-caption-md-medium text-text-link-default hover:underline',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
);

/* Where there is nowhere to go the chip is only text: no link colour, no underline, no focus stop. */
const PLAIN = cn(
  'inline-flex h-6 max-w-41 shrink-0 items-center rounded-sm bg-surface-neutral-faint px-3 font-sans',
  'text-caption-md-medium text-text-tertiary',
);

export function MultipartParentChip({ parentRef, href, onOpen, className }: MultipartParentChipProps) {
  const arrow = <Icon name="arrow-up-right" size="sm" aria-hidden="true" className="shrink-0" />;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onOpen} className={cn(CHIP, className)}>
        <span className="min-w-0 truncate">Parent: {parentRef}</span>
        <span className="sr-only"> (opens in a new tab)</span>
        {arrow}
      </a>
    );
  }
  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} className={cn(CHIP, className)}>
        <span className="min-w-0 truncate">Parent: {parentRef}</span>
        {arrow}
      </button>
    );
  }
  return <span className={cn(PLAIN, className)}><span className="min-w-0 truncate">Parent: {parentRef}</span></span>;
}
MultipartParentChip.displayName = 'MultipartParentChip';
