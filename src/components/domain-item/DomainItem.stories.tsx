import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DomainItem } from './DomainItem';

const meta = {
  title: 'Components/Display/DomainItem',
  component: DomainItem,
  parameters: {
    docs: {
      description: {
        component:
          'One row in a Tag Management card: a name with edit and delete, a locked built-in with a ' +
          '“Default” tag, or a draggable row with a grip that also moves with ↑ / ↓.',
      },
    },
  },
  args: { label: 'Tag', onEdit: fn(), onDelete: fn(), onMove: fn(), onGrabToggle: fn(), onCancel: fn() },
  argTypes: {
    variant: { control: 'radio', options: ['default', 'locked', 'draggable'] },
  },
  decorators: [
    (Story) => (
      <div className="w-100">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DomainItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A value the product ships with: shown so nobody duplicates it, but not editable. */
export const Locked: Story = { args: { variant: 'locked' } };

export const Draggable: Story = { args: { variant: 'draggable' } };

/** All three types, as Figma's `_Domains_Item` frame draws them. */
export const AllTypes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <DomainItem {...args} variant="default" />
      <DomainItem {...args} variant="locked" />
      <DomainItem {...args} variant="draggable" />
    </div>
  ),
};

/** Picked up for a keyboard move: the grip is pressed and the row takes the neutral fill. */
export const Grabbed: Story = { args: { variant: 'draggable', grabbed: true } };

/** The dragged row takes a neutral fill; the row it is over takes the drop-target fill. */
export const DragStates: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1">
      <DomainItem {...args} variant="draggable" label="In Progress" dragging />
      <DomainItem {...args} variant="draggable" label="Design Review" dropTarget />
    </div>
  ),
};

/** Every colour is a token; dark comes for free. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  render: AllTypes.render,
};

/** Each button is named for its row. */
export const UsingIt: Story = {
  args: { variant: 'draggable', label: 'In Progress' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit In Progress' }));
    await expect(args.onEdit).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete In Progress' }));
    await expect(args.onDelete).toHaveBeenCalledTimes(1);

    const grip = canvas.getByRole('button', { name: 'Move In Progress' });
    grip.focus();
    /* An arrow key alone never moves a row — only while picked up. */
    await userEvent.keyboard('{ArrowDown}');
    await expect(args.onMove).not.toHaveBeenCalled();
    await userEvent.keyboard(' ');
    await expect(args.onGrabToggle).toHaveBeenCalledTimes(1);
  },
};

/** While `grabbed`: ↑ / ↓ report their direction, Escape cancels. */
export const MovingWhileGrabbed: Story = {
  args: { variant: 'draggable', label: 'In Progress', grabbed: true },
  play: async ({ canvasElement, args }) => {
    const grip = within(canvasElement).getByRole('button', { name: 'Move In Progress' });
    grip.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowUp}');
    await expect(args.onMove).toHaveBeenNthCalledWith(1, 'down');
    await expect(args.onMove).toHaveBeenNthCalledWith(2, 'up');
    await userEvent.keyboard('{Escape}');
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};
