import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AVListPage, type AVListPageProps } from './AVListPage';
import { IconButton } from '../../atoms/icon-button';
import type { AVTableRow } from '../av-table';

const row = (n: number, status: AVTableRow['status'] = { custom: 'Ready for Deploy' }): AVTableRow => ({
  id: `av-${n}`,
  ref: `VCP-${12340 + n}`,
  title: '[VCP] Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard',
  domain: 'VCP',
  attachments: 3,
  comments: 1,
  due: { date: '2025-10-01', proximity: 'due-soon' },
  urgency: 'Normal',
  type: 'Type 3',
  status,
  members: ['Ali Rahman'],
  lastUpdated: '7 days ago',
});
const rows = (count: number, status?: AVTableRow['status']) => Array.from({ length: count }, (_, i) => row(i + 1, status));

const STATS = {
  user: { name: 'Username' },
  total: 65,
  completed: 47,
  segments: [
    { id: 'draft', label: 'Draft', count: 12, tone: 'neutral' as const },
    { id: 'pending', label: 'Pending', count: 0, tone: 'yellow' as const },
    { id: 'accepted', label: 'Accepted', count: 4, tone: 'blue' as const },
    { id: 'active', label: 'Active', count: 1, tone: 'brand' as const },
    { id: 'overdue', label: 'Overdue', count: 1, tone: 'critical' as const },
  ],
};

const PEOPLE = ['Ali Rahman', 'Eve Lange', 'Ada Lovelace'].map((name) => ({ value: name, label: name }));
/** The filter row of My Values, Assigned, Drafts and the Archive: search, Reset, Filters, then Priority, Tags, Status and Date. */
const baseFilters = (extra: Partial<NonNullable<AVListPageProps['filters']>> = {}): NonNullable<AVListPageProps['filters']> => ({
  priority: { options: ['Urgent', 'High', 'Normal', 'Low'], placeholder: 'Search priority' },
  tags: { options: ['Bug', 'Feature', 'Improvement'], placeholder: 'Select tags' },
  status: { options: ['Draft', 'In Progress', 'Review', 'Completed'], placeholder: 'Select status' },
  period: { placeholder: 'Select period' },
  ...extra,
});

const pager = (count: number) => ({ page: 2, pageCount: 25, itemCount: 1250, pageSize: 50, pageSizeOptions: [25, 50, 100], onPageChange: fn(), onPageSizeChange: fn(), caption: `${count} Added Values` });

