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
 * It is a real link when it has an `href`, and a button when it only has `onOpen` — the page decides how the parent opens. Pressing it only
 * asks.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface MultipartParentChipProps {
  /** The parent's reference, as it reads: "VCP-4321". */
  parentRef: string;
  /** Where the parent is. Given, the chip is a link. */
  href?: string;
  /** The chip was pressed. Given without `href`, the chip is a button. */
  onOpen?: () => void;
  className?: string;
}

const CHIP = cn(
  'inline-flex h-6 max-w-41 shrink-0 items-center gap-1 rounded-sm bg-surface-neutral-faint pl-3 pr-2 font-sans',
  'text-caption-md-medium text-text-link-default hover:underline',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
);

export function MultipartParentChip({ parentRef, href, onOpen, className }: MultipartParentChipProps) {
  const body = (
    <>
      <span className="min-w-0 truncate">Parent: {parentRef}</span>
      <Icon name="arrow-up-right" size="sm" aria-hidden="true" className="shrink-0" />
    </>
  );
  return href ? (
    <a href={href} onClick={onOpen} className={cn(CHIP, className)}>
      {body}
    </a>
  ) : (
    <button type="button" onClick={onOpen} className={cn(CHIP, className)}>
      {body}
    </button>
  );
}
MultipartParentChip.displayName = 'MultipartParentChip';
