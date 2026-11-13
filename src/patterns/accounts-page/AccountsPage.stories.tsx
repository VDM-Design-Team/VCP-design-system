import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { AccountsPage } from './AccountsPage';
import type { AccountRow } from '../accounts-table';

const ROWS: AccountRow[] = [
  { id: 'john', name: 'John', email: 'john@vdm.technology', domains: ['Design'], dateAdded: '7 days ago' },
  { id: 'michael', name: 'Michael', email: 'michael@vdm.technology', domains: ['Design'], dateAdded: '1 month ago' },
  { id: 'sarah', name: 'Sarah', email: 'sarah@vdm.technology', domains: ['Design', 'BESA Content'], dateAdded: '3 months ago' },
];

const meta = {
  title: 'Patterns/AccountsPage',
  component: AccountsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main content of the Accounts page: the title, then the table, laid out once (16 apart, 32 in from the sides). It goes inside `AppShell`; the app only passes the data.',
      },
    },
  },
  args: { table: { rows: ROWS, search: '', onSearchChange: fn(), page: 1, pageCount: 25, itemCount: 1250, pageSize: 50 } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page: its title, then the table. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Accounts' })).toBeVisible();
    await expect(c.getByRole('table', { name: /.+/ })).toBeVisible();
  },
};
