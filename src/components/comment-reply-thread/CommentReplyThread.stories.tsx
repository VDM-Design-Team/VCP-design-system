import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CommentReplyThread } from './CommentReplyThread';
import { CommentReply } from '../comment-reply';
import type { MentionSegment } from '../mention-input';

const MEMBERS = [
  { id: '182', name: 'Anna Berg' },
  { id: '204', name: 'Jane Doe' },
  { id: '231', name: 'John Smith' },
];

const text = (value: string): MentionSegment[] => [{ type: 'text', text: value }];

const meta = {
  title: 'Components/Comments/CommentReplyThread',
  component: CommentReplyThread,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comment and, under it, its replies. The replies are the `children`: a `CommentReply`, or a ' +
          '`CommentReplyThread` for one with replies of its own. The comment’s thread line runs into the replies ' +
          'and each takes a corner off it to its own avatar; the line stops at the last one’s corner. Whether they ' +
          'show (`repliesOpen`) is yours to control.',
      },
    },
  },
  args: {
    author: { name: 'John Smith' },
    time: 'an hour ago',
    body: [
      { type: 'mention', id: '204', label: 'Jane Doe' },
      { type: 'text', text: ' Test comment here.' },
    ] satisfies MentionSegment[],
    members: MEMBERS,
    onReply: () => {},
    onCopyLink: () => {},
  },
  argTypes: { body: { control: false }, members: { control: false }, children: { control: false } },
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentReplyThread>;

export default meta;
type Story = StoryObj<typeof meta>;

const replies = (
  <>
    <CommentReply
      author={{ name: 'Jane Doe' }}
      time="45 minutes ago"
      body={text('Looking at it now.')}
      members={MEMBERS}
      onReply={() => {}}
    />
    <CommentReply
      author={{ name: 'Anna Berg' }}
      time="10 minutes ago"
      body={text('Done — please check the new figures.')}
      members={MEMBERS}
      onReply={() => {}}
    />
  </>
);

/** The toggle is the caller's state: here it just flips. */
const Toggleable = (props: React.ComponentProps<typeof CommentReplyThread>) => {
  const [open, setOpen] = React.useState(props.repliesOpen ?? false);
  return <CommentReplyThread {...props} repliesOpen={open} onToggleReplies={() => setOpen((o) => !o)} />;
};

/** Collapsed: no line, and "Show 2 Replies" to open them. */
export const Collapsed: Story = {
  render: (args) => <Toggleable {...args}>{replies}</Toggleable>,
};

/** Open: the line runs from the avatar into the replies and stops at the last one's corner. */
export const Open: Story = {
  render: (args) => (
    <Toggleable {...args} repliesOpen>
      {replies}
    </Toggleable>
  ),
};

/** A reply with replies of its own is a `CommentReplyThread` in the slot — a sub-thread, one level in. */
export const Nested: Story = {
  render: (args) => (
    <Toggleable {...args} repliesOpen>
      <Toggleable
        author={{ name: 'Jane Doe' }}
        time="45 minutes ago"
        body={text('Looking at it now.')}
        members={MEMBERS}
        onReply={() => {}}
        repliesOpen
      >
        <CommentReply
          author={{ name: 'John Smith' }}
          time="30 minutes ago"
          body={text('Thanks, Jane.')}
          members={MEMBERS}
          onReply={() => {}}
        />
      </Toggleable>
      <CommentReply
        author={{ name: 'Anna Berg' }}
        time="10 minutes ago"
        body={text('Done — please check the new figures.')}
        members={MEMBERS}
        onReply={() => {}}
      />
    </Toggleable>
  ),
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: (args) => {
    const set = (
      <div className="bg-surface-canvas p-8">
        <Toggleable {...args} repliesOpen>
          {replies}
        </Toggleable>
      </div>
    );
    return (
      <div className="grid grid-cols-1 gap-4">
        <div>{set}</div>
        <div className="dark">{set}</div>
      </div>
    );
  },
};

/** **Flow:** the toggle shows and hides the replies, and the list it controls is named. */
export const ShowsAndHidesReplies: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  render: (args) => <Toggleable {...args}>{replies}</Toggleable>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();

    const show = canvas.getByRole('button', { name: 'Show 2 Replies' });
    await expect(show).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(show);

    const list = canvas.getByRole('list');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    const hide = canvas.getByRole('button', { name: 'Hide 2 Replies' });
    await expect(hide).toHaveAttribute('aria-expanded', 'true');
    await expect(hide).toHaveAttribute('aria-controls', list.id);

    await userEvent.click(hide);
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
  },
};
