import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { TableCard } from './TableCard';
import { DataTable, type DataTableColumn } from '../data-table';
import { Input } from '../../atoms/input';
import { Pagination } from '../../atoms/pagination';
import { Icon } from '../../atoms/icon';

interface Person {
  id: string;
  name: string;
  email: string;
}
const ROWS: Person[] = [
  { id: '1', name: 'John', email: 'john@vdm.technology' },
  { id: '2', name: 'Michael', email: 'michael@vdm.technology' },
  { id: '3', name: 'Sarah', email: 'sarah@vdm.technology' },
];
const COLUMNS: DataTableColumn<Person>[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
];

const meta = {
  title: 'Components/Display/TableCard',
  component: TableCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The card a table sits in: the filters above the table, the table, and its pagination, in one card. The one place that says where a table\'s filters go. Put a `DataTable` with `bare` inside it.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Filters above the table, the table, and its pagination, all in one card. */
export const Default: Story = {
  args: { children: null },
  render: () => (
    <TableCard
      filters={<Input aria-label="Search" type="search" placeholder="Search by name or email…" leadingIcon={<Icon name="magnifying-glass" size="sm" />} />}
      footer={<Pagination page={1} pageCount={3} onChange={() => {}} />}
    >
      <DataTable bare caption="People" columns={COLUMNS} rows={ROWS} />
    </TableCard>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const card = c.getByRole('table', { name: 'People' }).closest('.bg-surface-elevated') as HTMLElement;
    await expect(card.contains(c.getByRole('searchbox'))).toBe(true);
    await expect(card.contains(c.getByRole('navigation'))).toBe(true);
  },
};

/** No filters and no footer: just the table in its card, with no empty gaps. */
export const TableOnly: Story = {
  args: { children: null },
  render: () => (
    <TableCard>
      <DataTable bare caption="People" columns={COLUMNS} rows={ROWS} />
    </TableCard>
  ),
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { ...Default, globals: { theme: 'dark' } };
