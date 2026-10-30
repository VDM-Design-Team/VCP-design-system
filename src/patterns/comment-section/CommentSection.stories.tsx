import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CommentSection, type CommentData } from './CommentSection';
import { typeText } from '../../lib/story-typing';
import type { MentionSegment } from '../../atoms/mention-input';

const ME = { id: 'u-john', name: 'John Smith' };
const JANE = { id: 'u-jane', name: 'Jane Doe' };
const ANNA = { id: 'u-anna', name: 'Anna Berg' };

const MEMBERS = [
  { id: ANNA.id, name: ANNA.name },
  { id: JANE.id, name: JANE.name },
  { id: ME.id, name: ME.name },
];

const text = (value: string): MentionSegment[] => [{ type: 'text', text: value }];

const SEED: CommentData[] = [
  {
    id: 'c1',
    author: ME,
    time: 'an hour ago',
    createdAt: '2026-10-27T09:00:00Z',
    body: [{ type: 'mention', id: JANE.id, label: JANE.name }, { type: 'text', text: ' Test comment here.' }],
    reactions: [{ emoji: '👍', count: 2, mine: true }],
    replies: [
      {
        id: 'c2',
        author: JANE,
        time: '45 minutes ago',
        createdAt: '2026-10-27T09:15:00Z',
        body: text('Looking at it now.'),
        replies: [
          { id: 'c3', author: ME, time: '30 minutes ago', createdAt: '2026-10-27T09:30:00Z', body: text('Thanks, Jane.') },
        ],
      },
      { id: 'c4', author: ANNA, time: '10 minutes ago', createdAt: '2026-10-27T09:50:00Z', body: text('Done: please check the new figures.') },
    ],
  },
  { id: 'c5', author: JANE, time: '3 hours ago', createdAt: '2026-10-27T07:00:00Z', body: text('Can we move the review to Thursday?') },
];

/* A stand-in for a server, so the story is the whole thing working: every handler updates the data, after a beat. */
const mapTree = (list: readonly CommentData[], fn: (c: CommentData) => CommentData | null): CommentData[] =>
  list.flatMap((c) => {
    const next = fn(c);
    return next ? [{ ...next, replies: next.replies && mapTree(next.replies, fn) }] : [];
  });

function useDemo(initial: readonly CommentData[]) {
  const [comments, setComments] = React.useState<readonly CommentData[]>(initial);
  const next = React.useRef(100);
  const wait = () => new Promise((r) => setTimeout(r, 60));
  const make = (body: MentionSegment[]): CommentData => ({
    id: `c${next.current++}`,
    author: ME,
    time: 'just now',
    createdAt: new Date().toISOString(),
    body,
  });
  return {
    comments,
    onAddComment: async (body: MentionSegment[]) => {
      await wait();
      setComments((list) => [...list, make(body)]);
    },
    onReply: async (parentId: string, body: MentionSegment[]) => {
      await wait();
      setComments((list) =>
        mapTree(list, (c) => (c.id === parentId ? { ...c, replies: [...(c.replies ?? []), make(body)] } : c)),
      );
    },
    onEdit: async (id: string, body: MentionSegment[]) => {
      await wait();
      setComments((list) => mapTree(list, (c) => (c.id === id ? { ...c, body } : c)));
    },
    onDelete: (id: string) => setComments((list) => mapTree(list, (c) => (c.id === id ? null : c))),
    onReact: (id: string, emoji: string) =>
      setComments((list) =>
        mapTree(list, (c) => {
          if (c.id !== id) return c;
          const found = (c.reactions ?? []).find((r) => r.emoji === emoji);
          const reactions = found
            ? (c.reactions ?? []).flatMap((r) =>
                r.emoji !== emoji ? [r] : r.count <= 1 && r.mine ? [] : [{ ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) }],
              )
            : [...(c.reactions ?? []), { emoji, count: 1, mine: true }];
          return { ...c, reactions };
        }),
      ),
  };
}

const meta = {
  title: 'Patterns/CommentSection',
  component: CommentSection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A whole comment list: the title with the sort switch, the box for a new comment, and every comment with its ' +
          'replies. **This is the piece to reach for.** Give it the comments as data and say what to do when someone ' +
          'adds, replies, edits, deletes or reacts; it holds which threads are open and which box is showing, shows ' +
          'Edit and Delete only on the current user’s own comments, and draws the thread lines. The other comment ' +
          'pieces are its building blocks. See docs/comment-section.md for the one example you need.',
      },
    },
  },
  args: { currentUser: ME, members: MEMBERS, comments: SEED },
  argTypes: { comments: { control: false }, members: { control: false } },
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Everything working: add, reply, edit, delete, react, copy a link, sort. The handlers are the only code. */
export const Default: Story = {
  render: function Render(args) {
    const demo = useDemo(SEED);
    return (
      <CommentSection
        {...args}
        {...demo}
        getLink={(id) => `https://example.com/av/42#comment-${id}`}
        defaultRepliesOpen
      />
    );
  },
};

/** Threads start collapsed ("Show 2 Replies"), which is the default. */
export const Collapsed: Story = {
  render: function Render(args) {
    const demo = useDemo(SEED);
    return <CommentSection {...args} {...demo} />;
  },
};

