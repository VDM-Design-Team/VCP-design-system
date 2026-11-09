import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Skeleton } from '../../atoms/skeleton';
import { ChangelogItem } from '../../components/changelog-item';
import { EmptyState } from '../../components/empty-state';

/**
 * SystemChangelog — the page that lists every release: a "System Changelog" title over one `ChangelogItem` card per release, newest
 * first (the caller's order). Built to Figma's `Admin System Changelog` (`Settings_Changelog_List`).
 *
 * The column is centred and 896 wide at most; cards are 24 apart. **It shows what it is given**: titles and versions as they read, dates as ISO (shown dd/mm/yyyy, or the
 * person's locale), and a release's `id` keys its card. `loading` shows placeholder cards under the title (one status says so);
 * no releases show an `EmptyState`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface ChangelogRelease {
  id: string | number;
  title: string;
  /** "v1.18.1". */
  version?: string;
  /** ISO, "2026-01-01": shown dd/mm/yyyy (or the person's locale). */
  date?: string;
  message?: string;
  features?: readonly string[];
}

export interface SystemChangelogProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  releases: readonly ChangelogRelease[];
  /** The page's title. */
  title?: string;
  /** Placeholder cards instead of `releases`, while they load. */
  loading?: boolean;
  /** What no releases say. */
  empty?: React.ReactNode;
}

export function SystemChangelog({
  className,
  releases,
  title = 'System Changelog',
  loading,
  empty,
  ...props
}: SystemChangelogProps) {
  /* Unique, so two changelogs on one page (the docs page) name their own title. */
  const titleId = React.useId();
  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={cn('mx-auto flex w-full max-w-4xl flex-col gap-6 font-sans', className)}
      {...props}
    >
      <h2 id={titleId} className="m-0 py-4 text-heading-lg-bold text-text-primary">
        {title}
      </h2>
      {loading ? (
        <>
          <span role="status" className="sr-only">
            Loading changelog
          </span>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex flex-col gap-4 rounded-sm bg-surface-elevated p-6 shadow-elevation-3">
              <Skeleton width={200} textStyle="body-lg" />
              <Skeleton width={120} textStyle="body-sm" />
              <Skeleton textStyle="body-md" />
              <Skeleton width={320} textStyle="body-md" />
            </div>
          ))}
        </>
      ) : releases.length === 0 ? (
        (empty ?? <EmptyState icon={<Icon name="megaphone" size="lg" />} title="No releases yet." />)
      ) : (
        <ul className="m-0 flex list-none flex-col gap-6 p-0">
          {releases.map((release) => (
            <li key={release.id}>
              <ChangelogItem
                title={release.title}
                version={release.version}
                date={release.date}
                message={release.message}
                features={release.features}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
SystemChangelog.displayName = 'SystemChangelog';
