import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NotificationInbox } from './NotificationInbox';
import { NotificationItem, type NotificationKind } from '../../components/notification-item';

const ROWS: { kind: NotificationKind; time: string; unread: boolean; status?: string }[] = [
  { kind: 'handoff', time: '2 days ago', unread: true },
  { kind: 'commented', time: '2 days ago', unread: true },
  { kind: 'moved', time: '3 days ago', unread: false, status: 'Confirmed prod' },
  { kind: 'accepted', time: '4 days ago', unread: false },
  { kind: 'assigned', time: '5 days ago', unread: true },
  { kind: 'rejected-feedback', time: '6 days ago', unread: false },
];

function Rows({ unreadOnly }: { unreadOnly: boolean }) {
  return (
    <>
      {ROWS.filter((r) => !unreadOnly || r.unread).map((r, i) => (
        <NotificationItem
          key={i}
          kind={r.kind}
          actor={{ name: 'John Smith' }}
          subject="Some Added Value Title Goes Here"
          status={r.status}
          time={r.time}
          unread={r.unread}
          href={`#av-${i}`}
          onToggleRead={() => {}}
        />
      ))}
    </>
  );
}

const meta = {
  title: 'Patterns/NotificationInbox',
  component: NotificationInbox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The full notifications page: the controls ("Mark all as read", "Show unread only"), the rows, ' +
          'and the pager. The list is yours — pass `NotificationItem`s as children and filter and ' +
          'page them yourself from `onUnreadOnlyChange` and `pagination.onChange`.',
      },
    },
  },
  args: { onMarkAllRead: fn(), onUnreadOnlyChange: fn() },
  argTypes: { onMarkAllRead: { control: false }, onUnreadOnlyChange: { control: false } },
} satisfies Meta<typeof NotificationInbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page, with its pager. "Show unread only" re-filters the list, as the caller does here. */
export const Default: Story = {
  render: function Render(args) {
    const [unreadOnly, setUnreadOnly] = React.useState(false);
    const [page, setPage] = React.useState(1);
    return (
      <NotificationInbox
        {...args}
        unreadOnly={unreadOnly}
        onUnreadOnlyChange={(next) => {
          setUnreadOnly(next);
          args.onUnreadOnlyChange?.(next);
        }}
        pagination={{ page, pageCount: 8, onChange: setPage }}
      >
        <Rows unreadOnly={unreadOnly} />
      </NotificationInbox>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('link', { name: /John Smith/ })).toHaveLength(6);

    await userEvent.click(canvas.getByRole('switch', { name: 'Show unread only' }));
    await expect(args.onUnreadOnlyChange).toHaveBeenCalledWith(true);
    await expect(canvas.getAllByRole('link', { name: /John Smith/ })).toHaveLength(3);

    await userEvent.click(canvas.getByRole('button', { name: 'Mark all as read' }));
    await expect(args.onMarkAllRead).toHaveBeenCalledTimes(1);
  },
};

/** One page of results: no pager at all. */
export const SinglePage: Story = {
  render: (args) => (
    <NotificationInbox {...args} pagination={{ page: 1, pageCount: 1 }}>
      <Rows unreadOnly={false} />
    </NotificationInbox>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('navigation')).toBeNull();
  },
};

/** Nothing to show. The design draws no empty state; this is a plain line, flagged in the docs. */
export const Empty: Story = {
  render: (args) => <NotificationInbox {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No notifications')).toBeVisible();
  },
};

/** Without `onMarkAllRead` there is no button, for a page that cannot mark. */
export const WithoutMarkAll: Story = {
  args: { onMarkAllRead: undefined },
  render: (args) => (
    <NotificationInbox {...args}>
      <Rows unreadOnly={false} />
    </NotificationInbox>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: 'Mark all as read' })).toBeNull();
  },
};
