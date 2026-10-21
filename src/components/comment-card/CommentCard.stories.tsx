import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CommentCard } from './CommentCard';
import { CommentControl } from '../comment-control';

const meta = {
  title: 'Components/Display/CommentCard',
  component: CommentCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "A posted comment or reply: the author's avatar and the words in a bordered card, with the " +
          'actions under it. The words are `MentionSegment`s, so a mention reads as the same tag the ' +
          'field drew while it was written.',
      },
    },
  },
  args: {
    author: { name: 'Kai Lindqvist' },
    value: [
      { type: 'text', text: 'Thanks ' },
      { type: 'mention', id: '204', label: 'Jane Doe' },
      { type: 'text', text: ', can you review the points before Friday?' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const tag = canvasElement.querySelector('[data-type="mention"]') as HTMLElement;
    await expect(tag).toHaveTextContent('@Jane Doe');
    await expect(tag).toHaveAttribute('data-id', '204');
    await expect(canvasElement).toHaveTextContent('Thanks @Jane Doe, can you review');
  },
};

/** With Edit and Delete under it, as a reply you wrote. */
export const WithActions: Story = {
  args: {
    actions: (
      <>
        <CommentControl kind="edit" label="Edit" />
        <CommentControl kind="delete" label="Delete" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Delete' })).toBeVisible();
  },
};

/** Line breaks are kept. */
export const MultiLine: Story = {
  args: { value: [{ type: 'text', text: 'First line.\nSecond line.' }] },
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
              <CommentCard {...args} />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
