import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { RejectPendingAVModal } from './RejectPendingAVModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/RejectPendingAVModal',
  component: RejectPendingAVModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Rejecting an Added Value that is still `Pending`, before anyone has worked on it. One ' +
          'question: why. **The design draws its validation** — Reject is faded until a reason is ' +
          'chosen — so the dialog refuses by what it lets you press rather than by an error after ' +
          'the fact. Reject is the `primary` button, not `danger`: rejecting is a decision, not a ' +
          'destruction.',
      },
    },
  },
  args: { open: true, onClose: () => {}, onReject: () => {} },
} satisfies Meta<typeof RejectPendingAVModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As it opens. Nothing chosen, so Reject is disabled — the design's first state. */
export const Default: Story = {};

/** The rejection is in flight. Reject spins and cannot be pressed twice. */
export const Rejecting: Story = {
  args: { loading: true },
};

/** Every colour is a token. The dialog portals to `body`, so the theme global reaches it. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
};

/**
 * Choosing a reason enables Reject, and the explanation appears. Choosing
 * `Other` opens the free-text box, and what is typed there travels with the
 * rejection.
 */
export const RejectingIt: Story = {
  args: { open: false },
  render: function RejectingItStory(args) {
    const [open, setOpen] = React.useState(false);
    const [sent, setSent] = React.useState('nothing yet');
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Reject AV
        </Button>
        <p className="text-body-sm text-text-tertiary">Sent: {sent}</p>
        <RejectPendingAVModal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onReject={({ reason, detail }) => {
            setSent(detail ? `${reason} — ${detail}` : reason);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Reject AV' });

    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    /* Nothing chosen: the design fades Reject, so it is disabled. */
    const reject = screen.getByRole('button', { name: 'Reject' });
    await expect(reject).toBeDisabled();

    /* A named reason enables it and explains itself. */
    const select = screen.getByRole('combobox', { name: 'Rejection Reason' });
    await userEvent.selectOptions(select, 'duplicate');
    await expect(reject).toBeEnabled();
    await expect(screen.getByText(/Overlaps with an existing/)).toBeInTheDocument();

    /* `Other` opens the box, and what is typed travels with the rejection. */
    await userEvent.selectOptions(select, 'other');
    const detail = screen.getByRole('textbox', { name: 'Rejection Reason — details' });
    await userEvent.type(detail, 'Raised against the wrong domain');

    await userEvent.click(reject);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Sent: other — Raised against the wrong domain')).toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};
