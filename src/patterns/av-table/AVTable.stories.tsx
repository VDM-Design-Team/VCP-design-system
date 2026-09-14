import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AVTable, type AVTableRow } from './AVTable';
import { IconButton } from '../../atoms/icon-button';
import type { DataTableSort } from '../../components/data-table';

const ROWS: AVTableRow[] = [
  {
    id: 'av-1',
    ref: 'VCP-12345',
    title: '[VCP] Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard',
    domain: 'VCP',
    attachments: 3,
    comments: 1,
    due: { label: 'October 1, 2025', proximity: 'due-soon' },
    urgency: 'Normal',
    type: 'Type 3',
    status: { custom: 'Ready for Deploy' },
    members: ['Ali Rahman'],
    lastUpdated: '7 days ago',
  },
  {
    id: 'av-2',
    ref: 'VCP-12408',
    title: 'Rework the notification bell so unread state survives a reload',
    domain: 'VCP',
    attachments: 1,
    due: { label: 'August 3, 2026', proximity: 'overdue' },
    urgency: 'Urgent',
    type: 'Type 1',
    status: { status: 'Review' },
    members: ['Eve Chen', 'Ali Rahman', 'Sam Okafor', 'Dana Lu'],
    lastUpdated: '2 hours ago',
  },
  {
    id: 'av-3',
    ref: 'VCP-12511',
    title: 'Audit every empty state for copy that blames the reader',
    domain: 'Design',
    comments: 12,
    due: { label: 'March 4, 2027' },
    urgency: 'Low',
    type: 'Type 3',
    status: { status: 'Draft' },
    members: ['Dana Lu'],
    lastUpdated: 'yesterday',
  },
  {
    id: 'av-4',
    ref: 'VCP-12690',
    title: 'Split the budget table into its own pattern',
    domain: 'VCP',
    attachments: 2,
    comments: 4,
    due: { label: 'December 19, 2026', proximity: 'due-soon' },
    urgency: 'High',
    type: 'Type 2',
    status: { status: 'In Progress' },
    members: ['Sam Okafor', 'Eve Chen'],
    lastUpdated: '3 days ago',
  },
];

const HINTS = {
  urgency: 'How soon this needs attention, set by the initiator.',
  type: 'The effort band this Added Value was sized into.',
  status: 'Where this sits in its domain’s flow.',
  members: 'Everyone assigned to this Added Value.',
};

const meta = {
  title: 'Patterns/AVTable',
  component: AVTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Added Value table — `DataTable` specialised, exactly as the generic table’s ' +
          'own doc says the VCP tables should be. **It owns no mapping**: every cell with a ' +
          'vocabulary defers to the piece that owns it — `StatusPill`, `UrgencyTag`, ' +
          '`TypeTag`, `DueDatePill`. This pattern decides which columns exist and in what ' +
          'order, and nothing else. It does not sort, filter or paginate; `rows` renders in ' +
          'the order given.',
      },
    },
  },
  args: { rows: ROWS, hints: HINTS },
} satisfies Meta<typeof AVTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The seven default columns, as the Figma frame draws them. */
export const Default: Story = {
  render: (args) => (
    <div className="bg-surface-canvas p-6">
      <AVTable {...args} onOpen={() => {}} />
    </div>
  ),
};

/**
 * Sorting is the caller's. The table draws the caret and `aria-sort`; what the
 * rows do about it is this story's business, not the pattern's.
 */
