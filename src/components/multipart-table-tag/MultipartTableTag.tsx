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
 * A white pill with a hairline (`surface.neutral.base`, `stroke.subtle`), **24 high**, with 12 type and 16 glyphs. **This is deliberately smaller than Figma's 28 pill, and the AV table
 * deliberately does not use Figma's two-column cell.** At 24 it is the same height as the domain tag (`Tag` `sm`) it sits beside, so the tag, the domain, the Parent chip and the counts all
 * line up on **one line of metadata** under the title. Figma's 28 pill does not fit that line, so Figma stacks it under the reference and starts the other metadata under the title: a long reference
 * then pushes all the metadata far to the right and leaves a wide gap. Keep it 24; do not "fix" it back to Figma (decided by design, 17 Nov 2026, reversing the 10 Nov change on #275).
 * **It is focusable, so the keyboard gets the tooltip too**, and it carries the same facts as words for a screen reader ("Multipart child, part 1 of 3" / "Multipart parent, 1 of 3 parts completed"): the
 * glyph and the ring are decoration. **Its tooltip opens above**, as Figma draws it: `Tooltip` flips and slides to stay on screen, so the table's edge no longer cuts it off.
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
      <Tooltip content={tip} placement="top">
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
