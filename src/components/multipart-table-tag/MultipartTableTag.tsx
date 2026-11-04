import * as React from 'react';
import { cn } from '../../lib/cn';
import { DonutChart } from '../../atoms/donut-chart';
import { Icon } from '../../atoms/icon';
import { Tooltip } from '../../atoms/tooltip';

/**
 * MultipartTableTag — the small tag in the AV table that says an Added Value is part of a multipart set. Built to Figma's
 * `_Multipart_Table_Tag` (`Type=Child` / `Type=Parent`, each with its tooltip).
 *
 * - **A child** (`kind="child"`) shows the split glyph and **where it sits**: "1/3". Its tooltip: "Multipart Child: This part belongs to a
 *   multipart parent value and is completed independently. Parent ID: VCP-4321" (the ID when `parentRef` is given).
 * - **A parent** (`kind="parent"`) shows VCP's own parent glyph (`arrows-split-source`) and a **progress ring** (a 16 `DonutChart`, 3 thick) of how many of its parts are done. Its tooltip:
 *   "Multipart Parent: This value was split into multiple parts, status is calculated from its parts. It currently has 3 child parts."
 *
 * A white pill with a hairline (`surface.neutral.base`, `stroke.subtle`), 28 high. **It is focusable, so the keyboard gets the tooltip too**, and
 * it carries the same facts as words for a screen reader ("Multipart child, part 1 of 3" / "Multipart parent, 1 of 3 parts completed"): the
 * glyph and the ring are decoration. **Its tooltip opens to the right**, not above as Figma draws it: the tag sits in the table's first column, and `Tooltip` does no collision handling, so a centred
 * bubble above it is cut off by the table's edge.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface MultipartTableTagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** `child` (a part of a multipart set) or `parent` (the set itself). */
  kind: 'child' | 'parent';
  /** How many parts the set has. */
  total: number;
  /** `child`: which part this is, 1 of `total`. */
  position?: number;
  /** `child`: the parent's reference, for the tooltip — "VCP-4321". */
  parentRef?: string;
  /** `parent`: how many of its parts are completed. */
  completed?: number;
}

export const MultipartTableTag = React.forwardRef<HTMLSpanElement, MultipartTableTagProps>(
  ({ className, kind, total, position = 1, parentRef, completed = 0, ...props }, ref) => {
    const child = kind === 'child';
    const spoken = child
      ? `Multipart child, part ${position} of ${total}`
      : `Multipart parent, ${completed} of ${total} parts completed`;

    const tip = child ? (
      <>
        <strong className="font-semibold">Multipart Child:</strong> This part belongs to a multipart parent value and is completed
        independently.
        {parentRef && (
          <>
            <br />
            Parent ID: {parentRef}
          </>
        )}
      </>
    ) : (
      <>
        <strong className="font-semibold">Multipart Parent:</strong> This value was split into multiple parts, status is calculated from
        its parts.
        <br />
        It currently has {total} child {total === 1 ? 'part' : 'parts'}.
      </>
    );

    return (
      <Tooltip content={tip} placement="right">
        <span
          ref={ref}
          tabIndex={0}
          className={cn(
            'inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-sm border border-stroke-subtle bg-surface-neutral-base px-1.5 font-sans',
            'text-caption-md-medium text-text-secondary',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            className,
          )}
          {...props}
        >
          <span className="sr-only">{spoken}</span>
          {/* The child's glyph is Phosphor's split; the parent's is VCP's own `arrows-split-source`. */}
          <Icon name={child ? 'arrows-split' : 'arrows-split-source'} size="sm" aria-hidden="true" className="shrink-0" />
          {child ? (
            <span aria-hidden="true">
              {position}/{total}
            </span>
          ) : (
            <span aria-hidden="true" className="flex">
              <DonutChart size={16} thickness={3} label="" value={completed} max={total} />
            </span>
          )}
        </span>
      </Tooltip>
    );
  },
);
MultipartTableTag.displayName = 'MultipartTableTag';
