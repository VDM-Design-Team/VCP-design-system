import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DeliverableLink } from './DeliverableLink';

const meta = {
  title: 'Components/Display/DeliverableLink',
  component: DeliverableLink,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One link added to a deliverable: the domain that added it, and its title as a hyperlink. Editable adds a pencil and a bin on hover or ' +
          'focus; the pencil turns the row, in its place, into the form for that link. It reports; the list is the page\'s.',
      },
    },
  },
  args: { title: 'Some Link Goes Here', url: 'https://www.example.com/page', domain: 'design' },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full bg-surface-elevated p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DeliverableLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Viewing: the domain label and the link, opening in a new tab. */
export const Viewing: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Some Link Goes Here' });
    await expect(link).toHaveAttribute('href', 'https://www.example.com/page');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

/** Editable: the pencil and the bin appear on hover or focus. The pencil turns the row into the form; Save reports the change. */
export const Editable: Story = {
  args: { editable: true, onSave: fn(), onRemove: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete Link' }));
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Link' }));
    const title = canvas.getByRole('textbox', { name: 'Link title' });
    await userEvent.clear(title);
    await userEvent.type(title, 'Changed');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(args.onSave).toHaveBeenCalledWith({ url: 'https://www.example.com/page', title: 'Changed' });
  },
};

/** A long title is cut with "…" and the tooltip gives the whole title and the address. */
export const LongTitle: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { title: 'Some Link Here With A Very Long, Long Name That Will Not Fit In The Row At All', editable: true },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link.scrollWidth).toBeGreaterThan(link.clientWidth);
  },
};
