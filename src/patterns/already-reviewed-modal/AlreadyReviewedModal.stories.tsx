import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AlreadyReviewedModal } from './AlreadyReviewedModal';

const meta = {
  title: 'Patterns/AlreadyReviewedModal',
  component: AlreadyReviewedModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'What a reviewer is told when the Added Value they came to review has already been reviewed: a title, one line and a full-width Close. It tells and does nothing else; the page decides when it shows.',
      },
    },
  },
  args: { open: true, onClose: fn() },
} satisfies Meta<typeof AlreadyReviewedModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default wording (Figma's, without "by the initiator"), and one Close that is the dialog's whole width. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'Already Reviewed' });
    await expect(within(dialog).getByText('This Value has already been reviewed.')).toBeVisible();
    const close = within(dialog).getByRole('button', { name: 'Close' });
    /* Figma's button is the width of the dialog's content. */
    await expect(Math.round(close.getBoundingClientRect().width)).toBeGreaterThan(300);
    await userEvent.click(close);
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

/** The page can say who, through `message`. */
export const NamingTheReviewer: Story = {
  args: { message: 'This Value has already been reviewed by Maya Bennett, the initiator.' },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement.ownerDocument.body).findByText(/Maya Bennett/)).toBeVisible();
  },
};