export const Sortable: Story = {
  render: (args) => {
    const [sort, setSort] = React.useState<DataTableSort>({ key: 'due', direction: 'asc' });
    return (
      <div className="bg-surface-canvas p-6">
        <AVTable {...args} sort={sort} onSortChange={setSort} onOpen={() => {}} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const due = canvas.getByRole('columnheader', { name: /Due Date/ });
    await expect(due).toHaveAttribute('aria-sort', 'ascending');

    /* Clicking the sorted column flips it rather than re-asking for asc. */
    await userEvent.click(canvas.getByRole('button', { name: 'Due Date' }));
    await expect(due).toHaveAttribute('aria-sort', 'descending');

    /* Asking for a different column starts it ascending, and the old one
       stops claiming a direction. */
    await userEvent.click(canvas.getByRole('button', { name: 'Task Title' }));
    await expect(canvas.getByRole('columnheader', { name: /Task Title/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await expect(due).not.toHaveAttribute('aria-sort');
  },
};

/**
 * Selection, and the destructive button it unlocks. The button appears only
 * when something is selected and says how many — a bare "Delete Selected" is
 * an unanswerable question.
 */
export const Selectable: Story = {
  render: (args) => {
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    return (
      <div className="bg-surface-canvas p-6">
        <AVTable
          {...args}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          onDeleteSelected={() => setSelected([])}
          onOpen={() => {}}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /Delete Selected/ })).not.toBeInTheDocument();

    /* Every checkbox names its AV, so they never announce alike. */
    await userEvent.click(canvas.getByRole('checkbox', { name: /Select VCP-12408/ }));
    await expect(canvas.getByRole('button', { name: 'Delete Selected (1)' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows' }));
    await expect(canvas.getByRole('button', { name: 'Delete Selected (4)' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Delete Selected (4)' }));
    await expect(canvas.queryByRole('button', { name: /Delete Selected/ })).not.toBeInTheDocument();
  },
};

/** The Actions column — Figma's fourth row variant. */
export const WithActions: Story = {
  render: (args) => (
    <div className="bg-surface-canvas p-6">
      <AVTable
        {...args}
        onOpen={() => {}}
        actions={(row) => (
          <IconButton icon="dots-three" label={`Actions for ${row.ref}`} variant="tertiary" />
        )}
      />
    </div>
  ),
};

/** Everything at once: checkbox column, actions column, pagination. */
export const FullyLoaded: Story = {
  render: (args) => {
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [page, setPage] = React.useState(2);
    return (
      <div className="bg-surface-canvas p-6">
        <AVTable
          {...args}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          onDeleteSelected={() => setSelected([])}
          onOpen={() => {}}
          actions={(row) => (
            <IconButton icon="dots-three" label={`Actions for ${row.ref}`} variant="tertiary" />
          )}
          page={page}
          pageCount={25}
          onPageChange={setPage}
        />
      </div>
    );
  },
};

/**
 * The reference opens the AV — a real button, not a whole-row click target.
 * Its accessible name carries the title too, so a screen-reader user hears
 * what they are opening rather than a bare code.
 */
export const OpeningAnAV: Story = {
  render: (args) => {
    const [opened, setOpened] = React.useState<string | null>(null);
    return (
      <div className="bg-surface-canvas p-6">
        <AVTable {...args} onOpen={(row) => setOpened(row.ref)} />
        <p className="mt-4 font-sans text-body-md text-text-secondary">
          {opened ? `Opened ${opened}` : 'Nothing opened yet'}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing opened yet')).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: /VCP-12511.*empty state/s }),
    );
    await expect(canvas.getByText('Opened VCP-12511')).toBeInTheDocument();
  },
};

/** Nothing to show. The copy is the caller's — `EmptyState` fits here. */
export const Empty: Story = {
  render: (args) => (
    <div className="bg-surface-canvas p-6">
      <AVTable {...args} rows={[]} empty="No Added Values match these filters." />
    </div>
  ),
};

/**
 * Sparse rows. Every column but the title and the reference is optional, and
 * an absent value draws nothing rather than a dash or an "—" placeholder.
 */
export const SparseRows: Story = {
  render: (args) => (
    <div className="bg-surface-canvas p-6">
      <AVTable
        {...args}
        rows={[
          { id: 'a', ref: 'VCP-10001', title: 'Only a reference and a title' },
          {
            id: 'b',
            ref: 'VCP-10002',
            title: 'A title, a status and nothing else',
            status: { status: 'Backlog' },
          },
        ]}
      />
    </div>
  ),
};
