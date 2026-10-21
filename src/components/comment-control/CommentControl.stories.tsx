import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CommentControl } from './CommentControl';

const meta = {
  title: 'Components/Actions/CommentControl',
  component: CommentControl,
  parameters: {
    docs: {
      description: {
        component:
          'The small text button under a comment: an icon and a word. `kind` picks the glyph from ' +
          "Figma's `_Comment_Control_Icon` (reply, edit, delete, show, hide), so no call site names one. " +
          'A real `<button>`; where it expands something, pass `aria-expanded`.',
      },
    },
  },
  args: { kind: 'reply', label: 'Reply', onClick: fn() },
  argTypes: {
    kind: { control: 'select', options: ['reply', 'edit', 'delete', 'show', 'hide'] },
    onClick: { control: false },
  },
} satisfies Meta<typeof CommentControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reply: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Reply' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** All five, as the design draws them. */
export const Kinds: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <CommentControl {...args} kind="reply" label="Reply" />
      <CommentControl {...args} kind="edit" label="Edit" />
      <CommentControl {...args} kind="delete" label="Delete" />
      <CommentControl {...args} kind="show" label="Show Reply" />
      <CommentControl {...args} kind="hide" label="Hide Reply" />
    </div>
  ),
};

/** Expanding something: the caret flips and `aria-expanded` follows. */
export const Expanding: Story = {
  render: function Render(args) {
    const [open, setOpen] = React.useState(false);
    return (
      <CommentControl
        {...args}
        kind={open ? 'hide' : 'show'}
        label={open ? 'Hide Reply' : 'Show Reply'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('button', { name: 'Show Reply' });
    await expect(control).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(control);
    await expect(within(canvasElement).getByRole('button', { name: 'Hide Reply' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};

export const Disabled: Story = { args: { disabled: true } };

/** Both themes. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex items-center gap-4 bg-surface-elevated p-8">
            <CommentControl {...args} kind="edit" label="Edit" />
            <CommentControl {...args} kind="delete" label="Delete" />
          </div>
        </div>
      ))}
    </div>
  ),
};
