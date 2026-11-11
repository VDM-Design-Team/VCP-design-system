import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Skeleton } from '../../atoms/skeleton';
import { Tag } from '../../atoms/tag';
import { DataTable, type DataTableColumn } from '../../components/data-table';
import { Menu } from '../../components/menu';
import { TableEmpty } from '../../components/table-empty';
import type { Announcement } from '../../lib/announcement';
import { CHANGELOG_KINDS } from '../../lib/changelog-kinds';
import { useDateFormat } from '../../lib/format-date';

/**
 * AnnouncementsTable — the Announcements tab's list: **New Announcement**, **View Changelog** and **Refresh** above, and a table of
 * each announcement's version, title, type, date and features, with a menu of **Edit** and **Delete** on every row. Built to Figma's
 * `Actions` row and `Announcement Table` (`Announcement_Table_Row`).
 *
 * It is `DataTable` specialised, as `UsersTable` is:
 *
 * - **Version** — plain text ("v1.18.1"); only Type is a tag, so two blue tags never sit side by side in a Feature row.
 * - **Title** — the announcement's title. It gives way as the table narrows, ending in "…".
 * - **Type** — a tag: the word (Experimental, Update, Feature) and its tone come from the one owner of the kinds, `lib/changelog-kinds`, the
 *   same one the dialog, the changelog and `ChangeLogModal` read. This table maps nothing itself.
 * - **Date** — ISO, shown the system's way (dd/mm/yyyy, or the person's locale) in a `<time>`.
 * - **Features** — what shipped, joined with commas and cut with "…" when long.
 * - **Actions** — a "More actions" menu per row, named for the announcement: **Edit** and **Delete**.
 *
 * **It is controlled and does nothing itself.** `onNew`, `onViewChangelog`, `onRefresh`, `onEdit` and `onDelete` only *ask*: opening
 * the dialog, confirming the delete (`ConfirmDeleteModal`), going to the changelog and reloading are the page's. **Refreshing** (`refreshing`)
 * puts **Refresh** in its loading state and leaves the rows where they are: a reload is not a first load, so no placeholders replace the list.
 * **After a delete the page moves focus on** (the row's menu button goes with the row): see the doc's "Focus after a delete".
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

/** A row is an `Announcement` (`lib/announcement`): the same record the dialog and the changelog take. Only the fields the table shows are needed. */
export type AnnouncementRow = Pick<Announcement, 'id' | 'title' | 'version' | 'kind' | 'date' | 'features'>;

export interface AnnouncementsTableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  rows: readonly AnnouncementRow[];
  /** + New Announcement. Opening the dialog is the page's. */
  onNew?: () => void;
  /** View Changelog. Going there is the page's. */
  onViewChangelog?: () => void;
  /** Refresh. Reloading is the page's. */
  onRefresh?: () => void;
  /** Edit, from a row's menu. */
  onEdit?: (row: AnnouncementRow) => void;
  /** Delete, from a row's menu. It only asks: confirm first. */
  onDelete?: (row: AnnouncementRow) => void;
  /** Placeholder rows instead of `rows`, while they first load. The buttons and headers stay. */
  loading?: boolean;
  /** A reload is in flight: **Refresh** shows its loading state and the rows stay on screen (no placeholders). The page clears it when the list is back. */
  refreshing?: boolean;
  /** What an empty table says. */
  empty?: React.ReactNode;
  /** The table's accessible name. */
  caption?: string;
}

export function AnnouncementsTable({
  className,
  rows,
  onNew,
  onViewChangelog,
  onRefresh,
  onEdit,
  onDelete,
  loading,
  refreshing,
  empty,
  caption = 'Announcements',
  ...props
}: AnnouncementsTableProps) {
  const dates = useDateFormat();
  const columns: DataTableColumn<AnnouncementRow>[] = [
    {
      key: 'version',
      label: 'Version',
      fit: true,
      width: '10%',
      render: (row) => <span className="whitespace-nowrap text-body-sm-medium text-text-tertiary">{row.version}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      grow: true,
      width: '34%',
      render: (row) => <span className="block truncate text-body-sm-medium text-text-tertiary">{row.title}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      fit: true,
      width: '12%',
      render: (row) => (
        <Tag size="sm" tone={CHANGELOG_KINDS[row.kind].tone}>
          {CHANGELOG_KINDS[row.kind].name}
        </Tag>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      fit: true,
      width: '12%',
      render: (row) => (
        <time dateTime={row.date} className="whitespace-nowrap text-body-sm-medium text-text-tertiary">
          {dates.format(row.date)}
        </time>
      ),
    },
    {
      key: 'features',
      label: 'Features',
      width: '26%',
      render: (row) => (
        <span className="block max-w-80 truncate text-body-sm-medium text-text-primary">{row.features.join(', ')}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      fit: true,
      width: '6%',
      render: (row) => (
        <Menu
          align="right"
          trigger={<IconButton icon="dots-three" label={`Actions for ${row.title}`} />}
          items={[
            { key: 'edit', label: 'Edit', onClick: () => onEdit?.(row) },
            { key: 'delete', label: 'Delete', tone: 'danger', icon: false, onClick: () => onDelete?.(row) },
          ]}
        />
      ),
    },
  ];

  const LOADING_CELL: Record<string, React.ReactNode> = {
    version: <Skeleton width={56} height={24} />,
    title: <Skeleton width={240} textStyle="body-sm" />,
    type: <Skeleton width={64} height={24} />,
    date: <Skeleton width={96} textStyle="body-sm" />,
    features: <Skeleton width={200} textStyle="body-sm" />,
    actions: <Skeleton circle width={32} />,
  };
  const placeholders: AnnouncementRow[] = Array.from({ length: 5 }, (_, i) => ({
    id: `loading-${i}`,
    version: '',
    title: '',
    kind: 'update',
    date: '',
    features: [],
  }));

  return (
    <div className={cn('flex flex-col gap-6 font-sans', className)} aria-busy={loading || refreshing || undefined} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Button type="button" iconLeft={<Icon name="plus" size="sm" />} onClick={() => onNew?.()}>
            New Announcement
          </Button>
          <Button
            type="button"
            variant="neutral"
            iconLeft={<Icon name="clock" size="sm" />}
            onClick={() => onViewChangelog?.()}
          >
            View Changelog
          </Button>
        </div>
        <Button
          type="button"
          variant="neutral"
          iconLeft={<Icon name="arrows-clockwise" size="sm" />}
          loading={refreshing}
          onClick={() => onRefresh?.()}
        >
          Refresh
        </Button>
      </div>

      {(loading || refreshing) && (
        <span role="status" className="sr-only">
          {loading ? 'Loading announcements' : 'Refreshing announcements'}
        </span>
      )}
      <DataTable
        caption={caption}
        columns={loading ? columns.map((column) => ({ ...column, render: () => LOADING_CELL[column.key] })) : columns}
        rows={loading ? placeholders : rows}
        empty={empty ?? <TableEmpty noun="announcements" icon="megaphone" />}
      />
    </div>
  );
}
AnnouncementsTable.displayName = 'AnnouncementsTable';
