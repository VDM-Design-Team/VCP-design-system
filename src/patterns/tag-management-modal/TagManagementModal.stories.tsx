import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import { TagManagementModal } from './TagManagementModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/TagManagementModal',
  component: TagManagementModal,
  parameters: {
    layout: 'centered',
    docs: {
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'The dialogs behind Tag Management: add a tag, add a domain, confirm deleting a domain. ' +
          '`type` picks one; the add forms share a shape, the delete is an alert dialog.',
      },
    },
  },
  args: { open: true, type: 'tag', onClose: fn(), onSubmit: fn(), onConfirm: fn() },
  argTypes: { type: { control: 'radio', options: ['tag', 'domain', 'delete-domain'] } },
} satisfies Meta<typeof TagManagementModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddTag: Story = {};

export const AddDomain: Story = { args: { type: 'domain' } };

export const DeleteDomain: Story = { args: { type: 'delete-domain' } };

/** Not in the Figma: the pencil's dialog is the add form, reused — name prefilled, Save off until it changes. */
export const RenameTag: Story = { args: { mode: 'edit', initialName: 'Bug' } };

export const Submitting: Story = { args: { loading: true, type: 'domain' } };

export const DarkTheme: Story = { globals: { theme: 'dark' } };

/** Type a name and send it: trimmed, once, and Submit stays off until there is one. */
export const AddingATag: Story = {
  args: { open: false },
  render: function Story(args) {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Add New
        </Button>
        <TagManagementModal {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Add New' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add a new Tag' });
    const submit = within(dialog).getByRole('button', { name: 'Submit' });
    await expect(submit).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText('Tag Name'), '  Bug  ');
    await userEvent.click(submit);
    await expect(args.onSubmit).toHaveBeenCalledWith('Bug');
  },
};

/** A backdrop click does nothing here; Escape closes it, Confirm answers yes. */
export const ConfirmingTheDelete: Story = {
  args: { open: false, type: 'delete-domain' },
  render: AddingATag.render,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Add New' }));
    const dialog = await screen.findByRole('alertdialog', {
      name: 'Are you sure you want to delete this domain?',
    });
    /* The backdrop is the dialog's parent grid; clicking it must not close it. */
    await userEvent.click(dialog.parentElement as HTMLElement);
    await expect(args.onClose).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  },
};
