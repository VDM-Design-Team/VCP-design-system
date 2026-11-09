import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Tooltip, type TooltipProps } from '../../atoms/tooltip';

/**
 * InfoHint — the small "i" beside a card's title or a stat's label that explains it in a tooltip. It is the one place the system draws that control, so every
 * card says it the same way: a 16 `info` glyph in `text.tertiary`, a real button named "About {label}", the `Tooltip` opening below it, and a 40 press area
 * around the 16 glyph (a `::after` that stretches the pointer target without moving anything), so the touch minimum holds.
 *
 * It was drawn by hand in six places, in two sizes (16 in a card title, 20 beside a label); this replaces them with the one. Sixteen is the choice: it sits at the
 * weight of the 14 to 18 text it follows.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface InfoHintProps extends Pick<TooltipProps, 'placement' | 'openDelay' | 'defaultOpen' | 'wide'> {
  /** What the hint is about: the button is named "About {label}". Say the title or label it sits beside, as plain text. */
  label: string;
  /** The explanation. Text, or light markup; never interactive (see `Tooltip`). */
  content: React.ReactNode;
  className?: string;
}

export function InfoHint({ label, content, placement = 'bottom', className, ...tooltip }: InfoHintProps) {
  return (
    <Tooltip content={content} placement={placement} {...tooltip}>
      <button
        type="button"
        aria-label={`About ${label}`}
        className={cn(
          /* A 16 glyph with a 40 press area (`after:-inset-3`: 16 + 12 + 12), the repo's pattern, as PageTitle's back control. */
          'relative grid size-4 shrink-0 place-items-center rounded-sm text-text-tertiary after:absolute after:-inset-3',
          'transition-colors hover:text-text-secondary',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
          className,
        )}
      >
        <Icon name="info" size="sm" aria-hidden="true" />
      </button>
    </Tooltip>
  );
}
