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

/** The Archive tabs hold one status each, so there is no Status filter: just Priority, Tags and Date. */
const archiveFilters = (): NonNullable<AVListPageProps['filters']> => ({
  priority: { options: ['Urgent', 'High', 'Normal', 'Low'], placeholder: 'Search priority' },
  tags: { options: ['Bug', 'Feature', 'Improvement'], placeholder: 'Select tags' },
  period: { placeholder: 'Select period' },
});

/** In the Development domain, Manage and Assigned also filter by cycle, and the page starts on the current one so nobody has to pick it (they can still change it). */
const CYCLES = [
  { value: 'c36', code: 'C36', start: '2026-07-06', end: '2026-07-20' },
  { value: 'c37', code: 'C37', start: '2026-07-20', end: '2026-08-03' },
  { value: 'c38', code: 'C38', start: '2026-08-03', end: '2026-08-17' },
];
const withCurrentCycle = (filters: NonNullable<AVListPageProps['filters']>): NonNullable<AVListPageProps['filters']> => ({
  ...filters,
  cycle: { options: CYCLES, value: 'c37', placeholder: 'Select cycle' },
});

/** What the bar offers. The page owns the choices (statuses differ by domain, cycles by date); here each only asks. */
const BULK_ACTIONS = [
  { key: 'urgency', label: 'Urgency', heading: 'Urgency', items: ['Urgent', 'High', 'Normal', 'Low'].map((label) => ({ key: label.toLowerCase(), label })), onSelect: fn() },
  { key: 'type', label: 'Type', heading: 'Type', items: ['Type 1', 'Type 2', 'Type 3'].map((label) => ({ key: label, label })), onSelect: fn() },
];

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

/** Drafts: the leading checkbox column, and the bar over the table while rows are selected. Selecting is the page's; the bar only asks. */
export const Drafts: Story = {
  args: { title: 'Drafts' },
  render: function Render(args) {
    const [selected, setSelected] = React.useState<string[]>([]);
    return (
      <Page
        {...args}
        all={rows(3, { status: 'Draft' })}
        filters={baseFilters()}
        table={{ rows: [], selectable: true, selected, onSelectedChange: setSelected, ...pager(3) }}
        bulk={{ count: selected.length, onClear: () => setSelected([]), onDelete: fn(), actions: BULK_ACTIONS }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* No rows selected: no bar. */
    await expect(c.queryByText(/Selected/)).toBeNull();
    await userEvent.click(c.getAllByRole('checkbox')[1]);
    await expect(c.getAllByRole('checkbox')[1]).toBeChecked();
    /* One selected: the bar, with Delete (the table's own Delete Selected is left out). */
    await expect(c.getByText(/1 Selected/)).toBeVisible();
    await expect(c.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(c.queryByRole('button', { name: /Delete Selected/ })).toBeNull();
    /* The chip clears the selection and the bar goes; focus is not dropped but lands on the table's select-all checkbox. */
    await userEvent.click(c.getByRole('button', { name: /Selected/ }));
    await expect(c.queryByText(/Selected/)).toBeNull();
    await expect(c.getByLabelText('Select all rows')).toHaveFocus();
  },
};

/** Manage Added Value: the filter row also has Assignee and Initiator, and rows can be selected for the bar. */
export const Manage: Story = {
  args: { title: 'Manage Added Value' },
  render: function Render(args) {
    const [selected, setSelected] = React.useState<string[]>([]);
    return (
      <Page
        {...args}
        all={rows(4)}
        filters={baseFilters({
          users: [
            { label: 'Assignee', options: PEOPLE, placeholder: 'Select User' },
            { label: 'Initiator', options: PEOPLE, placeholder: 'Select User' },
          ],
        })}
        table={{ rows: [], selectable: true, selected, onSelectedChange: setSelected, ...pager(4) }}
        bulk={{ count: selected.length, onClear: () => setSelected([]), onDelete: fn(), actions: BULK_ACTIONS }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Assignee')).toBeVisible();
    await expect(c.getByText('Initiator')).toBeVisible();
    await userEvent.click(c.getAllByRole('checkbox')[1]);
    await userEvent.click(c.getAllByRole('checkbox')[2]);
    await expect(c.getByText(/2 Selected/)).toBeVisible();
  },
};

/** The Archive tabs: the plain page with Priority, Tags and Date filters (no Status: each tab holds one). Only the status the rows carry changes. */
export const ArchiveCompleted: Story = {
  args: { title: 'Archived Values: Completed' },
  render: (args) => <Page {...args} all={rows(3, { status: 'Completed' })} filters={archiveFilters()} table={{ rows: [], ...pager(3) }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Archived Values: Completed' })).toBeVisible();
    await expect(c.getAllByText('Completed').length).toBeGreaterThanOrEqual(3);
    /* Priority, Tags and Date; no Status. */
    await expect(c.getByText('Priority')).toBeVisible();
    await expect(c.getByText('Tags')).toBeVisible();
    await expect(c.getByText('Date')).toBeVisible();
    await expect(c.queryByText('Select status')).toBeNull();
  },
};

export const ArchiveRejected: Story = {
  args: { title: 'Archived Values: Rejected' },
  render: (args) => <Page {...args} all={rows(3, { status: 'Rejected' })} filters={archiveFilters()} table={{ rows: [], ...pager(3) }} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 1, name: 'Archived Values: Rejected' })).toBeVisible();
  },
};

export const ArchiveBacklogged: Story = {
  args: { title: 'Archived Values: Backlogged' },
  render: (args) => <Page {...args} all={rows(3, { status: 'Backlog' })} filters={archiveFilters()} table={{ rows: [], ...pager(3) }} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 1, name: 'Archived Values: Backlogged' })).toBeVisible();
  },
};

/** The Development domain's Assigned: the cycle filter is there, already on the current cycle. */
export const AssignedInDevelopment: Story = {
  args: { title: 'Assigned Values' },
  render: (args) => <Page {...args} all={rows(4)} filters={withCurrentCycle(baseFilters())} table={{ rows: [], ...pager(4) }} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Cycle')).toBeVisible();
    /* The current cycle is picked without the person doing anything: the field shows it, not its placeholder. */
    await expect(c.getAllByText(/C37/).length).toBeGreaterThanOrEqual(1);
    await expect(c.queryByText('Select cycle')).toBeNull();
  },
};

/** The Development domain's Manage: the cycle filter, on the current cycle, beside Assignee and Initiator. */
export const ManageInDevelopment: Story = {
  args: { title: 'Manage Added Value' },
  render: (args) => (
    <Page
      {...args}
      all={rows(4)}
      filters={withCurrentCycle(
        baseFilters({
          users: [
            { label: 'Assignee', options: PEOPLE, placeholder: 'Select User' },
            { label: 'Initiator', options: PEOPLE, placeholder: 'Select User' },
          ],
        }),
      )}
      table={{ rows: [], ...pager(4) }}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Cycle')).toBeVisible();
    await expect(c.getAllByText(/C37/).length).toBeGreaterThanOrEqual(1);
    await expect(c.queryByText('Select cycle')).toBeNull();
    await expect(c.getByText('Assignee')).toBeVisible();
  },
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
