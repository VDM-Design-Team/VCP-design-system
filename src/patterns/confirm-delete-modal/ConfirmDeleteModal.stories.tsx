import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/ConfirmDeleteModal',
  component: ConfirmDeleteModal,
  parameters: {
    layout: 'centered',
    docs: {
      /* Each story in its own frame, or the Docs page stacks every open dialog. */
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'The confirmation anything has to pass before it is deleted — a user, a contact, a domain. An **alert layout**: ' +
          'a warning glyph, the question, the consequence and the item’s own name, all centred. Not dismissible by a ' +
          'backdrop click; Escape still closes it. It asks and reports; it deletes nothing.',
      },
    },
  },
  args: {
    open: true,
    itemLabel: 'User',
    itemName: 'John',
    onClose: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof ConfirmDeleteModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A user. The field says what kind of thing it is and which one, so nobody deletes the wrong one. */
export const Default: Story = {
  play: async ({ args }) => {
    const dialog = screen.getByRole('alertdialog', { name: 'Are you sure you want to delete?' });
    await expect(within(dialog).getByRole('textbox', { name: 'User' })).toHaveValue('John');
    await expect(within(dialog).getByRole('textbox', { name: 'User' })).toHaveAttribute('readonly');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

/** The same dialog for a contact: only the word and the name change. */
export const Contact: Story = {
  args: { itemLabel: 'Contact', itemName: 'john@vdm.technology' },
  play: async () => {
    const dialog = screen.getByRole('alertdialog');
    await expect(within(dialog).getByRole('textbox', { name: 'Contact' })).toHaveValue('john@vdm.technology');
  },
};

/** Cancel and Escape close it; a click on the backdrop does not (a stray click must not delete anything). */
export const Dismissing: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Delete John</Button>
        <ConfirmDeleteModal {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  play: async () => {
    await expect(screen.getByRole('alertdialog')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  },
};

/** While the delete is in flight, the destructive button spins. */
export const Deleting: Story = {
  args: { loading: true },
  play: async () => {
    await expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('aria-busy', 'true');
  },
};

/** The words are the page's to change. */
export const CustomWords: Story = {
  args: {
    title: 'Delete this domain?',
    description: 'Every tag in it goes too.',
    confirmLabel: 'Delete domain',
    cancelLabel: 'Keep it',
    itemLabel: 'Domain',
    itemName: 'Design',
  },
};
