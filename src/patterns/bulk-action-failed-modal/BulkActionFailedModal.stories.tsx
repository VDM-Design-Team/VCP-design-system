import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { BulkActionFailedModal } from './BulkActionFailedModal';

const meta = {
  title: 'Patterns/BulkActionFailedModal',
  component: BulkActionFailedModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'When some of a bulk change did not go through: how many, to what, and each Added Value that failed with why, in red. The ones that worked are not listed.',
      },
    },
  },
  args: {
    open: true,
    onClose: fn(),
    total: 5,
    property: 'Urgency',
    value: 'High',
    failures: [
      { href: '#/added-values/VCP-12345', ref: 'VCP-12345', title: 'Added Value Title Here (if the title is super long, just truncate it so that the row keeps its shape)', reason: 'You do not have permission to change this Added Value.' },
      { href: '#/added-values/VCP-12399', ref: 'VCP-12399', title: 'Rework the notification bell so unread state survives a reload', reason: 'It is in Draft: Urgency cannot be set yet.' },
    ],
  },
} satisfies Meta<typeof BulkActionFailedModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's popup: "2 of 5 added values failed to update Urgency to High", then each with its reason, and Got it. */
export const Default: Story = {
  play: async ({ args }) => {
    const d = within(within(document.body).getByRole('dialog', { name: 'Added Values Failed to Update' }));
    await expect(d.getByText('2 of 5 added values failed to update Urgency to High')).toBeVisible();
    await expect(d.getByText('You do not have permission to change this Added Value.')).toBeVisible();
    await userEvent.click(d.getByRole('button', { name: 'Got it' }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
