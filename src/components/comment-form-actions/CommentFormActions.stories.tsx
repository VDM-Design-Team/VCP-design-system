import * as React from 'react';
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
          '"Cancel". The system’s small `Button` and an outlined `secondary` Cancel, 8 apart. The only choice is the ' +
          '`variant` — `comment`, `reply` or `save` — which fixes the words and whether there is a Cancel.',
      },
    },
  },
  args: { onSubmit: fn() },
  argTypes: {
    variant: { control: 'radio', options: ['comment', 'reply', 'save'] },
    onSubmit: { control: false },
    onCancel: { control: false },
  },
} satisfies Meta<typeof CommentFormActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Inside a form, Cancel never submits and Save sends once: `type="submit"` makes it the form's own submit. */
export const InsideAForm: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  render: function Render() {
    const [log, setLog] = React.useState<string[]>([]);
    const note = (s: string) => setLog((l) => [...l, s]);
    return (
      <div className="flex flex-col gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            note('form submitted');
          }}
          className="flex flex-col gap-2"
        >
          <CommentFormActions variant="reply" onSubmit={() => note('onSubmit')} onCancel={() => note('onCancel')} />
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            note('second form submitted');
          }}
        >
          <CommentFormActions variant="save" type="submit" onCancel={() => {}} />
        </form>
        <p role="status" className="m-0 text-body-sm-regular text-text-secondary">
          {log.join(', ')}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /* Two forms, so two Cancels: the first form's. */
    await userEvent.click(canvas.getAllByRole('button', { name: 'Cancel' })[0]);
    await expect(canvas.getByRole('status')).toHaveTextContent(/^onCancel$/);
    await userEvent.click(canvas.getByRole('button', { name: 'Reply' }));
    /* Sends once, through onSubmit, and the form is not also submitted. */
    await expect(canvas.getByRole('status')).toHaveTextContent(/^onCancel, onSubmit$/);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('second form submitted');
  },
};

/** A new comment: nothing to cancel, so no Cancel. */
export const Default: Story = { args: { variant: 'comment' } };

/** The design's states, together: reply, reply while the box is empty, saving an edit, and waiting. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <CommentFormActions variant="reply" onSubmit={() => {}} onCancel={() => {}} />
      <CommentFormActions variant="reply" disabled onSubmit={() => {}} onCancel={() => {}} />
      <CommentFormActions variant="save" onSubmit={() => {}} onCancel={() => {}} />
      <CommentFormActions variant="comment" loading onSubmit={() => {}} />
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
        <CommentFormActions variant="reply" onSubmit={() => {}} onCancel={() => {}} />
        <CommentFormActions variant="reply" disabled onSubmit={() => {}} onCancel={() => {}} />
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

/** **Flow:** each button fires its own handler. A new comment has no Cancel; a reply or an edit does. */
export const Flow: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  args: { variant: 'save', onCancel: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};
