import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { NotificationsPage } from './NotificationsPage';
import { AppShell } from '../../templates/app-shell';
import { TopBar } from '../top-bar';
import { NotificationItem, type NotificationKind } from '../../components/notification-item';

const ROWS: { kind: Exclude<NotificationKind, 'moved'>; time: string; unread: boolean }[] = [
  { kind: 'handoff', time: '2 days ago', unread: true },
  { kind: 'commented', time: '2 days ago', unread: true },
  { kind: 'accepted', time: '4 days ago', unread: false },
  { kind: 'assigned', time: '5 days ago', unread: true },
];

const rows = ROWS.map((r, i) => (
  <NotificationItem
    key={i}
    kind={r.kind}
    actor={{ name: 'John Smith' }}
    subject="Some Added Value Title Goes Here"
    time={r.time}
    unread={r.unread}
    href={`#av-${i}`}
    onToggleRead={() => {}}
  />
));

const meta = {
  title: 'Patterns/NotificationsPage',
  component: NotificationsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The page the bell’s "View notifications inbox" link opens: the inbox in the page’s content area, inside `AppShell` with **no sidebar** and the logo in the top bar, as Figma draws it. ' +
          'It has no visible title (the `h1` is for screen readers); `showTitle` draws one.',
      },
    },
  },
  args: { onMarkAllRead: fn(), children: rows, pagination: { page: 1, pageCount: 4, itemCount: 80, pageSize: 25, pageSizeOptions: [10, 25, 50] } },
  render: (args) => (
    <AppShell topBar={<TopBar homeHref="#" notifications={3} theme="light" onThemeChange={() => {}} user={{ name: 'Francis M.' }} />}>
      <NotificationsPage {...args} />
    </AppShell>
  ),
} satisfies Meta<typeof NotificationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's page: the logo in the bar, no rail, no title band, the inbox 40 below the bar. The page's `h1` is there for a screen reader. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* One h1, named for the page, and no title drawn. */
    const heading = c.getByRole('heading', { level: 1, name: 'Notifications' });
    await expect(Math.round(heading.getBoundingClientRect().width)).toBeLessThanOrEqual(1);
    /* No sidebar: the bar's logo link is the way home, and there is no navigation rail. */
    await expect(c.getByRole('link', { name: 'Value Chain Plus — home' })).toBeVisible();
    await expect(c.queryByRole('navigation', { name: /sidebar|main/i })).toBeNull();
    /* The inbox: its controls and rows. */
    await expect(c.getByRole('button', { name: 'Mark all as read' })).toBeVisible();
    await expect(c.getAllByRole('link', { name: /John Smith/ })).toHaveLength(4);
  },
};

/** `showTitle`: a title band, for a product that wants one. */
export const WithATitle: Story = {
  args: { showTitle: true },
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', { level: 1, name: 'Notifications' });
    await expect(heading).toBeVisible();
  },
};
