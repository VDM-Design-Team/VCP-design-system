import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RemoveButton } from './RemoveButton';

const meta = {
  title: 'Atoms/RemoveButton',
  component: RemoveButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The small critical ✕ that takes one item out of a list. `plain` is the glyph alone, for an item on a ' +
          'plain surface; `tonal` is the glyph on a filled disc, for an item over a picture. Icon only, so `label` is ' +
          'required. Whoever places it positions it and decides when it shows.',
      },
    },
  },
  args: { label: 'Remove item', onClick: fn() },
  argTypes: { tone: { control: 'inline-radio', options: ['plain', 'tonal'] } },
} satisfies Meta<typeof RemoveButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Plain: the glyph alone, changing colour through hover and press. */
export const Plain: Story = {
  args: { tone: 'plain' },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remove item' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** Tonal: on a filled disc, for an item over a picture. */
export const Tonal: Story = { args: { tone: 'tonal' } };

/** Both, on a plain surface and over a picture. */
export const Surfaces: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-4 rounded-md bg-surface-elevated p-6">
        <RemoveButton label="Remove problem" />
        <RemoveButton tone="tonal" label="Remove file" />
      </div>
      <div className="flex items-center gap-4 rounded-md bg-surface-brand-strong p-6">
        <RemoveButton label="Remove problem" />
        <RemoveButton tone="tonal" label="Remove file" />
      </div>
    </div>
  ),
};
