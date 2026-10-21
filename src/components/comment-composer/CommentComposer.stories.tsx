import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CommentComposer } from './CommentComposer';

const MEMBERS = [
  { id: '182', name: 'Anna Berg' },
  { id: '204', name: 'Jane Doe' },
  { id: '231', name: 'John Smith' },
];

const meta = {
  title: 'Components/Forms/CommentComposer',
  component: CommentComposer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Where a comment or reply is written: the avatar, a `MentionInput`, and "Reply" and "Cancel" ' +
          '(or "Save" and "Cancel" when editing) under it. The primary button waits until there is ' +
          'something to send; Ctrl or Cmd + Enter sends, Escape cancels (after closing a member list).',
      },
    },
  },
  args: {
    user: { name: 'Kai Lindqvist' },
    members: MEMBERS,
    onSubmit: fn(),
    onCancel: fn(),
  },
  argTypes: { onSubmit: { control: false }, onCancel: { control: false } },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Replying: the Reply button is off until there is text; sending reports who was mentioned. */
export const Replying: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const send = canvas.getByRole('button', { name: 'Reply' });
    await expect(send).toBeDisabled();
    const field = canvas.getByRole('textbox', { name: 'Write a reply' });
    await userEvent.click(field);
    await userEvent.type(field, 'Thanks @jane');
    await userEvent.keyboard('{Enter}');
    await userEvent.type(field, 'please review');
    await waitFor(() => expect(send).toBeEnabled());
    await userEvent.click(send);
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const [segments, ids] = (args.onSubmit as ReturnType<typeof fn>).mock.calls[0];
    await expect(ids).toEqual(['204']);
    await expect(segments[1]).toMatchObject({ type: 'mention', id: '204', label: 'Jane Doe' });
  },
};

/** Editing: Save, prefilled with the reply being edited. */
export const Editing: Story = {
  args: {
    submitLabel: 'Save',
    defaultValue: [
      { type: 'text', text: 'Looks good, ' },
      { type: 'mention', id: '231', label: 'John Smith' },
      { type: 'text', text: ' to confirm.' },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: 'Save' });
    await expect(save).toBeEnabled();
    await userEvent.click(save);
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const [, ids] = (args.onSubmit as ReturnType<typeof fn>).mock.calls[0];
    await expect(ids).toEqual(['231']);
  },
};

/** Cancel, and Escape, both back out. */
export const Cancels: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    const field = canvas.getByRole('textbox', { name: 'Write a reply' });
    await userEvent.click(field);
    await userEvent.keyboard('{Escape}');
    await expect(args.onCancel).toHaveBeenCalledTimes(2);
  },
};

/** Escape closes an open member list first, and does not cancel. */
export const EscapeClosesTheListFirst: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Write a reply' });
    await userEvent.click(field);
    await userEvent.type(field, '@jo');
    await canvas.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('listbox')).toBeNull());
    await expect(args.onCancel).not.toHaveBeenCalled();
  },
};

/** Both themes. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [],
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex justify-center bg-surface-elevated p-8">
            <div className="w-96">
              <CommentComposer {...args} />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
