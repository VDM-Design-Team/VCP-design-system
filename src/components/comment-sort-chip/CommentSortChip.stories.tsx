import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CommentSortChip } from './CommentSortChip';

const meta = {
  title: 'Components/Comments/CommentSortChip',
  component: CommentSortChip,
  parameters: {
    docs: {
      description: {
        component:
          'The comments’ sort switch. It shows the current order — "Newest First" or "Oldest ' +
          'First" — with a glyph that points the way, and one click flips it. Not `Chip`: that is a ' +
          'rounded pill for filters and removable tags; this is a rectangle.',
      },
    },
  },
  args: { onSortChange: fn() },
  argTypes: { sort: { control: 'radio', options: ['newest', 'oldest'] }, onSortChange: { control: false } },
} satisfies Meta<typeof CommentSortChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Oldest: Story = { args: { sort: 'oldest' } };

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: () => {
    const set = (
      <div className="flex items-center gap-4 bg-surface-canvas p-8">
        <CommentSortChip sort="newest" />
        <CommentSortChip sort="oldest" />
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

/** **Flow:** a click switches to the other order, reports it, and the name follows. */
export const Flips: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'Sort comments: Newest First' });
    await expect(chip).toHaveTextContent('Newest First');
    await userEvent.click(chip);
    await expect(args.onSortChange).toHaveBeenLastCalledWith('oldest');
    await expect(canvas.getByRole('button', { name: 'Sort comments: Oldest First' })).toBeInTheDocument();
    await userEvent.click(chip);
    await expect(args.onSortChange).toHaveBeenLastCalledWith('newest');
  },
};
