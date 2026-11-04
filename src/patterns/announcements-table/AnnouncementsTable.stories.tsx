import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { AnnouncementsTable, type AnnouncementRow } from './AnnouncementsTable';

const ROWS: AnnouncementRow[] = [
  { id: 1, version: 'V1.18.1', title: 'Domain budgets arrive in Settings', type: 'Feature', date: 'May 20, 2026', features: ['Edit budget per domain', 'Cycle summary'] },
  { id: 2, version: 'V1.18.0', title: 'Title of announcement item goes here (very long title name that must be cut so the table keeps its shape)', type: 'Feature', date: 'May 6, 2026', features: ['Some announcement feature name goes on and on and on and on and on'] },
  { id: 3, version: 'V1.17.2', title: 'Faster search', type: 'Improvement', date: 'Apr 22, 2026', features: ['Search by role'] },
  { id: 4, version: 'V1.17.1', title: 'Fixes for the planning table', type: 'Fix', date: 'Apr 9, 2026', features: [] },
];

const meta = {
  title: 'Patterns/AnnouncementsTable',
  component: AnnouncementsTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Announcements tab’s list: New Announcement, View Changelog and Refresh above, and each announcement’s version, title, ' +
          'type, date and features, with Edit and Delete in a menu on every row. Controlled: every button only asks.',
      },
    },
  },
  args: {
    rows: ROWS,
    onNew: fn(),
    onViewChangelog: fn(),
    onRefresh: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnnouncementsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's tab: the three buttons, then Version, Title, Type, Date, Features and a menu per row. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('table', { name: 'Announcements' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'New Announcement' }));
    await expect(args.onNew).toHaveBeenCalled();
    await userEvent.click(c.getByRole('button', { name: 'View Changelog' }));
    await expect(args.onViewChangelog).toHaveBeenCalled();
    await userEvent.click(c.getByRole('button', { name: 'Refresh' }));
    await expect(args.onRefresh).toHaveBeenCalled();
    /* Each row's menu is named for its announcement; Edit and Delete only ask. */
    await userEvent.click(c.getByRole('button', { name: 'Actions for Faster search' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    await expect(args.onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }));
    /* The menu closes on choosing; only then open it again. */
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await userEvent.click(c.getByRole('button', { name: 'Actions for Fixes for the planning table' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /^Delete/ }));
    await expect(args.onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 4 }));
  },
};

/** Feature is blue; any other type is grey until design names them. */
export const Types: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const color = (el: HTMLElement) => getComputedStyle(el).color;
    await expect(color(c.getByText('Improvement'))).toBe(color(c.getByText('Fix')));
    await expect(color(c.getByText('Improvement'))).not.toBe(color(c.getAllByText('Feature')[0]));
  },
};

/** No announcements. */
export const Empty: Story = { args: { rows: [] } };

/** While they load: the buttons and headers stay, each cell is a placeholder, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading announcements');
    await expect(c.queryByRole('button', { name: /^Actions for/ })).toBeNull();
    await expect(c.getByRole('button', { name: 'New Announcement' })).toBeVisible();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
