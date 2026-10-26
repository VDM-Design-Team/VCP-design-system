import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CommentFormActions } from './CommentFormActions';

const meta = {
  title: 'Components/Comments/CommentFormActions',
  component: CommentFormActions,
  parameters: {
    docs: {
      description: {
        component:
          'The buttons under a comment box: the one that sends it and, when there is a way out, ' +
          '"Cancel". The system’s small `Button` and a ghost Cancel, 4 apart — the one arrangement ' +
          'a new comment, a reply and an edit all need.',
      },
    },
  },
  args: { submitLabel: 'Add Comment', onSubmit: fn() },
  argTypes: { onSubmit: { control: false }, onCancel: { control: false } },
} satisfies Meta<typeof CommentFormActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new comment: nothing to cancel, so no Cancel. */
export const Default: Story = {};

/** The design's states, together: reply, reply while the box is empty, saving an edit, and waiting. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <CommentFormActions submitLabel="Reply" onSubmit={() => {}} onCancel={() => {}} />
      <CommentFormActions submitLabel="Reply" disabled onSubmit={() => {}} onCancel={() => {}} />
      <CommentFormActions submitLabel="Save" onSubmit={() => {}} onCancel={() => {}} />
      <CommentFormActions submitLabel="Add Comment" loading onSubmit={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /* Empty reply box: Reply is dim, Cancel still works. */
    const replies = canvas.getAllByRole('button', { name: 'Reply' });
    await expect(replies[0]).toBeEnabled();
    await expect(replies[1]).toBeDisabled();
    await expect(canvas.getAllByRole('button', { name: 'Cancel' })[1]).toBeEnabled();
    /* Waiting: busy and not clickable twice. */
    const waiting = canvas.getByRole('button', { name: 'Add Comment' });
    await expect(waiting).toBeDisabled();
    await expect(waiting).toHaveAttribute('aria-busy', 'true');
  },
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: () => {
    const set = (
      <div className="flex flex-col items-start gap-4 bg-surface-canvas p-8">
        <CommentFormActions submitLabel="Reply" onSubmit={() => {}} onCancel={() => {}} />
        <CommentFormActions submitLabel="Reply" disabled onSubmit={() => {}} onCancel={() => {}} />
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

/** **Flow:** each button fires its own handler, and Cancel is there only when it has one. */
export const Flow: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  args: { submitLabel: 'Save', onCancel: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};
