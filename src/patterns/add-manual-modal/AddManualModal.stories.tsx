import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import { AddManualModal } from './AddManualModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/AddManualModal',
  component: AddManualModal,
  parameters: {
    layout: 'centered',
    docs: {
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'The dialog behind Add Manual on the Settings Manuals tab: a name and one or more files, with the shared ' +
          '`Attachments`. Submit checks both and hands over `{ name, files }`; the page uploads them.',
      },
    },
  },
  args: { open: true, onClose: fn(), onSubmit: fn(), hint: 'PDF, DOCX or PPTX, up to 20 MB', accept: '.pdf,.docx,.pptx' },
} satisfies Meta<typeof AddManualModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const file = (name: string, type: string, size = 100) => new File([new Uint8Array(size)], name, { type });
const input = () => document.querySelector('[role="dialog"] input[type="file"]') as HTMLInputElement;

/** The dialog is as tall as what is in it: its body has nothing to scroll to, so no scrollbar shows where scrollbars always show. */
export const Default: Story = {
  play: async () => {
    await screen.findByRole('dialog');
    /* The body is the first box around the drop area that scrolls. */
    let body = input().parentElement as HTMLElement;
    while (getComputedStyle(body).overflowY !== 'auto') body = body.parentElement as HTMLElement;
    await expect(body.scrollHeight).toBe(body.clientHeight);
  },
};

/** Submit with nothing in it: both fields say what's missing, and nothing is handed over. */
export const Required: Story = {
  play: async ({ args }) => {
    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }));
    await expect(await screen.findByText('Give the manual a name.')).toBeVisible();
    await expect(screen.getByText('Add at least one file.')).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** A name and two files: their cards show, and Submit hands over the trimmed name and both files. */
export const Filled: Story = {
  play: async ({ args }) => {
    await userEvent.type(await screen.findByRole('textbox', { name: /Manual Name/ }), '  Onboarding guide ');
    await userEvent.upload(input(), [file('onboarding.pdf', 'application/pdf'), file('slides.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')]);
    await expect(await screen.findByTitle('onboarding.pdf')).toBeVisible();
    await expect(screen.getByTitle('slides.pptx')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
    const draft = (args.onSubmit as ReturnType<typeof fn>).mock.calls[0][0];
    await expect(draft.name).toBe('Onboarding guide');
    await expect(draft.files.map((f: File) => f.name)).toEqual(['onboarding.pdf', 'slides.pptx']);
  },
};

/** The upload is in flight: Submit spins and the fields lock. */
export const Submitting: Story = { args: { submitting: true } };

/** What only the server knows, under its field. */
export const ServerError: Story = {
  args: { errors: { name: 'A manual with this name already exists.', files: 'The upload failed. Try again.' } },
  play: async () => {
    await expect(await screen.findByText('A manual with this name already exists.')).toBeVisible();
    await expect(screen.getByText('The upload failed. Try again.')).toBeVisible();
  },
};

/** From its button: Cancel closes it, focus goes back to Add Manual, and the next opening starts empty. */
export const FromButton: Story = {
  args: { open: false },
  render: function Render(args) {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add Manual</Button>
        <AddManualModal {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  play: async ({ canvas }) => {
    const opener = canvas.getByRole('button', { name: 'Add Manual' });
    await userEvent.click(opener);
    await userEvent.type(await screen.findByRole('textbox', { name: /Manual Name/ }), 'Draft');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(opener).toHaveFocus());
    await userEvent.click(opener);
    await expect(await screen.findByRole('textbox', { name: /Manual Name/ })).toHaveValue('');
  },
};
