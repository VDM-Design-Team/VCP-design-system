import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Pagination, type PaginationProps } from '../../atoms/pagination';
import { Skeleton } from '../../atoms/skeleton';
import { ChangelogItem } from '../../atoms/changelog-item';
import { EmptyState } from '../../components/empty-state';
import type { Announcement } from '../../lib/announcement';

/**
 * SystemChangelog — the page that lists every release: a "System Changelog" title over one `ChangelogItem` card per release, newest
 * first (the caller's order). Built to Figma's `Admin System Changelog` (`Settings_Changelog_List`).
 *
 * The column is centred and 896 wide at most; cards are 24 apart. **It shows what it is given**: titles and versions as they read, dates as ISO (shown dd/mm/yyyy, or the
 * person's locale), and a release's `id` keys its card. A release's `kind` draws its glyph and its `changelogUrl` makes its title a link to the changelog document.
 * `loading` shows placeholder cards under the title (one status says so); no releases show an `EmptyState`.
 *
 * **Many releases are paged** with `Pagination`, under the cards: pass `page` and `pageCount` (and `onPageChange`). It is controlled, like the tables:
 * the caller passes the releases of the page that is showing. With one page or none, no pagination shows.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
/**
 * A release is an `Announcement` (`lib/announcement`): the same record the table and the dialog use. Only `id` and `title` are needed; `kind`
 * draws the glyph, `changelogUrl` links the title, `version` and `date` (ISO) sit under it, `description` and `features` are the body.
 */
export type ChangelogRelease = Pick<Announcement, 'id' | 'title'> &
  Partial<Pick<Announcement, 'kind' | 'changelogUrl' | 'version' | 'date' | 'description' | 'features'>>;

export interface SystemChangelogProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>,
    Partial<Pick<PaginationProps, 'page' | 'pageCount' | 'itemCount' | 'pageSize' | 'pageSizeOptions' | 'onPageSizeChange'>> {
  /** The releases of the page that is showing. */
  releases: readonly ChangelogRelease[];
  /** A page was picked. Fetching it is the caller's. */
  onPageChange?: (page: number) => void;
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
  page,
  pageCount,
  onPageChange,
  itemCount,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  ...props
}: SystemChangelogProps) {
  const paged = page !== undefined && pageCount !== undefined && pageCount > 1;
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
                kind={release.kind}
                changelogUrl={release.changelogUrl}
                version={release.version}
                date={release.date}
                description={release.description}
                features={release.features}
              />
            </li>
          ))}
        </ul>
      )}
      {paged && !loading && releases.length > 0 && (
        <Pagination
          page={page}
          pageCount={pageCount}
          onChange={onPageChange}
          itemCount={itemCount}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </section>
  );
}
SystemChangelog.displayName = 'SystemChangelog';
