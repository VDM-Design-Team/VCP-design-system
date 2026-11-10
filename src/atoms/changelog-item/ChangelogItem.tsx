import * as React from 'react';
import { cn } from '../../lib/cn';
import { CHANGELOG_KINDS, type ChangeLogKind } from '../../lib/changelog-kinds';
import { useDateFormat } from '../../lib/format-date';
import { Icon } from '../icon';

/**
 * ChangelogItem — one release in the System Changelog: its title and version, when it was posted, what it says, and the features and
 * updates it brought. Built to Figma's `_Changelog_Item`.
 *
 * A card (`surface.elevated`, `elevation-3`) in this order: the title (`body-lg-semibold`) with the version beside it, "Posted on …",
 * the message, then **Features/Updates:** over a bulleted list. The message and the list are left out when empty.
 *
 * - **The version reads as given** ("v1.18.1"). **The date is ISO** ("2026-01-01") and is shown the system's way, dd/mm/yyyy or the person's locale (`useDateFormat`), inside a `<time>`; the card adds "Posted on".
 * - **`kind`** draws the announcement's glyph before the title (a flask, a megaphone or a rocket) and says what it is to a screen reader. The glyph, colour
 *   and words come from the one owner, `src/lib/changelog-kinds.ts`, the same one `ChangeLogModal` reads.
 * - **`href`** makes the title a link to the release's changelog document. It opens in a new tab, and says so.
 * - **It is an `article`** whose heading is the title (`headingLevel`, `3` by default, so a page's own title can be the `h2`).
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface ChangelogItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  /** The kind of announcement: its glyph sits before the title. Left out, no glyph. */
  kind?: ChangeLogKind;
  /** The release's changelog document. The title becomes a link to it, opening in a new tab. */
  href?: string;
  /** As it reads: "v1.18.1". */
  version?: string;
  /** ISO, "2026-01-01": shown as dd/mm/yyyy (or the person's locale) in a `<time>`. */
  date?: string;
  /** What the release says. */
  message?: string;
  /** One bullet each, under "Features/Updates:". */
  features?: readonly string[];
  /** The title's heading level. Same look at every level. */
  headingLevel?: 2 | 3 | 4;
}

export const ChangelogItem = React.forwardRef<HTMLElement, ChangelogItemProps>(
  ({ className, title, kind, href, version, date, message, features = [], headingLevel = 3, ...props }, ref) => {
    const Heading = `h${headingLevel}` as const;
    const dates = useDateFormat();
    const kindStyle = kind ? CHANGELOG_KINDS[kind] : undefined;
    return (
      <article
        ref={ref}
        className={cn('flex flex-col gap-4 rounded-sm bg-surface-elevated p-6 font-sans shadow-elevation-3', className)}
        {...props}
      >
        <header className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            {kindStyle && (
              <>
                <Icon name={kindStyle.icon} size="md" aria-hidden="true" className={cn('shrink-0 self-center', kindStyle.className)} />
                <span className="sr-only">{kindStyle.label}</span>
              </>
            )}
            <Heading className="m-0 text-body-lg-semibold text-text-primary">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'rounded-sm text-text-link-default underline-offset-2 hover:text-text-link-hover hover:underline active:text-text-link-pressed',
                    'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                  )}
                >
                  {title}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                title
              )}
            </Heading>
            {version && <span className="text-body-sm-regular text-text-tertiary">{version}</span>}
          </div>
          {date && (
            <p className="m-0 text-body-sm-regular text-text-tertiary">
              Posted on <time dateTime={date}>{dates.format(date)}</time>
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
