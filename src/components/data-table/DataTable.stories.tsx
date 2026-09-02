import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable, type DataTableColumn, type DataTableSort } from './DataTable';
import { Badge } from '../badge';
import { Avatar } from '../avatar';
import { EmptyState } from '../empty-state';
import { Button } from '../button';
import { Icon } from '../icon';

interface Claim {
  id: string;
  supplier: string;
  owner: string;
  status: 'active' | 'pending' | 'closed';
  points: number;
  updated: string;
}

const CLAIMS: Claim[] = [
  { id: 'AV-2041', supplier: 'Nordfjord Components', owner: 'Eve Kestrel', status: 'active', points: 34, updated: '28 Aug 2026' },
  { id: 'AV-2037', supplier: 'Baltika Fasteners', owner: 'Marvin Ode', status: 'pending', points: 12, updated: '27 Aug 2026' },
  { id: 'AV-2033', supplier: 'Helix Tooling', owner: 'Ali Reza', status: 'active', points: 21, updated: '26 Aug 2026' },
  { id: 'AV-2028', supplier: 'Nordfjord Components', owner: 'Eve Kestrel', status: 'closed', points: 40, updated: '21 Aug 2026' },
  { id: 'AV-2019', supplier: 'Verde Logistics', owner: 'Marvin Ode', status: 'pending', points: 8, updated: '19 Aug 2026' },
];

const STATUS_TONE = { active: 'success', pending: 'warning', closed: 'neutral' } as const;

const COLUMNS: DataTableColumn<Claim>[] = [
  {
    key: 'id',
    label: 'Reference',
    width: '120px',
    sortable: true,
    /* The row's action lives in a cell — a real link, reachable by keyboard.
       There is deliberately no onRowClick; see the docs. */
    render: (r) => (
      <a
        href={`#${r.id}`}
        className="rounded-sm text-label-lg text-text-link-default hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
      >
        {r.id}
      </a>
    ),
  },
  { key: 'supplier', label: 'Supplier', sortable: true },
  { key: 'owner', label: 'Owner' },
  {
    key: 'status',
    label: 'Status',
    width: '110px',
    render: (r) => <Badge size="sm" tone={STATUS_TONE[r.status]}>{r.status}</Badge>,
  },
  {
    key: 'points',
    label: 'Points',
    width: '90px',
    align: 'right',
    sortable: true,
    render: (r) => <span className="font-numeric text-caption-md text-text-primary">{r.points}</span>,
  },
  { key: 'updated', label: 'Updated', width: '130px' },
];

function useSorted(initial: DataTableSort | undefined = { key: 'id', direction: 'desc' }) {
  const [sort, setSort] = React.useState<DataTableSort | undefined>(initial);
  const rows = React.useMemo(() => {
    if (!sort) return CLAIMS;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...CLAIMS].sort((a, b) =>
      String(a[sort.key as keyof Claim]).localeCompare(String(b[sort.key as keyof Claim]), undefined, { numeric: true }) * dir,
    );
  }, [sort]);
  return { sort, setSort, rows };
}

const meta = {
  title: 'Display/DataTable',
  component: DataTable,
  parameters: {
    docs: {
      description: {
        component:
          'The generic table: a real `<table>` with `scope="col"` headers, `aria-sort`, ' +
          'optional row selection, an empty slot. It never sorts rows itself — `rows` render ' +
          'in the order given, and `onSortChange` asks the caller to reorder. There is no ' +
          '`onRowClick` (same decision as Card): put the row’s action in a cell as a real ' +
          'link. The four VCP tables will specialise this in `src/patterns/`.',
      },
    },
  },
  args: { columns: COLUMNS as DataTableColumn<unknown>[], rows: CLAIMS, caption: 'Added Value claims' },
  argTypes: {
    dense: { control: 'boolean' },
    selectable: { control: 'boolean' },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sortable, live: the component asks, the story reorders. */
export const Default: Story = {
  render: (args) => {
    const { sort, setSort, rows } = useSorted();
    return <DataTable {...args} rows={rows} sort={sort} onSortChange={setSort} />;
  },
};

/**
 * Selection: a select-all header checkbox (indeterminate while partial) and a
 * named checkbox per row — `selectLabel` gives each its real name.
 */
export const Selectable: Story = {
  render: (args) => {
    const [selected, setSelected] = React.useState<Array<string | number>>(['AV-2037']);
    return (
      <div className="flex flex-col gap-3">
        <DataTable
          {...args}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          selectLabel={(r) => `Select ${(r as Claim).id}`}
        />
        <span className="font-sans text-body-sm text-text-tertiary">
          {selected.length} selected
        </span>
      </div>
    );
  },
};

/** 44 rows for audit-density screens. */
export const Dense: Story = {
  args: { dense: true },
};

/** The empty slot fits an `EmptyState` — copy rules from docs/empty-state.md apply. */
export const Empty: Story = {
  args: {
    rows: [],
    empty: (
      <EmptyState
        icon={<Icon name="magnifying-glass" size="lg" />}
        title="No claims match these filters"
        description="Try widening the date range or clearing the supplier filter."
        action={<Button variant="tertiary">Clear filters</Button>}
      />
    ),
  },
};

/** More width than the panel has: the container scrolls, the page does not. */
export const HorizontalScroll: Story = {
  render: (args) => (
    <div className="w-112">
      <DataTable
        {...args}
        columns={COLUMNS.map((c) => ({ ...c, width: c.width ?? '220px' })) as DataTableColumn<unknown>[]}
      />
    </div>
  ),
};

/** Every surface and stroke is a token, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-1">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <DataTable {...args} rows={CLAIMS.slice(0, 3)} />
          </div>
        </div>
      ))}
    </div>
  ),
};
