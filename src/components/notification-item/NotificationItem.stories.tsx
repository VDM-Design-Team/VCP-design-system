import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import {
  NotificationItem,
  type NotificationKind,
  type NotificationReply,
} from './NotificationItem';
import type { EmojiReaction } from '../emoji-reaction-picker';
import type { MentionSegment } from '../mention-input';

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
      <div className="w-128">
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
      <ul className="w-128">
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

const MEMBERS = [
  { id: '182', name: 'Anna Berg' },
  { id: '204', name: 'Jane Doe' },
  { id: '231', name: 'John Smith' },
];

/**
 * A comment with reactions and one reply, wired the way an app would: the reply and the
 * reactions are state here, and the item reports what the user did.
 */
function CommentThread({
  initialReply,
  initialReactions = [
    { emoji: '👍', count: 2, mine: true },
    { emoji: '👀', count: 1 },
  ],
  ...rest
}: {
  initialReply?: NotificationReply;
  initialReactions?: EmojiReaction[];
  defaultReplyShown?: boolean;
}) {
  const [reply, setReply] = React.useState<NotificationReply | undefined>(initialReply);
  const [reactions, setReactions] = React.useState<EmojiReaction[]>(initialReactions);
  const me = { name: 'Kai Lindqvist' };
  const words = (value: MentionSegment[]) => value;
  const toggle = (emoji: string) =>
    setReactions((rs) =>
      rs
        .map((r) =>
          r.emoji === emoji
            ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) }
            : r,
        )
        .filter((r) => r.count > 0),
    );
  const select = (emoji: string) =>
    setReactions((rs) =>
      rs.some((r) => r.emoji === emoji)
        ? rs.map((r) => (r.emoji === emoji && !r.mine ? { ...r, mine: true, count: r.count + 1 } : r))
        : [...rs, { emoji, count: 1, mine: true }],
    );
  return (
    <NotificationItem
      kind="commented"
      actor={{ name: 'John Kestrel' }}
      subject={SUBJECT}
      time="a few seconds ago"
      unread
      href="#av-1"
      preview="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nibh elit, sollicitudin ac est vitae."
      reactions={reactions}
      onToggleReaction={toggle}
      onSelectEmoji={select}
      reply={reply}
      members={MEMBERS}
      currentUser={me}
      onReply={(value) => setReply({ author: me, value: words(value) })}
      onEditReply={(value) => setReply({ author: me, value: words(value) })}
      onDeleteReply={() => setReply(undefined)}
      {...rest}
    />
  );
}

/** Reactions under a comment: the thumbs-up, the palette, and a pill for each emoji. Pills toggle your own. */
export const Reactions: Story = {
  render: () => <CommentThread />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /* The pill for 👍 is yours: pressing it takes yours back. */
    await userEvent.click(canvas.getByRole('button', { name: /Remove thumbs up/ }));
    await expect(canvas.getByRole('button', { name: /React with thumbs up/ })).toBeInTheDocument();
  },
};

/**
 * Replying, end to end, as the design's flow draws it: Reply opens a composer in place of the
 * row; sending it posts one reply, hidden by default; "Show Reply" shows it with Edit and Delete;
 * Edit puts the composer back, filled; Save keeps the change; Delete takes the reply away and
 * brings "Reply" back.
 */
export const ReplyFlow: Story = {
  render: () => <CommentThread />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Reply' }));
    /* The row (and its reactions) give way to the composer. */
    await expect(canvas.queryByRole('button', { name: /React with/ })).toBeNull();
    const field = canvas.getByRole('textbox', { name: 'Write a reply' });
    await userEvent.type(field, 'Thanks @jane');
    await userEvent.keyboard('{Enter}');
    await userEvent.type(field, 'will review');
    await userEvent.click(canvas.getByRole('button', { name: 'Reply' }));

    /* Posted, and hidden by default. */
    const show = await canvas.findByRole('button', { name: 'Show Reply' });
    await expect(show).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText(/will review/)).toBeNull();
    await userEvent.click(show);
    await expect(await canvas.findByText(/will review/)).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Hide Reply' })).toHaveAttribute('aria-expanded', 'true');

    /* Edit, with the reply's words in the field, then Save. */
    await userEvent.click(canvas.getByRole('button', { name: 'Edit' }));
    const editor = canvas.getByRole('textbox', { name: 'Write a reply' });
    await expect(editor).toHaveTextContent('Thanks @Jane Doe will review');
    await userEvent.type(editor, ' soon');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(await canvas.findByText(/will review soon/)).toBeVisible();

    /* Delete: the reply goes and "Reply" comes back. */
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
    await expect(await canvas.findByRole('button', { name: 'Reply' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /Show Reply|Hide Reply/ })).toBeNull();
  },
};

/** A comment that already has a reply, hidden: "Show Reply" is where "Reply" was. */
export const RepliedHidden: Story = {
  render: () => (
    <CommentThread
      initialReply={{
        author: { name: 'Kai Lindqvist' },
        value: [{ type: 'text', text: 'Thanks, shipping it Friday.' }],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Show Reply' })).toBeVisible();
    await expect(canvas.queryByText(/shipping it Friday/)).toBeNull();
  },
};

/** The same, shown: the reply card with Edit and Delete. */
export const RepliedShown: Story = {
  render: () => (
    <CommentThread
      defaultReplyShown
      initialReply={{
        author: { name: 'Kai Lindqvist' },
        value: [
          { type: 'text', text: 'Thanks ' },
          { type: 'mention', id: '204', label: 'Jane Doe' },
          { type: 'text', text: ', shipping it Friday.' },
        ],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Hide Reply' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(canvasElement.querySelector('[data-type="mention"]')).toHaveTextContent('@Jane Doe');
  },
};

/** Cancelling a reply brings the row back, with its reactions. */
export const CancelReply: Story = {
  render: () => <CommentThread />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Reply' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(await canvas.findByRole('button', { name: 'Reply' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /thumbs up/ })).toBeVisible();
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
            <div className="w-128">
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
