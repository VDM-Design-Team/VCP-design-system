import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NotificationInboxItem } from './NotificationInboxItem';

const meta = {
  title: 'Components/Feedback/NotificationInboxItem',
  component: NotificationInboxItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One row on the full notifications page: a 40 avatar, one line of text with its own weights ' +
          '(name bold, verb semibold, title regular, ending semibold), the time, and the unread dot. ' +
          'The roomier cousin of `NotificationItem`; both read the same sentence table, so the two can ' +
          'never word an event differently. The whole row is the target (`href` or `onSelect`).',
      },
    },
  },
  args: {
    kind: 'handoff',
    actor: { name: 'John Smith' },
    subject: 'Some Added Value Title Goes Here',
    time: '2 days ago',
    unread: true,
    href: '#av-1',
  },
  argTypes: { unread: { control: 'boolean' }, onSelect: { control: false } },
  decorators: [
    (Story) => (
      <div className="w-176 border border-stroke-subtle">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationInboxItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unread, the design's own example: one line, then the time. */
export const Unread: Story = {
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole('link', {
      name: /Unread: John Smith completes Some Added Value Title Goes Here/,
    });
    await expect(row).toHaveAttribute('href', '#av-1');
    await expect(row).toHaveTextContent('Ready for review');
  },
};

/** Read: no dot, and the row aligns with the unread ones because the dot's box stays. */
export const Read: Story = {
  args: { unread: false, kind: 'accepted' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-unread]')).toBeNull();
    await expect(within(canvasElement).getByRole('link', { name: /^John Smith accepts/ })).toBeVisible();
  },
};

/** A row that is a button, for a list that does not navigate. */
export const AsAButton: Story = {
  args: { href: undefined, onSelect: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /John Smith completes/ }));
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
  },
};

/** The same words as the popover's row: a `moved` event carries its status. */
export const Moved: Story = {
  args: { kind: 'moved', status: 'Confirmed prod', time: '5 minutes ago' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link')).toHaveTextContent(
      'John Smith moved Some Added Value Title Goes Here to Confirmed prod',
    );
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
          <div className="flex flex-col bg-surface-canvas p-8">
            <NotificationInboxItem {...args} />
            <NotificationInboxItem {...args} unread={false} kind="viewer" time="3 hours ago" />
          </div>
        </div>
      ))}
    </div>
  ),
};
