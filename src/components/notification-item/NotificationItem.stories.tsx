import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { NotificationItem, type NotificationKind } from './NotificationItem';

const SUBJECT = 'Change the notification layout for testing';

const LONG_COMMENT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nibh elit, sollicitudin ac est vitae, ' +
  'pharetra cursus ligula. Suspendisse tristique suscipit nibh, a scelerisque justo sodales a. Duis nisi ' +
  'arcu, tempor id suscipit nec, posuere et enim. Aliquam nunc nulla, consectetur congue sem a, tempor ' +
  'feugiat purus. Ut id arcu vel odio mollis malesuada at vitae sem.';

const meta = {
  title: 'Components/Feedback/NotificationItem',
  component: NotificationItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One line in a list of notifications: who did what to which Added Value, when, and whether ' +
          'it has been read. The eleven kinds of event come from Figma\'s `_Message_Content`, and the ' +
          'component owns the sentence, so the bold and regular runs are the same everywhere. The whole ' +
          'row is the target (`href` or `onSelect`); the unread dot makes way for the mark-read button ' +
          'on hover and focus. Put items in a list.',
      },
    },
  },
  args: {
    kind: 'commented',
    actor: { name: 'John Kestrel' },
    subject: SUBJECT,
    time: 'a few seconds ago',
    unread: true,
    href: '#av-1',
    onToggleRead: fn(),
  },
  argTypes: {
    kind: {
      control: 'select',
      options: [
        'commented',
        'mention',
        'moved',
        'accepted',
        'updated',
        'rejected',
        'rejected-feedback',
        'assigned',
        'backlog',
        'handoff',
        'viewer',
      ] satisfies NotificationKind[],
    },
    unread: { control: 'boolean' },
    onToggleRead: { control: false },
    onSelect: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unread, a link, with the mark-read button waiting for hover or focus. */
export const Unread: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    /* The row is named from its message, and says it is unread. */
    const row = canvas.getByRole('link', {
      name: 'Unread: John Kestrel commented on Change the notification layout for testing a few seconds ago',
    });
    await expect(row).toHaveAttribute('href', '#av-1');
    const mark = canvas.getByRole('button', { name: 'Mark as read' });
    await userEvent.click(mark);
    await expect(args.onToggleRead).toHaveBeenCalledTimes(1);
  },
};

/** The mark-read button names itself in a tooltip: after a pause on hover, at once on focus. */
export const MarkReadTooltip: Story = {
  play: async () => {
    await userEvent.tab();
    await userEvent.tab();
    await expect(await screen.findByRole('tooltip')).toHaveTextContent('Mark as read');
  },
};

/** Read: no dot, and the button reads "Mark as unread". */
export const Read: Story = {
  args: { unread: false, kind: 'accepted', time: '8 hours ago' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: /^John Kestrel accepts/ })).toBeVisible();
    /* Read: empty on the right at rest. The mark-unread button is there for the
       keyboard, but invisible until the row is hovered or focused. */
    const mark = canvas.getByRole('button', { name: 'Mark as unread' });
    await expect(mark).toBeInTheDocument();
    await expect(getComputedStyle(mark).opacity).toBe('0');
    /* Tab to the row, then to the button: focus brings it in. */
    await userEvent.tab();
    await userEvent.tab();
    await expect(mark).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(mark).opacity).toBe('1'));
    await expect(canvasElement.querySelector('[data-unread]')).toBeNull();
  },
};

/** Every kind of event, with the sentence the design draws for it. */
export const Kinds: Story = {
  decorators: [],
  render: (args) => {
    const rows: { kind: NotificationKind; status?: string; time: string; expect: RegExp }[] = [
      { kind: 'commented', time: 'a few seconds ago', expect: /commented on/ },
      { kind: 'mention', time: 'a few seconds ago', expect: /mentioned you in a comment on/ },
      { kind: 'moved', status: 'Confirmed prod', time: '5 minutes ago', expect: /moved .* to Confirmed prod/ },
      { kind: 'accepted', time: '8 hours ago', expect: /accepts/ },
      { kind: 'updated', time: '38 minutes ago', expect: /made an update to/ },
      { kind: 'rejected', time: '38 minutes ago', expect: /rejected/ },
      { kind: 'rejected-feedback', time: '2 hours ago', expect: /rejected .* with feedback/ },
      { kind: 'assigned', time: '3 hours ago', expect: /assigned you/ },
      { kind: 'backlog', time: '3 hours ago', expect: /moved .* to the backlog/ },
      { kind: 'handoff', time: '3 hours ago', expect: /completes .*\. Ready for review/ },
      { kind: 'viewer', time: '3 hours ago', expect: /added you as a viewer to/ },
    ];
    return (
      <ul className="w-96">
        {rows.map((row) => (
          <li key={row.kind}>
            <NotificationItem {...args} kind={row.kind} status={row.status} time={row.time} />
          </li>
        ))}
      </ul>
    );
  },
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    await expect(links).toHaveLength(11);
    await expect(links[2]).toHaveTextContent('John Kestrel moved Change the notification layout for testing to Confirmed prod');
    await expect(links[9]).toHaveTextContent(/completes .*testing\. Ready for review/);
  },
};

/** A row that is a button, for a list that does not navigate. */
export const AsAButton: Story = {
  args: { href: undefined, onSelect: fn() },
  play: async ({ canvasElement, args }) => {
    const row = within(canvasElement).getByRole('button', { name: /Unread: John Kestrel commented on/ });
    await userEvent.click(row);
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
  },
};

/** Not interactive at all: a plain message, for a read-only list. */
export const Static: Story = {
  args: { href: undefined, onSelect: undefined, onToggleRead: undefined, unread: false },
  play: async ({ canvasElement }) => {
    /* Read with nothing to press: nothing on the right at all. */
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
    await expect(canvasElement.querySelector('[data-read-mark]')).toBeNull();
  },
};

/**
 * With a comment. Three lines, then "Show more" if there is more; "Show less" puts it
 * back. The reply and reaction controls are the caller's, below the card.
 */
export const WithCommentPreview: Story = {
  args: { preview: LONG_COMMENT },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const more = await canvas.findByRole('button', { name: 'Show more' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    const less = await canvas.findByRole('button', { name: 'Show less' });
    await expect(less).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(less);
    await expect(await canvas.findByRole('button', { name: 'Show more' })).toBeVisible();
  },
};

/** A short comment fits in three lines, so there is no button. */
export const ShortCommentPreview: Story = {
  args: { preview: 'Looks good to me — shipping it.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /Show/ })).toBeNull();
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
          <div className="flex w-full flex-col items-center bg-surface-canvas p-8">
            <div className="w-96">
            <NotificationItem {...args} />
            <NotificationItem {...args} unread={false} kind="moved" status="Confirmed prod" />
            <NotificationItem {...args} preview={LONG_COMMENT} />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