/** No comments yet: just the box. `emptyState` puts anything under it. */
export const Empty: Story = {
  args: { comments: [] },
  render: function Render(args) {
    const demo = useDemo([]);
    return (
      <CommentSection
        {...args}
        {...demo}
        emptyState={<p className="m-0 text-body-sm-regular text-text-tertiary">No comments yet. Be the first.</p>}
      />
    );
  },
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: function Render(args) {
    const demo = useDemo(SEED);
    const set = (title: string) => (
      <div className="bg-surface-canvas p-8">
        <CommentSection {...args} {...demo} title={title} defaultRepliesOpen />
      </div>
    );
    return (
      <div className="grid grid-cols-1 gap-4">
        <div>{set('Comments')}</div>
        <div className="dark">{set('Comments (dark)')}</div>
      </div>
    );
  },
};

/**
 * **Flow:** a new comment is added; Edit and Delete exist only on the current user's own comments; a reply
 * opens its thread so it is seen; editing replaces the text; deleting removes it; the sort flips the order.
 */
export const Flow: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  render: function Render(args) {
    const demo = useDemo(SEED);
    return <CommentSection {...args} {...demo} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    /* Add a new comment. */
    await typeText(canvas.getByRole('textbox', { name: 'Add a comment' }), 'A brand new comment');
    await userEvent.click(canvas.getByRole('button', { name: 'Add Comment' }));
    await canvas.findByText('A brand new comment');

    /* Edit and Delete: only on John Smith's own comments (the first, and the new one), never on Jane's. */
    const articles = () => [...canvasElement.querySelectorAll('article')];
    const byAuthor = (name: string) => articles().filter((a) => within(a).queryAllByText(name).length > 0);
    for (const a of byAuthor('Jane Doe')) await expect(within(a).queryByRole('button', { name: 'Edit' })).toBeNull();

    /* A thread starts collapsed, and a reply opens it. */
    await expect(canvas.queryByText('Looking at it now.')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Show 2 Replies' }));
    await canvas.findByText('Looking at it now.');

    /* Edit the first comment. */
    const mine = articles().find((a) => within(a).queryByText('Test comment here.'))!;
    await userEvent.click(within(mine).getAllByRole('button', { name: 'Edit' })[0]);
    const edit = await canvas.findByRole('textbox', { name: 'Edit comment' });
    await typeText(edit, ' Edited.');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(canvas.queryByRole('textbox', { name: 'Edit comment' })).not.toBeInTheDocument());
    await canvas.findByText(/Edited\./);

    /* Delete the new comment. */
    const newest = byAuthor('John Smith').find((a) => within(a).queryByText('A brand new comment'))!;
    await userEvent.click(within(newest).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(canvas.queryByText('A brand new comment')).not.toBeInTheDocument());

    /* The sort flips the order of the top-level comments. */
    const firstTop = () => canvasElement.querySelector('article')?.textContent ?? '';
    const before = firstTop();
    await userEvent.click(canvas.getByRole('button', { name: /Sort comments/ }));
    await waitFor(() => expect(firstTop()).not.toBe(before));
  },
};

/** **Flow:** only one reply or edit box is open at a time: opening one closes the other. */
export const OneBoxAtATime: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  render: function Render(args) {
    const demo = useDemo(SEED);
    return <CommentSection {...args} {...demo} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const articles = () => [...canvasElement.querySelectorAll('article')];
    const of = (name: string, text: string) =>
      articles().find((a) => within(a).queryAllByText(name).length > 0 && within(a).queryByText(text))!;

    /* Reply to Jane's comment: a reply box. */
    await userEvent.click(within(of('Jane Doe', 'Can we move the review to Thursday?')).getByRole('button', { name: 'Reply' }));
    await canvas.findByRole('textbox', { name: 'Reply to Jane Doe' });

    /* Edit John's own comment: the edit box opens and the reply box closes. */
    await userEvent.click(within(of('John Smith', 'Test comment here.')).getAllByRole('button', { name: 'Edit' })[0]);
    await canvas.findByRole('textbox', { name: 'Edit comment' });
    await expect(canvas.queryByRole('textbox', { name: 'Reply to Jane Doe' })).not.toBeInTheDocument();

    /* Reply again: the reply box opens and the edit box closes. */
    await userEvent.click(within(of('Jane Doe', 'Can we move the review to Thursday?')).getByRole('button', { name: 'Reply' }));
    await canvas.findByRole('textbox', { name: 'Reply to Jane Doe' });
    await expect(canvas.queryByRole('textbox', { name: 'Edit comment' })).not.toBeInTheDocument();
  },
};

/** **Flow:** replies read oldest first by `createdAt`, whatever order they were handed over in. */
export const RepliesReadOldestFirst: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  args: {
    defaultRepliesOpen: true,
    comments: [
      {
        id: 'p',
        author: JANE,
        time: 'earlier',
        createdAt: '2026-10-27T08:00:00Z',
        body: text('The parent.'),
        replies: [
          { id: 'r2', author: ANNA, time: 'later', createdAt: '2026-10-27T09:00:00Z', body: text('Second reply.') },
          { id: 'r1', author: ME, time: 'sooner', createdAt: '2026-10-27T08:30:00Z', body: text('First reply.') },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const order = [...canvasElement.querySelectorAll('[role="listitem"]')].map((li) => li.textContent ?? '');
    await expect(order[0]).toContain('First reply.');
    await expect(order[1]).toContain('Second reply.');
  },
};
