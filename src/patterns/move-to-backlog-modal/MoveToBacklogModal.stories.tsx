import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import { MoveToBacklogModal } from './MoveToBacklogModal';

const meta = {
  title: 'Patterns/MoveToBacklogModal',
  component: MoveToBacklogModal,
  parameters: {
    layout: 'centered',
    docs: {
      story: OVERLAY_DOCS_STORY,
      description: { component: 'Moving an Added Value to the Backlog, with the Feedback that says why (required): one field, Cancel and Move to Backlog.' },
    },
  },
  args: { open: true, onClose: fn(), onMove: fn() },
} satisfies Meta<typeof MoveToBacklogModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = () => within(screen.getByRole('dialog', { name: 'Move Added Value to Backlog' }));

/** Figma's `Move_Backlog_Modal`: the Feedback field, Cancel and Move to Backlog. Feedback is required, so Move to Backlog waits until something is typed. */
export const Default: Story = {
  play: async () => {
    const d = dialog();
    await expect(d.getByRole('textbox', { name: /^Feedback/ })).toHaveValue('');
    await expect(d.getByRole('button', { name: 'Move to Backlog' })).toBeDisabled();
  },
};

/** It opens with the cursor in Feedback, so typing goes straight in and Enter moves it. */
export const OpensInFeedback: Story = {
  play: async ({ args }) => {
    const field = dialog().getByRole('textbox', { name: /^Feedback/ });
    await waitFor(() => expect(field).toHaveFocus());
    await userEvent.keyboard('Not this cycle{Enter}');
    await waitFor(() => expect(args.onMove).toHaveBeenCalledWith('Not this cycle'));
  },
};

/** Typed feedback goes with the move, trimmed. */
export const WithFeedback: Story = {
  play: async ({ args }) => {
    const d = dialog();
    await userEvent.type(d.getByRole('textbox', { name: /^Feedback/ }), '  Not this cycle ');
    await userEvent.click(d.getByRole('button', { name: 'Move to Backlog' }));
    await waitFor(() => expect(args.onMove).toHaveBeenCalledWith('Not this cycle'));
  },
};

/** Nothing typed, or spaces alone: the button stays off and Enter does nothing. */
export const WithoutFeedback: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ args }) => {
    const d = dialog();
    const field = d.getByRole('textbox', { name: /^Feedback/ });
    await waitFor(() => expect(field).toHaveFocus());
    await userEvent.keyboard('   {Enter}');
    await expect(d.getByRole('button', { name: 'Move to Backlog' })).toBeDisabled();
    await expect(args.onMove).not.toHaveBeenCalled();
  },
};

export const Cancelling: Story = {
  play: async ({ args }) => {
    await userEvent.click(dialog().getByRole('button', { name: 'Cancel' }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const Moving: Story = { args: { loading: true } };

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
