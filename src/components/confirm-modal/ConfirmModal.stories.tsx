import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ConfirmModal } from './ConfirmModal';
import { confirmations } from './recipes';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Components/Overlays/ConfirmModal',
  component: ConfirmModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The question a person answers before something is lost, then Cancel and a red Confirm. `Modal` in its critical tone: an alert dialog, no ✕, no click-outside. The copy for the dialogs Figma draws is in `confirmations`; spread one in.',
      },
    },
  },
  args: { open: true, onClose: fn(), onConfirm: fn(), ...confirmations.discardAV() },
} satisfies Meta<typeof ConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = (el: HTMLElement) => within(el.ownerDocument.body);

/** Discarding an Added Value: the question, its cost, Cancel and a red Confirm. */
export const DiscardAV: Story = {
  play: async ({ canvasElement, args }) => {
    const dialog = await body(canvasElement).findByRole('alertdialog', { name: 'Are you sure you want to discard this Added Value?' });
    await expect(within(dialog).getByText('This action cannot be undone. The item will be permanently removed.')).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

/** Every question the design asks, written once in `confirmations`. */
export const EveryQuestion: Story = {
  render: function Render(args) {
    const [asking, setAsking] = React.useState<keyof typeof confirmations | null>(null);
    return (
      <div className="flex flex-wrap gap-3 p-8">
        {(Object.keys(confirmations) as Array<keyof typeof confirmations>).map((name) => (
          <Button key={name} variant="secondary" onClick={() => setAsking(name)}>
            {name}
          </Button>
        ))}
        {asking && <ConfirmModal {...args} open {...confirmations[asking]()} onClose={() => setAsking(null)} onConfirm={() => setAsking(null)} />}
      </div>
    );
  },
  args: { open: false },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'deleteProblemSet' }));
    const dialog = await body(canvasElement).findByRole('alertdialog', { name: 'Are you sure you want to delete this Problem Set?' });
    await expect(within(dialog).getByText(/also remove the associated multipart child permanently/)).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body(canvasElement).queryByRole('alertdialog')).toBeNull());
  },
};

/** The question alone, for a step with no cost to explain (removing a link). */
export const QuestionOnly: Story = {
  args: { ...confirmations.removeLink() },
  play: async ({ canvasElement }) => {
    const dialog = await body(canvasElement).findByRole('alertdialog', { name: 'Are you sure you want to remove this link?' });
    await expect(within(dialog).getByRole('button', { name: 'Confirm' })).toBeVisible();
  },
};

/** The work is in flight: Confirm spins, and nothing closes the dialog until it is done. */
export const Confirming: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const dialog = await body(canvasElement).findByRole('alertdialog');
    await expect(within(dialog).getByRole('button', { name: /Confirm/ })).toHaveAttribute('aria-busy', 'true');
  },
};
