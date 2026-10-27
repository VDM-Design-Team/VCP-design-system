import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CommentComposer } from './CommentComposer';
import type { MentionSegment } from '../mention-input';

const MEMBERS = [
  { id: '182', name: 'Anna Berg' },
  { id: '204', name: 'Jane Doe' },
  { id: '231', name: 'John Smith' },
];

const meta = {
  title: 'Components/Comments/CommentComposer',
  component: CommentComposer,
  parameters: {
    docs: {
      description: {
        component:
          'The box a comment is written in: an optional avatar, the mention field and the send button. The ' +
          'same piece is the **reply box** and the **edit box** under a comment — those are this without the ' +
          'avatar and with a Cancel. `onSubmit` may be async: the button shows its spinner until it settles, ' +
          'and the box **keeps what was typed if it rejects**.',
      },
    },
  },
  args: { members: MEMBERS, onSubmit: fn() },
  argTypes: { onSubmit: { control: false }, onCancel: { control: false }, members: { control: false } },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new comment: the writer's avatar beside the box, Add Comment below, nothing to cancel. */
export const Default: Story = { args: { user: { name: 'Jane Doe' } } };

/** A reply box: no avatar, Reply and Cancel. The send button is dim until there is something to send. */
export const ReplyBox: Story = {
  args: { inputLabel: 'Reply to John Smith', submitLabel: 'Reply', onCancel: () => {} },
};

/** An edit box: it starts with the comment, and Save sends the change. */
export const EditBox: Story = {
  args: {
    inputLabel: 'Edit comment',
    submitLabel: 'Save',
    onCancel: () => {},
    defaultValue: [
      { type: 'mention', id: '204', label: 'Jane Doe' },
      { type: 'text', text: ' Test comment here.' },
    ] satisfies MentionSegment[],
  },
};

/** The send is in flight: the button shows its spinner and cannot be pressed twice. */
export const Loading: Story = {
  args: { user: { name: 'Jane Doe' }, loading: true, defaultValue: [{ type: 'text', text: 'Looks good to me.' }] },
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  args: { user: { name: 'Jane Doe' } },
  render: (args) => {
    const set = (
      <div className="bg-surface-canvas p-8">
        <CommentComposer {...args} />
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
 * **Flow:** the send is dim while empty; sending hands over the segments and clears the box; an async send
 * clears it only when it resolves, and **keeps the text when it rejects**.
 */
export const Flow: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  args: { user: { name: 'Jane Doe' }, onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('textbox', { name: 'Add a comment' });
    const send = canvas.getByRole('button', { name: 'Add Comment' });

    await expect(send).toBeDisabled();
    await userEvent.type(box, 'Hello team');
    await waitFor(() => expect(send).toBeEnabled());
    await userEvent.click(send);
    await expect(args.onSubmit).toHaveBeenCalledWith([{ type: 'text', text: 'Hello team' }]);
    await waitFor(() => expect(box).toHaveTextContent(''));
    await expect(send).toBeDisabled();
  },
};

/** **Flow:** a rejected send keeps what was typed. */
export const KeepsTheTextWhenASendFails: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  args: {
    onSubmit: fn(async () => {
      throw new Error('offline');
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('textbox', { name: 'Add a comment' });
    await userEvent.type(box, 'Do not lose me');
    await userEvent.click(canvas.getByRole('button', { name: 'Add Comment' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Add Comment' })).toBeEnabled());
    await expect(box).toHaveTextContent('Do not lose me');
  },
};
