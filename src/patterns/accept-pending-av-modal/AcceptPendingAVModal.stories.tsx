import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { AcceptPendingAVModal } from './AcceptPendingAVModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/AcceptPendingAVModal',
  component: AcceptPendingAVModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The confirmation an admin answers to accept a pending Added Value, and the one decision ' +
          'that comes with it: whether the value is **multipart**. A benign confirmation, unlike ' +
          'the delete one — Cancel is the brand-outlined `secondary` rather than the grey ' +
          '`neutral`, and a backdrop click closes it. The stories that show the look render open, ' +
          'as `Modal`’s do.',
      },
    },
  },
  args: {
    open: true,
    onClose: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof AcceptPendingAVModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As it opens: multipart unchecked, the card in its resting state. */
export const Default: Story = {};

/** Checked. The card takes the brand border and tint — the design's Selected state. */
export const MultipartSelected: Story = {
  args: { multipart: true },
};

/** `showMultipart={false}` — the design draws the dialog without the card too. */
export const WithoutMultipart: Story = {
  args: { showMultipart: false },
};

/** The accept is in flight. Confirm spins and cannot be pressed twice. */
export const Accepting: Story = {
  args: { loading: true },
};

/** Every colour is a token. The dialog portals to `body`, so the theme global is what reaches it. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
};

/**
 * Ticking multipart and confirming. The decision travels with the answer, so
 * the caller never has to read it back off the dialog.
 */
export const AcceptingIt: Story = {
  args: { open: false },
  render: function AcceptingItStory(args) {
    const [open, setOpen] = React.useState(false);
    const [multipart, setMultipart] = React.useState(false);
    const [result, setResult] = React.useState('nothing yet');
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Accept AV
        </Button>
        <p className="text-body-sm text-text-tertiary">Result: {result}</p>
        <AcceptPendingAVModal
          {...args}
          open={open}
          multipart={multipart}
          onMultipartChange={setMultipart}
          onClose={() => {
            setResult('cancelled');
            setOpen(false);
          }}
          onConfirm={({ multipart: isMultipart }) => {
            setResult(isMultipart ? 'accepted, multipart' : 'accepted, single');
            setOpen(false);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Accept AV' });

    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    /* The checkbox is named by its title, and explained by its subtitle. */
    const multipart = screen.getByRole('checkbox', { name: 'Multipart Value' });
    await expect(multipart).not.toBeChecked();
    await expect(multipart).toHaveAccessibleDescription(/Split this value into parts/);

    /* No close button — the two answers and Escape are the way out. */
    await expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

    /* The whole card is the label, so clicking the explanation ticks it. */
    await userEvent.click(screen.getByText(/Split this value into parts/));
    await expect(multipart).toBeChecked();

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Result: accepted, multipart')).toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    /* Nothing is destroyed by closing, so the backdrop closes it. */
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(dialog.parentElement as HTMLElement);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Result: cancelled')).toBeInTheDocument();
  },
};
