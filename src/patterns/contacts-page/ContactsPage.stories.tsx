import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ContactsPage } from './ContactsPage';
import type { ContactRow } from '../contacts-table';

const ROWS: ContactRow[] = [
  { id: 1, email: 'john@vdm.technology', subject: 'Some subject here', message: 'Some message here' },
  { id: 2, email: 'sarah@vdm.technology', subject: 'Another subject', message: 'Another message' },
];

const meta = {
  title: 'Patterns/ContactsPage',
  component: ContactsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main content of the Contact List page: the title, then the table, laid out once (16 apart, 32 in from the sides). It goes inside `AppShell`; the app only passes the data.',
      },
    },
  },
  args: { table: { rows: ROWS, page: 1, pageCount: 25, itemCount: 1250, pageSize: 50 } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContactsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page: its title, then the table. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Contact List' })).toBeVisible();
    await expect(c.getByRole('table', { name: /.+/ })).toBeVisible();
  },
};
