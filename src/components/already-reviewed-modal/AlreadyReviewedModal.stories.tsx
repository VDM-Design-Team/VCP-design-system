import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AlreadyReviewedModal } from './AlreadyReviewedModal';

const meta = {
  title: 'Components/Overlays/AlreadyReviewedModal',
  component: AlreadyReviewedModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'What a reviewer is told when the Added Value they came to review has already been reviewed: a title, one line and a Close, at the right like every dialog’s. It tells and does nothing else; the page decides when it shows.',
      },
    },
  },
  args: { open: true, onClose: fn() },
} satisfies Meta<typeof AlreadyReviewedModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default wording (Figma's, without "by the initiator"), and one Close at the right of the footer, like every dialog's. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'Already Reviewed' });
    await expect(within(dialog).getByText('This Value has already been reviewed.')).toBeVisible();
    const close = within(dialog).getByRole('button', { name: 'Close' });
    /* In the footer's right half, not stretched across it: the same place every dialog’s answer sits. */
    const footer = close.parentElement!.getBoundingClientRect();
    await expect(close.getBoundingClientRect().left).toBeGreaterThan(footer.left + footer.width / 2);
    await expect(close.getBoundingClientRect().width).toBeLessThan(footer.width / 2);
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
