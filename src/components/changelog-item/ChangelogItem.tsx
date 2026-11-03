import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * ChangelogItem — one release in the System Changelog: its title and version, when it was posted, what it says, and the features and
 * updates it brought. Built to Figma's `_Changelog_Item`.
 *
 * A card (`surface.elevated`, `elevation-3`) in this order: the title (`body-lg-semibold`) with the version beside it, "Posted on …",
 * the message, then **Features/Updates:** over a bulleted list. The message and the list are left out when empty.
 *
 * - **Nothing is formatted here.** The version ("V.1.1") and the date ("01/01/2026") read as given; the card adds only "Posted on".
 * - **It is an `article`** whose heading is the title (`headingLevel`, `3` by default, so a page's own title can be the `h2`).
 * - **`date` can be a `<time>`**: pass `dateTime` ("2026-01-01") and the date is wrapped in one for machines.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface ChangelogItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  /** As it reads: "V.1.1". */
  version?: string;
  /** Already formatted: "01/01/2026". */
  date?: string;
  /** Machine-readable date for `<time>`: "2026-01-01". */
  dateTime?: string;
  /** What the release says. */
  message?: string;
  /** One bullet each, under "Features/Updates:". */
  features?: readonly string[];
  /** The title's heading level. Same look at every level. */
  headingLevel?: 2 | 3 | 4;
}

export const ChangelogItem = React.forwardRef<HTMLElement, ChangelogItemProps>(
  ({ className, title, version, date, dateTime, message, features = [], headingLevel = 3, ...props }, ref) => {
    const Heading = `h${headingLevel}` as const;
    return (
      <article
        ref={ref}
        className={cn('flex flex-col gap-4 rounded-sm bg-surface-elevated p-6 font-sans shadow-elevation-3', className)}
        {...props}
      >
        <header className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <Heading className="m-0 text-body-lg-semibold text-text-primary">{title}</Heading>
            {version && <span className="text-body-sm-regular text-text-tertiary">{version}</span>}
          </div>
          {date && (
            <p className="m-0 text-body-sm-regular text-text-tertiary">
              Posted on {dateTime ? <time dateTime={dateTime}>{date}</time> : date}
            </p>
          )}
        </header>
        {message && <p className="m-0 text-body-md-regular text-text-secondary">{message}</p>}
        {features.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="m-0 text-body-sm-semibold text-text-primary">Features/Updates:</p>
            <ul className="m-0 list-disc ps-6 text-body-md-regular text-text-secondary">
              {features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </article>
    );
  },
);
ChangelogItem.displayName = 'ChangelogItem';