/** A page owns what it lists: here the search narrows the rows. */
function Page(props: Omit<AVListPageProps, 'filters'> & { filters?: AVListPageProps['filters']; all: AVTableRow[] }) {
  const { all, filters, table, ...rest } = props;
  const [search, setSearch] = React.useState('');
  const [open, setOpen] = React.useState(true);
  const shown = all.filter((r) => `${r.ref} ${r.title}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <AVListPage
      {...rest}
      filters={filters && { ...filters, search, onSearchChange: setSearch, onReset: () => setSearch(''), filtersOpen: open, onFiltersOpenChange: setOpen }}
      table={{ ...table, rows: shown }}
    />
  );
}

const meta = {
  title: 'Patterns/AVListPage',
  component: AVListPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main content of a page that lists Added Values: the title, an optional totals strip, and the table with its filters inside its card. ' +
          'My Values, Assigned, Drafts, Manage and the Archive tabs are this one layout; each passes what it has. It goes inside `AppShell`.',
      },
    },
  },
  args: { title: 'Assigned Values', table: { rows: [] } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AVListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** My Values: the totals strip, the filters, and a ⋯ in every row. */
export const MyValues: Story = {
  args: { title: 'My Values' },
  render: (args) => (
    <Page
      {...args}
      all={rows(3)}
      stats={STATS}
      filters={baseFilters()}
      table={{ rows: [], ...pager(3), actions: (r) => <IconButton icon="dots-three" variant="tertiary" label={`Actions for ${r.ref}`} /> }}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'My Values' })).toBeVisible();
    await expect(c.getByRole('region', { name: 'My Values statistics' })).toBeVisible();
    await expect(c.getAllByRole('button', { name: /^Actions for VCP-/ })).toHaveLength(3);
    /* The statistics come first, then the filters in the table's card. */
    const stats = c.getByRole('region', { name: 'My Values statistics' });
    const search = c.getByRole('searchbox', { name: 'Search by title or ID' });
    await expect(stats.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};

/** Assigned: no strip, no extra columns. */
export const Assigned: Story = {
  args: { title: 'Assigned Values' },
  render: (args) => <Page {...args} all={rows(4)} filters={baseFilters()} table={{ rows: [], ...pager(4) }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('region', { name: 'My Values statistics' })).toBeNull();
    await expect(c.getAllByRole('row')).toHaveLength(1 + 4);
    /* The search narrows what the page lists; the page owns it. */
    await userEvent.type(c.getByRole('searchbox', { name: 'Search by title or ID' }), 'VCP-12341');
    await expect(c.getAllByRole('row')).toHaveLength(1 + 1);
    await userEvent.click(c.getByRole('button', { name: 'Reset' }));
    await expect(c.getAllByRole('row')).toHaveLength(1 + 4);
  },
};

/** Drafts: the leading checkbox column; selecting is the page's. */
export const Drafts: Story = {
  args: { title: 'Drafts' },
  render: function Render(args) {
    const [selected, setSelected] = React.useState<string[]>([]);
    return <Page {...args} all={rows(3, { status: 'Draft' })} filters={baseFilters()} table={{ rows: [], selectable: true, selected, onSelectedChange: setSelected, ...pager(3) }} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const boxes = c.getAllByRole('checkbox');
    await expect(boxes.length).toBeGreaterThan(3);
    await userEvent.click(c.getAllByRole('checkbox')[1]);
    await expect(c.getAllByRole('checkbox')[1]).toBeChecked();
  },
};

/** Manage Added Value: the filter row also has Assignee and Initiator. */
export const Manage: Story = {
  args: { title: 'Manage Added Value' },
  render: (args) => (
    <Page
      {...args}
      all={rows(4)}
      filters={baseFilters({
        users: [
          { label: 'Assignee', options: PEOPLE, placeholder: 'Select User' },
          { label: 'Initiator', options: PEOPLE, placeholder: 'Select User' },
        ],
      })}
      table={{ rows: [], ...pager(4) }}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Assignee')).toBeVisible();
    await expect(c.getByText('Initiator')).toBeVisible();
  },
};

/** The Archive tabs: the plain page, and only the status the rows carry changes. */
export const ArchiveCompleted: Story = {
  args: { title: 'Completed' },
  render: (args) => <Page {...args} all={rows(3, { status: 'Completed' })} filters={baseFilters()} table={{ rows: [], ...pager(3) }} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText('Completed').length).toBeGreaterThanOrEqual(3);
  },
};

export const ArchiveRejected: Story = {
  args: { title: 'Rejected' },
  render: (args) => <Page {...args} all={rows(3, { status: 'Rejected' })} filters={baseFilters()} table={{ rows: [], ...pager(3) }} />,
};

export const ArchiveBacklog: Story = {
  args: { title: 'Backlog' },
  render: (args) => <Page {...args} all={rows(3, { status: 'Backlog' })} filters={baseFilters()} table={{ rows: [], ...pager(3) }} />,
};

/** A search that matches nothing: the table says so in the system's words, with Reset, and focus goes to the search box when Reset removes itself. */
export const NothingMatches: Story = {
  args: { title: 'Assigned Values' },
  render: (args) => <Page {...args} all={rows(3)} filters={baseFilters()} table={{ rows: [], ...pager(0) }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const search = c.getByRole('searchbox', { name: 'Search by title or ID' });
    await userEvent.type(search, 'zzz');
    await expect(c.getByText('No added values match “zzz”.')).toBeVisible();
    /* Two Resets: the filter bar's, and the empty table's. The empty one is the second. */
    const resets = c.getAllByRole('button', { name: 'Reset' });
    await expect(resets).toHaveLength(2);
    await userEvent.click(resets[1]);
    await expect(c.getAllByRole('row')).toHaveLength(1 + 3);
    await expect(search).toHaveFocus();
  },
};

export const DarkTheme: Story = {
  args: { title: 'My Values' },
  globals: { theme: 'dark' },
  render: (args) => <Page {...args} all={rows(3)} stats={STATS} filters={baseFilters()} table={{ rows: [], ...pager(3) }} />,
};
