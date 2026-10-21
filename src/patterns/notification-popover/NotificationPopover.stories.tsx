import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { NotificationPopover, type NotificationFilter } from './NotificationPopover';
import { NotificationItem } from '../../components/notification-item';

const SUBJECT = 'Change the notification layout for testing';

const ITEMS = [
  { id: '1', kind: 'commented', time: 'a few seconds ago', unread: true },
  { id: '2', kind: 'mention', time: '5 minutes ago', unread: true },
  { id: '3', kind: 'moved', status: 'Confirmed prod', time: '38 minutes ago', unread: false },
  { id: '4', kind: 'assigned', time: '3 hours ago', unread: false },
  { id: '5', kind: 'accepted', time: '8 hours ago', unread: false },
] as const;

function Items({ unreadOnly, filter }: { unreadOnly: boolean; filter: NotificationFilter }) {
  return (
    <>
      {ITEMS.filter((i) => (!unreadOnly || i.unread) && (filter === 'all' || i.kind === 'mention')).map(
        (i) => (
          <NotificationItem
            key={i.id}
            kind={i.kind}
            actor={{ name: 'John Kestrel' }}
            subject={SUBJECT}
            status={'status' in i ? i.status : undefined}
            time={i.time}
            unread={i.unread}
            href={`#av-${i.id}`}
            onToggleRead={() => {}}
          />
        ),
      )}
    </>
  );
}

const meta = {
  title: 'Patterns/NotificationPopover',
  component: NotificationPopover,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The bell and the panel that opens from it: a header with the All / Mentions filter, the ' +
          '"Unread only" switch and a menu with "Mark all as read", the list, and a link to the full ' +
          'inbox. `Popover` carries the open and close, Escape and click-away; the list is yours — ' +
          'pass `NotificationItem`s as children, and filter them yourself from `onFilterChange` and ' +
          '`onUnreadOnlyChange`.',
      },
    },
  },
  args: { count: 2, inboxHref: '#inbox', onMarkAllRead: fn(), onFilterChange: fn(), onUnreadOnlyChange: fn() },
  argTypes: {
    count: { control: 'number' },
    onMarkAllRead: { control: false },
    onFilterChange: { control: false },
    onUnreadOnlyChange: { control: false },
  },
  decorators: [
    (Story) => (
      /* Right-aligned and with room below, as it sits in the top bar. */
      <div className="flex min-h-[28rem] items-start justify-end bg-surface-canvas p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: just the bell, with its dot. */
export const Closed: Story = {
  render: (args) => (
    <NotificationPopover {...args}>
      <Items unreadOnly={false} filter="all" />
    </NotificationPopover>
  ),
};

/** Open on the full list. The filter and the unread switch re-filter it, as the caller does here. */
export const Open: Story = {
  args: { defaultOpen: true },
  render: function Render(args) {
    const [filter, setFilter] = React.useState<NotificationFilter>('all');
    const [unreadOnly, setUnreadOnly] = React.useState(false);
    return (
      <NotificationPopover
        {...args}
        filter={filter}
        onFilterChange={(next) => {
          setFilter(next);
          args.onFilterChange?.(next);
        }}
        unreadOnly={unreadOnly}
        onUnreadOnlyChange={(next) => {
          setUnreadOnly(next);
          args.onUnreadOnlyChange?.(next);
        }}
      >
        <Items unreadOnly={unreadOnly} filter={filter} />
      </NotificationPopover>
    );
  },
  play: async ({ canvasElement, args }) => {
    const panel = await screen.findByRole('dialog', { name: 'Notifications' });
    const inPanel = within(panel);
    /* The five rows, plus the footer link, which is not one of them. */
    await expect(inPanel.getAllByRole('link', { name: /John Kestrel/ })).toHaveLength(5);

    /* Mentions shows only the mention. */
    await userEvent.click(inPanel.getByRole('radio', { name: 'Mentions' }));
    await expect(args.onFilterChange).toHaveBeenCalledWith('mentions');
    await waitFor(() =>
      expect(inPanel.getAllByRole('link', { name: /John Kestrel/ })).toHaveLength(1),
    );
    await userEvent.click(inPanel.getByRole('radio', { name: 'All' }));

    /* Unread only drops the read ones. */
    await userEvent.click(inPanel.getByRole('switch', { name: 'Unread only' }));
    await expect(args.onUnreadOnlyChange).toHaveBeenCalledWith(true);
    await waitFor(() =>
      expect(inPanel.getAllByRole('link', { name: /John Kestrel/ })).toHaveLength(2),
    );

    /* No sideways scrolling: the list never overflows its width. */
    const list = inPanel.getAllByRole('link', { name: /John Kestrel/ })[0].closest('ul')!
      .parentElement as HTMLElement;
    await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);

    /* The footer goes to the inbox. */
    await expect(inPanel.getByRole('link', { name: 'View notifications inbox' })).toHaveAttribute(
      'href',
      '#inbox',
    );
    void canvasElement;
  },
};

/** The overflow menu's one action. */
export const MarkAllRead: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <NotificationPopover {...args}>
      <Items unreadOnly={false} filter="all" />
    </NotificationPopover>
  ),
  play: async ({ args }) => {
    const panel = await screen.findByRole('dialog', { name: 'Notifications' });
    await userEvent.click(within(panel).getByRole('button', { name: 'More notification actions' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Mark all as read' }));
    await expect(args.onMarkAllRead).toHaveBeenCalledTimes(1);
  },
};

/** Nothing to show. The design draws no empty state; this is a plain line, flagged in the docs. */
export const Empty: Story = {
  args: { defaultOpen: true, count: 0 },
  render: (args) => <NotificationPopover {...args} />,
  play: async () => {
    const panel = await screen.findByRole('dialog', { name: 'Notifications' });
    await expect(within(panel).getByText('No notifications')).toBeVisible();
  },
};

/** Opens from the bell, and Escape closes it, putting focus back on the bell. */
export const OpensAndCloses: Story = {
  render: (args) => (
    <NotificationPopover {...args}>
      <Items unreadOnly={false} filter="all" />
    </NotificationPopover>
  ),
  play: async ({ canvasElement }) => {
    const bell = within(canvasElement).getByRole('button', { name: 'Notifications, 2 unread' });
    await expect(bell).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(bell);
    await screen.findByRole('dialog', { name: 'Notifications' });
    await expect(bell).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(bell).toHaveFocus();
  },
};

/** Both themes. Every colour is a semantic token, so dark comes for free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [],
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex min-h-[28rem] items-start justify-end bg-surface-canvas p-8">
            <NotificationPopover {...args} defaultOpen>
              <Items unreadOnly={false} filter="all" />
            </NotificationPopover>
          </div>
        </div>
      ))}
    </div>
  ),
};
