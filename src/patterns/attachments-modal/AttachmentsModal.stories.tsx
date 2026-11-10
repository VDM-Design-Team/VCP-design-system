import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import { AttachmentsModal } from './AttachmentsModal';

const FILES = [
  { id: 'a', name: '2)-Current-State-Of-The-Product-Flow.pdf', kind: 'pdf' as const },
  { id: 'b', name: 'image.png', kind: 'image' as const },
];

const meta = {
  title: 'Patterns/AttachmentsModal',
  component: AttachmentsModal,
  parameters: {
    layout: 'centered',
    docs: {
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'Adding files to an Added Value: the files already attached as cards (removable, and opening a preview on click), the drop area, and Upload, which sends what was just picked and what was removed. Removing a file already attached is staged until Upload (or Save); Cancel undoes it.',
      },
    },
  },
  args: { open: true, onClose: fn(), onUpload: fn() },
} satisfies Meta<typeof AttachmentsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = () => within(screen.getByRole('dialog', { name: 'Attachments' }));

/** Figma's `Attachment_Modal`: the title, the drop area and Upload (nothing picked, so it waits). */
export const Empty: Story = {
  play: async () => {
    const d = dialog();
    await expect(d.getByText('Upload a file')).toBeVisible();
    await expect(d.getByRole('button', { name: 'Upload' })).toBeDisabled();
  },
};

/** Figma's Example: the files already attached sit above the drop area; hovering a card shows its ✕. */
export const WithFiles: Story = {
  args: { attachments: FILES },
  play: async () => {
    const d = dialog();
    await expect(d.getByRole('button', { name: 'Remove image.png' })).toBeInTheDocument();
  },
};

/** The ✕ on a file already attached is **staged**: the card goes, and nothing is removed until Save. Cancel undoes it. */
export const RemovingAFile: Story = {
  args: { attachments: FILES },
  play: async ({ args }) => {
    const d = dialog();
    await expect(d.getByRole('button', { name: 'Upload' })).toBeDisabled();
    await userEvent.click(d.getByRole('button', { name: 'Remove image.png' }));
    await expect(d.queryByRole('button', { name: 'Remove image.png' })).toBeNull();
    /* Nothing is sent yet; the only change is a removal, so the button says Save. */
    await expect(args.onUpload).not.toHaveBeenCalled();
    const save = d.getByRole('button', { name: 'Save' });
    await expect(save).toBeEnabled();
    await userEvent.click(save);
    await expect(args.onUpload).toHaveBeenCalledWith({ files: [], removed: [expect.objectContaining({ id: 'b' })] });
  },
};

/** Cancel puts a staged removal back: the dialog reopens with the file still there, and nothing was sent. */
export const CancelUndoesARemoval: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { attachments: FILES, open: false },
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open</button>
        <AttachmentsModal {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open' }));
    await userEvent.click(await within(screen.getByRole('dialog', { name: 'Attachments' })).findByRole('button', { name: 'Remove image.png' }));
    await userEvent.click(dialog().getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Attachments' })).toBeNull());
    await expect(args.onUpload).not.toHaveBeenCalled();
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open' }));
    await expect(await dialog().findByRole('button', { name: 'Remove image.png' })).toBeInTheDocument();
  },
};

/** The ✕ takes its card with it, so focus moves on: the next card's ✕, else the previous one's, else the drop area. It never falls to the page. */
export const FocusAfterRemove: Story = {
  args: { attachments: FILES },
  play: async () => {
    const d = dialog();
    const first = d.getByRole('button', { name: `Remove ${FILES[0]!.name}` });
    first.focus();
    await userEvent.click(first);
    await waitFor(() => expect(d.getByRole('button', { name: 'Remove image.png' })).toHaveFocus());
    await userEvent.click(d.getByRole('button', { name: 'Remove image.png' }));
    await waitFor(() => expect(document.querySelector('input[type="file"]')).toHaveFocus());
  },
};

/** Clicking a card (not its ✕) opens the preview over the dialog; Escape closes only the preview. */
export const PreviewingAFile: Story = {
  args: { attachments: FILES },
  play: async () => {
    const d = dialog();
    await userEvent.click(await d.findByText(/image/, { selector: 'button *' }));
    await expect(await screen.findByRole('dialog', { name: 'Attachment: image.png' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Attachment: image.png' })).toBeNull());
    await expect(screen.getByRole('dialog', { name: 'Attachments' })).toBeVisible();
  },
};

/** Picked files become cards; Upload enables and sends only those (and what was removed, none here). */
export const PickingAndUploading: Story = {
  args: { attachments: FILES },
  play: async ({ args }) => {
    const d = dialog();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'notes.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, file);
    await expect(await d.findByRole('button', { name: 'Remove notes.pdf' })).toBeInTheDocument();
    await userEvent.click(d.getByRole('button', { name: 'Upload' }));
    await waitFor(() => expect(args.onUpload).toHaveBeenCalled());
    const sent = (args.onUpload as ReturnType<typeof fn>).mock.calls[0][0] as { files: File[]; removed: unknown[] };
    await expect(sent.files.map((f) => f.name)).toEqual(['notes.pdf']);
    await expect(sent.removed).toEqual([]);
  },
};

/** A PDF just picked gets a document glyph, not an image one, and the card is named for the file. */
export const PickedPdfIsNotAnImage: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async () => {
    const d = dialog();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(['x'], 'plan.pdf', { type: 'application/pdf' }));
    const card = await d.findByTitle('plan.pdf');
    await expect(card.querySelector('img')).toBeNull();
  },
};

/** An upload that failed says so under the drop area, and keeps the files so it can be tried again. */
export const UploadFailed: Story = {
  args: { error: 'The upload failed. Try again.' },
  play: async () => {
    await expect(dialog().getByText('The upload failed. Try again.')).toBeVisible();
  },
};

/** A dialog left open after an upload has nothing left to send: once it settles without an error the picked files are cleared, so Upload cannot send them twice. */
export const NotSentTwice: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: (args) => {
    const [loading, setLoading] = React.useState(false);
    return (
      <AttachmentsModal
        {...args}
        loading={loading}
        onUpload={(change) => {
          args.onUpload(change);
          setLoading(true);
          setTimeout(() => setLoading(false), 200);
        }}
      />
    );
  },
  play: async ({ args }) => {
    const d = dialog();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(['x'], 'once.pdf', { type: 'application/pdf' }));
    await userEvent.click(await d.findByRole('button', { name: 'Upload' }));
    await waitFor(() => expect(d.queryByTitle('once.pdf')).toBeNull(), { timeout: 2000 });
    await expect(d.getByRole('button', { name: 'Upload' })).toBeDisabled();
    await expect(args.onUpload).toHaveBeenCalledTimes(1);
  },
};

export const Uploading: Story = { args: { attachments: FILES, loading: true } };

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { args: { attachments: FILES }, globals: { theme: 'dark' } };
