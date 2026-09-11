import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { ConfirmDeleteAVModal } from './ConfirmDeleteAVModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/ConfirmDeleteAVModal',
  component: ConfirmDeleteAVModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The confirmation an Added Value has to pass before it is deleted. An **alert layout**, ' +
          'not the dialog layout `Modal` draws by default: a warning glyph, the question, the ' +
          'consequence, and the AV’s own title, all centred. Not dismissible by a backdrop click; ' +
          'Escape still closes it. The stories that show the look render open, as `Modal`’s do.',
      },
    },
  },
  args: {
    open: true,
    avTitle: 'Add Value Title Goes Here',
    onClose: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof ConfirmDeleteAVModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The design's own content, at the design's own width. */
export const Default: Story = {};

/** A real AV title, which is what the field is for — seeing what is about to go. */
export const WithARealTitle: Story = {
  args: { avTitle: 'VCP-1234 — Cut the onboarding form to four fields' },
};

/** The delete is in flight. The destructive button spins and cannot be pressed twice. */
export const Deleting: Story = {
  args: { loading: true },
};

/** Every colour is a token. The dialog portals to `body`, so the theme global is what reaches it. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
};

/**
 * The two answers, and the two ways out that are not answers. A backdrop click
 * must not delete anything, so it does nothing at all here — but Escape still
 * closes, because a keyboard user is never sealed in.
 */
export const AnsweringIt: Story = {
  args: { open: false },
  render: function AnsweringItStory(args) {
    const [open, setOpen] = React.useState(false);
    const [answered, setAnswered] = React.useState<string>('nothing yet');
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Delete claim
        </Button>
        <p className="text-body-sm text-text-tertiary">Answered: {answered}</p>
        <ConfirmDeleteAVModal
          {...args}
          open={open}
          onClose={() => {
            setAnswered('cancelled');
            setOpen(false);
          }}
          onConfirm={() => {
            setAnswered('deleted');
            setOpen(false);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Delete claim' });

    await userEvent.click(trigger);
    const dialog = await screen.findByRole('alertdialog');

    /* An alertdialog announces its consequence, so it must carry one. */
    await expect(dialog).toHaveAttribute('aria-describedby');
    /* No close button: the two answers and Escape are the only ways out. */
    await expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    /* The AV being deleted is named, and cannot be edited. */
    await expect(screen.getByDisplayValue('Add Value Title Goes Here')).toHaveAttribute('readonly');

    /* A stray click on the backdrop deletes nothing. */
    await userEvent.click(dialog.parentElement as HTMLElement);
    await expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    /* Escape is a cancel, not a delete. */
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Answered: cancelled')).toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    /* And the destructive answer reports itself. */
    await userEvent.click(trigger);
    await screen.findByRole('alertdialog');
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Answered: deleted')).toBeInTheDocument();
  },
};
