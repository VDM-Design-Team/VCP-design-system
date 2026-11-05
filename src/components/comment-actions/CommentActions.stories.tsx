import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CommentActions } from './CommentActions';
import { EmojiReactionPicker } from '../emoji-reaction-picker';

const meta = {
  title: 'Components/Comments/CommentActions',
  component: CommentActions,
  parameters: {
    docs: {
      description: {
        component:
          'The row of things you can do to a comment: show or hide its replies, edit, delete, reply, ' +
          'copy its link, and react. **An action shows when you give it a handler** — a comment by ' +
          'someone else just gets no `onEdit` or `onDelete`. Reactions are a slot for ' +
          '`EmojiReactionPicker`. Copy Link copies, then shows the design’s green check.',
      },
    },
  },
  args: {
    replyCount: 1,
    onToggleReplies: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onReply: () => {},
    onCopyLink: () => {},
  },
  argTypes: {
    reactions: { control: false },
    onToggleReplies: { control: false },
    onEdit: { control: false },
    onDelete: { control: false },
    onReply: { control: false },
    onCancelReply: { control: false },
    onCopyLink: { control: false },
  },
} satisfies Meta<typeof CommentActions>;

export default meta;
type Story = StoryObj<typeof meta>;

const REACTIONS = [
  { emoji: '👍', count: 2, mine: true },
  { emoji: '👀', count: 1 },
];

/** Your own comment, with replies: every action, as the design's `Default` row. */
export const Default: Story = {
  args: { reactions: <EmojiReactionPicker reactions={REACTIONS} /> },
};

/** Someone else's comment: no Edit, no Delete, because no handler was given. */
export const OthersComment: Story = {
  args: {
    onEdit: undefined,
    onDelete: undefined,
    reactions: <EmojiReactionPicker reactions={REACTIONS} />,
  },
};

/** A reply box is open: "Reply" is "Cancel Reply", and the replies are showing. */
export const Replying: Story = {
  args: {
    replying: true,
    repliesOpen: true,
    replyCount: 3,
    onCancelReply: () => {},
    reactions: <EmojiReactionPicker reactions={REACTIONS} />,
  },
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  args: { reactions: <EmojiReactionPicker reactions={REACTIONS} /> },
  render: (args) => {
    const set = (
      <div className="bg-surface-canvas p-8">
        <CommentActions {...args} />
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

/** Stands in for the clipboard, so a story can end in the copied or the refused state. */
const stubClipboard = (writeText: () => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

/** Copy Link, after the clipboard accepted it: the green check, and "Link copied" for everyone else. */
export const LinkCopied: Story = {
  args: { link: 'https://vcp.example/av/1234#comment-9' },
  play: async ({ canvasElement }) => {
    stubClipboard(async () => {});
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Copy Link' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Link copied');
  },
};

/** Copy Link, when the clipboard refuses: a warning glyph and "Couldn’t copy the link", never a false check. */
export const CopyFailed: Story = {
  args: { link: 'https://vcp.example/av/1234#comment-9' },
  play: async ({ canvasElement }) => {
    stubClipboard(async () => {
      throw new Error('denied');
    });
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Copy Link' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Couldn’t copy the link');
  },
};

/** Without a link there is nothing to copy: the click only reaches the caller, and no success is claimed. */
export const NoLinkNoClaim: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  args: { link: undefined, onCopyLink: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Copy Link' }));
    await expect(args.onCopyLink).toHaveBeenCalledWith('');
    await expect(canvas.getByRole('status')).toHaveTextContent('');
  },
};

/** With a `subject`, every button says what it is about, and the visible word still leads the name. */
export const WithSubject: Story = {
  args: { subject: 'Amy Lee’s comment', link: 'https://vcp.example/av/1234#comment-9', onReply: () => {}, onEdit: () => {}, onDelete: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Edit Amy Lee’s comment' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Reply to Amy Lee’s comment' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Copy link to Amy Lee’s comment' })).toBeVisible();
  },
};

/** **Flow:** replies show and hide, Reply and Cancel Reply swap. */
export const Flow: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  render: function Render(args) {
    const [open, setOpen] = React.useState(false);
    const [replying, setReplying] = React.useState(false);
    return (
      <CommentActions
        {...args}
        replyCount={3}
        repliesOpen={open}
        onToggleReplies={() => setOpen((o) => !o)}
        replying={replying}
        onReply={() => setReplying(true)}
        onCancelReply={() => setReplying(false)}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    /* The words change, so the toggle is an action button and carries no `aria-expanded` as well. */
    const toggle = canvas.getByRole('button', { name: 'Show 3 Replies' });
    await expect(toggle).not.toHaveAttribute('aria-expanded');
    await userEvent.click(toggle);
    await expect(canvas.getByRole('button', { name: 'Hide 3 Replies' })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Reply' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel Reply' }));
    await expect(canvas.getByRole('button', { name: 'Reply' })).toBeInTheDocument();
  },
};
