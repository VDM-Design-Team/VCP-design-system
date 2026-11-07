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
      description: { component: 'Moving an Added Value to the Backlog, with the optional Feedback that says why: one field, Cancel and Move to Backlog.' },
    },
  },
  args: { open: true, onClose: fn(), onMove: fn() },
} satisfies Meta<typeof MoveToBacklogModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = () => within(screen.getByRole('dialog', { name: 'Move Added Value to Backlog' }));

/** Figma's `Move_Backlog_Modal`: the Feedback field, Cancel and Move to Backlog (always available — the feedback is optional). */
export const Default: Story = {
  play: async () => {
    const d = dialog();
    await expect(d.getByRole('textbox', { name: 'Feedback' })).toHaveValue('');
    await expect(d.getByRole('button', { name: 'Move to Backlog' })).toBeEnabled();
  },
};

/** Typed feedback goes with the move; blank is `''`. */
export const WithFeedback: Story = {
  play: async ({ args }) => {
    const d = dialog();
    await userEvent.type(d.getByRole('textbox', { name: 'Feedback' }), 'Not this cycle');
    await userEvent.click(d.getByRole('button', { name: 'Move to Backlog' }));
    await waitFor(() => expect(args.onMove).toHaveBeenCalledWith('Not this cycle'));
  },
};

export const WithoutFeedback: Story = {
  play: async ({ args }) => {
    await userEvent.click(dialog().getByRole('button', { name: 'Move to Backlog' }));
    await waitFor(() => expect(args.onMove).toHaveBeenCalledWith(''));
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
