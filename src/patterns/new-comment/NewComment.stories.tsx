import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { NewComment } from './NewComment';
import type { CommentSort } from '../../components/comment-sort-chip';

const MEMBERS = [
  { id: '182', name: 'Anna Berg' },
  { id: '204', name: 'Jane Doe' },
  { id: '231', name: 'John Smith' },
];

const meta = {
  title: 'Patterns/NewComment',
  component: NewComment,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The top of a comment list: the "Comments" title with the sort switch, and under it the ' +
          'box a person writes a new comment in — their avatar beside it, Add Comment below. The box ' +
          'is `MentionInput`, so `@` mentions work. Add Comment is dim while the box is empty, and ' +
          'the box clears after a send unless you control the value.',
      },
    },
  },
  args: { user: { name: 'Jane Doe' }, members: MEMBERS },
  argTypes: { onSubmit: { control: false }, onChange: { control: false }, onSortChange: { control: false } },
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NewComment>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The sort order is the caller's: here it just flips, and nothing else on the page depends on it. */
const WithSort = (props: React.ComponentProps<typeof NewComment>) => {
  const [sort, setSort] = React.useState<CommentSort>('newest');
  return <NewComment {...props} sort={sort} onSortChange={setSort} />;
};

export const Default: Story = {
  render: (args) => <WithSort {...args} />,
};

/** A comment with a mention in it: the tag is a real tag, and `mentionedIds` is who to notify. */
export const Filled: Story = {
  args: {
    defaultValue: [
      { type: 'mention', id: '204', label: 'Jane Doe' },
      { type: 'text', text: ' Test comment here.' },
    ],
  },
  render: (args) => <WithSort {...args} />,
};

/** The send is in flight: the button shows its spinner and cannot be pressed twice. */
export const Loading: Story = {
  args: { loading: true, defaultValue: [{ type: 'text', text: 'Looks good to me.' }] },
  render: (args) => <WithSort {...args} />,
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: (args) => {
    /* Two copies on one page would be two landmarks with one name, so the dark one is named apart. */
    const set = (title: string) => (
      <div className="bg-surface-canvas p-8">
        <WithSort {...args} title={title} />
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
 * **Flow:** Add Comment is dim while the box is empty; typing wakes it; sending
 * hands over the segments and clears the box; Ctrl + Enter sends too.
 */
export const Flow: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  args: { onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Add a comment' });
    const send = canvas.getByRole('button', { name: 'Add Comment' });

    await expect(send).toBeDisabled();
    await userEvent.type(field, 'Hello team');
    await waitFor(() => expect(send).toBeEnabled());

    await userEvent.click(send);
    await expect(args.onSubmit).toHaveBeenCalledWith([{ type: 'text', text: 'Hello team' }]);
    await waitFor(() => expect(field).toHaveTextContent(''));
    await expect(send).toBeDisabled();

    /* The keyboard sends too. */
    await userEvent.type(field, 'Second one');
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(2));
    await expect(args.onSubmit).toHaveBeenLastCalledWith([{ type: 'text', text: 'Second one' }]);
  },
};
