import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { TaskLogPage } from './TaskLogPage';
import type { TaskLogRow } from '../task-log-trail';

const ROWS: TaskLogRow[] = [
  { id: 1, ref: 'VCP-1234', task: '[VCP] Collapsible Sidebar for Improved Table Workspace', change: { from: { status: 'In Progress' }, to: { custom: 'Design Review' }, field: 'Status' }, source: 'VCP', changedAt: '2026-06-10T14:37:00', changedBy: 'User’s Name' },
  { id: 2, ref: 'VCP-1235', task: 'Rework the notification bell so unread state survives a reload', change: { from: { event: 'Initial Creation' }, to: { status: 'Draft' }, field: 'Status' }, source: 'VCP', changedAt: '2026-06-09T11:02:00', changedBy: 'Eve Chen' },
];



const meta = {
  title: 'Patterns/TaskLogPage',
  component: TaskLogPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main content of the Task Log Trail page: the title, then the table, laid out once (16 apart, 32 in from the sides). It goes inside `AppShell`; the app only passes the data.',
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
} satisfies Meta<typeof TaskLogPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page: its title, then the table. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Task Log Trail' })).toBeVisible();
    await expect(c.getByRole('table', { name: /.+/ })).toBeVisible();
  },
};
