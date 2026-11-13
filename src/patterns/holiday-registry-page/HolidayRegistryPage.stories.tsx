import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { HolidayRegistryPage } from './HolidayRegistryPage';
import type { HolidayRow } from '../holiday-table';

const PEOPLE = ['John Mason', 'Amy Lee', 'Priya Nair'].map((name) => ({ name }));
const ROWS: HolidayRow[] = [
  { id: '1', name: 'Labour Day', start: '2026-05-01', type: 'public', appliesTo: PEOPLE, allDay: true, recurring: true, addedBy: 'system', source: 'hubstaff' },
  { id: '2', name: 'Founders Day', start: '2026-05-01', end: '2026-05-03', type: 'team', appliesTo: PEOPLE, allDay: false, recurring: true, addedBy: { name: 'Priya Nair' }, source: 'manual' },
];

const meta = {
  title: 'Patterns/HolidayRegistryPage',
  component: HolidayRegistryPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main content of the Holiday Registry page: the title, then the table with its filters and buttons, laid out once (16 apart, 32 in from the sides). It goes inside `AppShell`; the app only passes the data.',
      },
    },
  },
  args: {
    table: {
      rows: ROWS,
      filters: { type: '', period: null, user: 'all' },
      onFiltersChange: fn(),
      users: PEOPLE.map((p) => ({ value: p.name, label: p.name })),
      admin: true,
      page: 1,
      pageCount: 25,
      itemCount: 1250,
      pageSize: 50,
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HolidayRegistryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The admin's page: its title, then the table with Add Holiday and Import from Hubstaff. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Holiday Registry' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'Import from Hubstaff' })).toBeVisible();
  },
};
