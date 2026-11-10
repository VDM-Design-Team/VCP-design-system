import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { AnnouncementsTable, type AnnouncementRow } from './AnnouncementsTable';

const ROWS: AnnouncementRow[] = [
  { id: 1, version: 'v1.18.1', title: 'Domain budgets arrive in Settings', kind: 'feature', date: '2026-05-20', features: ['Edit budget per domain', 'Cycle summary'] },
  { id: 2, version: 'v1.18.0', title: 'Title of announcement item goes here (very long title name that must be cut so the table keeps its shape)', kind: 'feature', date: '2026-05-06', features: ['Some announcement feature name goes on and on and on and on and on'] },
  { id: 3, version: 'v1.17.2', title: 'Faster search', kind: 'update', date: '2026-04-22', features: ['Search by role'] },
  { id: 4, version: 'v1.17.1', title: 'Fixes for the planning table', kind: 'experimental', date: '2026-04-09', features: [] },
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

/** The Type tag is the kind's word and tone from the one owner; Version is plain text, so a Feature row has one blue tag, not two. */
export const Types: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const color = (el: HTMLElement) => getComputedStyle(el).color;
    const feature = c.getAllByText('Feature')[0] as HTMLElement;
    const update = c.getByText('Update');
    const experimental = c.getByText('Experimental');
    await expect(new Set([color(feature), color(update), color(experimental)]).size).toBe(3);
    /* The version is text, not a tag: the tag's pill is not around it. */
    const version = c.getByText('v1.18.1');
    await expect(getComputedStyle(version).borderRadius).toBe('0px');
    await expect(getComputedStyle(version).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  },
};

/** The date is ISO, shown dd/mm/yyyy (or the person's locale) in a `<time>`. */
export const Dates: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const date = c.getByText('20/05/2026');
    await expect(date.tagName).toBe('TIME');
    await expect(date).toHaveAttribute('datetime', '2026-05-20');
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
