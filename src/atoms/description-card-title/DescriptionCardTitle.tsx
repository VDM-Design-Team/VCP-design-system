import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * DescriptionCardTitle — the card at the top of an Added Value page that names
 * it: the AV's reference over its title. "VCP-1234" / "Collapsible sidebar for
 * improved tables".
 *
 * Read off Figma's `Description_Card_Title` (VCP Pages - Flows, the AV pages'
 * left column): an elevated card, 16 in, 8 radius; the reference 16 regular, the
 * title 16 semibold, both `text.primary`.
 *
 * **The AV page has two headers, and this is the second.** `AVHeader` is the ID
 * row — back arrow, the reference as the page's `<h1>`, the status buttons. This
 * card carries the *title*, so it is the page's first sub-heading: an `<h2>` by
 * default. The reference here is plain text, not a second heading.
 *
 * A long title wraps; it is never cut, because it is the one place the whole
 * title is shown.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DescriptionCardTitleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The AV's reference, "VCP-1234". Shown above the title. */
  reference: string;
  /** The AV's title. */
  title: string;
  /** The title's heading level. `2` under the page's `<h1>` (`AVHeader`); `3` if it sits deeper. */
  headingLevel?: 2 | 3;
}

export const DescriptionCardTitle = React.forwardRef<HTMLDivElement, DescriptionCardTitleProps>(
  ({ className, reference, title, headingLevel = 2, ...props }, ref) => {
    const Heading = headingLevel === 3 ? 'h3' : 'h2';
    return (
      <div
        ref={ref}
        className={cn('flex flex-col rounded-md bg-surface-elevated p-4 font-sans text-text-primary', className)}
        {...props}
      >
        <p className="text-title-sm-regular">{reference}</p>
        <Heading className="text-body-md-semibold break-words">{title}</Heading>
      </div>
    );
  },
);
DescriptionCardTitle.displayName = 'DescriptionCardTitle';
