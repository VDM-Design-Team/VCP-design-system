import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ChildPartModal } from './ChildPartModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/ChildPartModal',
  component: ChildPartModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Asks for the title of a new part before it is added to a multipart Added Value. A blank title is allowed — the page works out ' +
          'the default. On a completed Added Value, a banner warns that the status will change.',
      },
    },
  },
  args: { open: true, onClose: fn(), onConfirm: fn() },
} satisfies Meta<typeof ChildPartModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = () => within(document.body);
const dialog = (name = 'Add a New Child Part to Multipart AV') => within(body().getByRole('dialog', { name }));

/** Figma's dialog: one Title field and Cancel / Confirm. The placeholder says a blank title is fine. */
export const Default: Story = {
  play: async ({ args }) => {
    const d = dialog();
    await expect(d.getByPlaceholderText(/leave blank for/)).toBeVisible();
    await expect(d.queryByText('Status will change')).toBeNull();
    await userEvent.click(d.getByRole('button', { name: 'Confirm' }));
    /* Blank is allowed: it asks with an empty title. */
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledWith(''));
    await userEvent.click(d.getByRole('button', { name: 'Cancel' }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};

/** A typed title is trimmed, and Enter confirms. */
export const WithATitle: Story = {
  play: async ({ args }) => {
    const d = dialog();
    await userEvent.type(d.getByRole('textbox', { name: 'Title' }), '  Backend  {Enter}');
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledWith('Backend'));
  },
};

/** Figma's taller variant: a completed Added Value is returned to In Progress, and a warning says so. */
export const StatusWillChange: Story = {
  args: { statusChange: { from: 'Completed', to: 'In Progress' } },
  play: async () => {
    const d = dialog();
    await expect(d.getByText('Status will change')).toBeVisible();
    await expect(d.getByText(/The status of this AV is Completed\. If a new child part is added, the AV will be returned to In Progress\./)).toBeVisible();
  },
};

/** Figma's third variant: renaming a part. The field shows the current title, and the action is **Save**. */
export const EditTitle: Story = {
  args: { mode: 'edit', initialTitle: 'Current child part title is shown here' },
  play: async ({ args }) => {
    const d = dialog('Edit Child Part Title');
    await expect(d.getByRole('textbox', { name: 'Title' })).toHaveValue('Current child part title is shown here');
    await expect(d.queryByText('Status will change')).toBeNull();
    await userEvent.clear(d.getByRole('textbox', { name: 'Title' }));
    await userEvent.type(d.getByRole('textbox', { name: 'Title' }), 'Backend work');
    await userEvent.click(d.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledWith('Backend work'));
  },
};

/** Clearing the title and saving is allowed: it asks with an empty title, and the page puts the default back ("(X/X) Parent AV Title"). */
export const EditTitleBlank: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { mode: 'edit', initialTitle: 'Old title' },
  play: async ({ args }) => {
    const d = dialog('Edit Child Part Title');
    await userEvent.clear(d.getByRole('textbox', { name: 'Title' }));
    await userEvent.click(d.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledWith(''));
  },
};

/** What only the server knows. */
export const WithAnError: Story = {
  args: { error: 'A part with that title already exists.' },
  play: async () => {
    const d = dialog();
    await expect(d.getByText('A part with that title already exists.')).toBeVisible();
    await expect(d.getByRole('textbox', { name: 'Title' })).toHaveAttribute('aria-invalid', 'true');
  },
};

/** Confirm is in flight: the button spins and the field locks. */
export const Confirming: Story = {
  args: { confirming: true },
  play: async () => {
    const d = dialog();
    await expect(d.getByRole('textbox', { name: 'Title' })).toBeDisabled();
    await expect(d.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  },
};

/** Closed and reopened, it starts empty. */
export const ResetsWhenReopened: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { open: false },
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <ChildPartModal {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open' }));
    await userEvent.type(await body().findByRole('textbox', { name: 'Title' }), 'Half typed');
    await userEvent.click(body().getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open' }));
    await expect(await body().findByRole('textbox', { name: 'Title' })).toHaveValue('');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' }, args: { statusChange: { from: 'Completed', to: 'In Progress' } } };
