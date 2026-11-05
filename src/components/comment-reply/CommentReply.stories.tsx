import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CommentReply } from './CommentReply';
import { EmojiReactionPicker } from '../emoji-reaction-picker';
import { typeText } from '../../lib/story-typing';
import type { MentionSegment } from '../../atoms/mention-input';

const MEMBERS = [
  { id: '182', name: 'Anna Berg' },
  { id: '204', name: 'Jane Doe' },
  { id: '231', name: 'John Smith' },
];

const BODY: MentionSegment[] = [
  { type: 'mention', id: '204', label: 'Jane Doe' },
  { type: 'text', text: ' Test comment here.' },
];

const REACTIONS = [
  { emoji: '👍', count: 2, mine: true },
  { emoji: '👀', count: 1 },
];

const meta = {
  title: 'Components/Comments/CommentReply',
  component: CommentReply,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One posted comment: the author and when, what it says, the row of actions, and — when you are ' +
          'writing back or editing it — the box for that. Made of `CommentActions`, `MentionInput`, ' +
          '`CommentFormActions` and `Avatar`. The comment is the segments `MentionInput` writes; mentions draw ' +
          'as the same tag the box drew. `replying` and `editing` are yours to control.',
      },
    },
  },
  args: {
    author: { name: 'John Smith' },
    time: 'an hour ago',
    body: BODY,
    members: MEMBERS,
    onEdit: () => {},
    onDelete: () => {},
    onReply: () => {},
    onCopyLink: () => {},
    reactions: <EmojiReactionPicker reactions={REACTIONS} />,
  },
  argTypes: {
    reactions: { control: false },
    body: { control: false },
    members: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentReply>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Your own comment: Edit and Delete show because their handlers were given. */
export const Default: Story = { args: { replyCount: 1, onToggleReplies: () => {} } };

/** Someone else's comment: no Edit and no Delete, because no handler was given. */
export const OthersComment: Story = { args: { onEdit: undefined, onDelete: undefined } };

/** The reply box is open under the actions. No thread line: there is no reply yet for it to lead to. */
export const Replying: Story = {
  args: { replying: true, onCancelReply: () => {}, onSubmitReply: () => {} },
};

/** Editing: the box takes the comment's place, filled with it, and the actions step aside. */
export const Editing: Story = {
  args: { editing: true, onSubmitEdit: () => {}, onCancelEdit: () => {} },
};

/** The thread line under the avatar, for a comment whose replies show below it. */
export const WithThreadLine: Story = { args: { thread: 'line', replyCount: 2, repliesOpen: true, onToggleReplies: () => {} } };

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  args: { replying: true, onCancelReply: () => {}, onSubmitReply: () => {} },
  render: (args) => {
    const set = (
      <div className="bg-surface-canvas p-8">
        <CommentReply {...args} />
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

/**
 * **Flow:** Reply opens a focused box with a dim Reply button; typing wakes it; sending hands over the
 * segments; Edit opens the box filled with the comment, and Save sends the change.
 */
export const Flow: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  args: { onSubmitReply: fn(), onSubmitEdit: fn() },
  render: function Render(args) {
    const [replying, setReplying] = React.useState(false);
    const [editing, setEditing] = React.useState(false);
    return (
      <CommentReply
        {...args}
        replying={replying}
        onReply={() => setReplying(true)}
        onCancelReply={() => setReplying(false)}
        onSubmitReply={(value) => {
          args.onSubmitReply?.(value);
          setReplying(false);
        }}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        onSubmitEdit={(value) => {
          args.onSubmitEdit?.(value);
          setEditing(false);
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Reply' }));
    const box = await canvas.findByRole('textbox', { name: 'Reply to John Smith' });
    await waitFor(() => expect(box).toHaveFocus());
    const send = canvas.getByRole('button', { name: 'Reply' });
    await expect(send).toBeDisabled();
    await typeText(box, 'On it');
    await waitFor(() => expect(send).toBeEnabled());
    await userEvent.click(send);
    await expect(args.onSubmitReply).toHaveBeenCalledWith([{ type: 'text', text: 'On it' }]);
    await waitFor(() => expect(canvas.queryByRole('textbox')).not.toBeInTheDocument());

    await userEvent.click(canvas.getByRole('button', { name: 'Edit' }));
    const edit = await canvas.findByRole('textbox', { name: 'Edit comment' });
    await expect(edit).toHaveTextContent('@Jane Doe Test comment here.');
    await typeText(edit, ' Thanks.');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(args.onSubmitEdit).toHaveBeenCalledTimes(1);
  },
};
