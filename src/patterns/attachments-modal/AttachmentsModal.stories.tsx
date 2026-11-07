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
          'Adding files to an Added Value: the files already attached as cards (removable, and opening a preview on click), the drop area, and Upload, which sends only what was just picked.',
      },
    },
  },
  args: { open: true, onClose: fn(), onUpload: fn(), onRemoveAttachment: fn() },
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

/** The ✕ removes a file that was already attached, and says so. */
export const RemovingAFile: Story = {
  args: { attachments: FILES },
  play: async ({ args }) => {
    const d = dialog();
    await userEvent.click(d.getByRole('button', { name: 'Remove image.png' }));
    await expect(d.queryByRole('button', { name: 'Remove image.png' })).toBeNull();
    await expect(args.onRemoveAttachment).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
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

/** Picked files become cards; Upload enables and sends only those. */
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
    const sent = (args.onUpload as ReturnType<typeof fn>).mock.calls[0][0] as File[];
    await expect(sent.map((f) => f.name)).toEqual(['notes.pdf']);
  },
};

export const Uploading: Story = { args: { attachments: FILES, loading: true } };

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { args: { attachments: FILES }, globals: { theme: 'dark' } };
