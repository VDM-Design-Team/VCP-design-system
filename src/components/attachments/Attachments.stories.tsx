import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Attachments } from './Attachments';
import { fileKind, useAttachmentFiles, type AttachmentItem } from '../../lib/attachment-files';

/* A tiny generated picture so the stories need no network. */
const THUMB =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="104" height="72"><rect width="104" height="72" fill="#c6d5f6"/><circle cx="30" cy="26" r="12" fill="#1a56db"/></svg>',
  );

const ITEMS: AttachmentItem[] = [
  { id: 'a', name: 'audit-evidence.pdf', kind: 'pdf' },
  { id: 'b', name: 'screenshot.png', kind: 'image', thumb: THUMB, src: THUMB },
  { id: 'c', name: 'budget.csv', kind: 'csv' },
];

const meta = {
  title: 'Components/Display/Attachments',
  component: Attachments,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A set of attached files as one piece: the cards (`FileAttachment`), the drop area (`Dropzone`) and the viewer (`AttachmentViewer`). ' +
          'It holds no files: `items` in, `onFiles` and `onRemove` out. Removing a card never drops focus.',
      },
    },
  },
  args: { items: ITEMS },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Attachments>;

export default meta;
type Story = StoryObj<typeof meta>;

/** View only: no drop area and no ✕. Pressing a card opens it in the viewer. */
export const ViewOnly: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('list', { name: 'Attachments' })).toBeVisible();
    await expect(c.getAllByRole('listitem')).toHaveLength(3);
    await expect(c.queryByRole('button', { name: /^Remove/ })).toBeNull();
    await expect(c.queryByText('Upload a file')).toBeNull();
  },
};

/** Pressing a card (not its ✕) opens it in the viewer, over whatever is on screen. */
export const OpensInTheViewer: Story = {
  args: { onRemove: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    /* The card names itself through its caption, whose full text is its title. */
    await userEvent.click(c.getByTitle('screenshot.png'));
    await expect(await screen.findByRole('dialog')).toBeVisible();
    await expect(args.onRemove).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};

/** Download is the viewer's button, and appears only when the caller can do it. It names the open file. */
export const Download: Story = {
  args: { onDownload: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByTitle('budget.csv'));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getAllByRole('button', { name: 'Download budget.csv' })[0]!);
    await expect(args.onDownload).toHaveBeenCalledWith(expect.objectContaining({ id: 'c', name: 'budget.csv' }));
  },
};

/** With the picked files held by `useAttachmentFiles`: drop a file and its card appears; its ✕ takes it away. */
function Picker({ initial = [] }: { initial?: AttachmentItem[] }) {
  const picked = useAttachmentFiles();
  const [kept, setKept] = React.useState<AttachmentItem[]>(initial);
  const items = [...kept, ...picked.items];
  return (
    <Attachments
      items={items}
      onFiles={picked.add}
      onRemove={(item) => (kept.some((k) => k.id === item.id) ? setKept((now) => now.filter((k) => k.id !== item.id)) : picked.remove(item.id))}
    />
  );
}

const file = (name: string, type: string, size = 100) => new File([new Uint8Array(size)], name, { type });

export const Edit: Story = {
  render: () => <Picker initial={ITEMS} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('listitem')).toHaveLength(3);
    /* A file is dropped: its card appears, with its glyph from its kind. */
    await userEvent.upload(canvasElement.querySelector('input[type="file"]') as HTMLInputElement, [file('notes.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')]);
    await expect(await c.findByTitle('notes.docx')).toBeVisible();
    await expect(c.getAllByRole('listitem')).toHaveLength(4);
  },
};

/** Removing a card takes its ✕ with it: focus goes to the next card's ✕, else the previous one's, else the drop area. It never falls to the page. */
export const FocusAfterRemove: Story = {
  render: () => <Picker initial={ITEMS} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const remove = async (name: string) => {
      const x = c.getByRole('button', { name: `Remove ${name}` });
      x.focus();
      await userEvent.click(x);
      await waitFor(() => expect(c.queryByRole('button', { name: `Remove ${name}` })).toBeNull());
    };
    /* The first goes: the next card's ✕ takes focus. */
    await remove('audit-evidence.pdf');
    await waitFor(() => expect(c.getByRole('button', { name: 'Remove screenshot.png' })).toHaveFocus());
    /* The last goes: the one before it. */
    await remove('budget.csv');
    await waitFor(() => expect(c.getByRole('button', { name: 'Remove screenshot.png' })).toHaveFocus());
    /* The only one left goes: the drop area. */
    await remove('screenshot.png');
    await waitFor(() => expect(canvasElement.querySelector('input[type="file"]')).toHaveFocus());
  },
};

/** A refused file (too big, or a type it does not take) never reaches the caller; the drop area says why. */
export const RefusesFiles: Story = {
  args: { onFiles: fn(), onReject: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    /* The picker would filter by type; the drop does not, so go through the input with the filter off. */
    await userEvent.upload(input, [file('movie.exe', 'application/octet-stream')], { applyAccept: false });
    await expect(await c.findByText(/movie\.exe is not a file type we take/)).toBeVisible();
    await expect(args.onFiles).not.toHaveBeenCalled();
    await expect(args.onReject).toHaveBeenCalled();
  },
};

/** What only the caller knows, such as an upload that failed, shows under the drop area. */
export const UploadError: Story = {
  args: { onFiles: fn(), error: 'The upload failed. Try again.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('The upload failed. Try again.')).toBeVisible();
  },
};

/** The glyph for a file: by its type, and by its extension when the browser gave none (it often does not, for a .csv or a .docx). A PDF is never an image (hidden, tested). */
export const FileKinds: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <div />,
  play: async () => {
    await expect(fileKind(file('a.png', 'image/png'))).toBe('image');
    await expect(fileKind(file('a.pdf', 'application/pdf'))).toBe('pdf');
    await expect(fileKind(file('a.mov', 'video/quicktime'))).toBe('video');
    await expect(fileKind(file('a.csv', 'text/csv'))).toBe('csv');
    /* No type from the browser: the extension decides. */
    await expect(fileKind(file('budget.csv', ''))).toBe('csv');
    await expect(fileKind(file('Report.PDF', ''))).toBe('pdf');
    await expect(fileKind(file('photo.JPG', ''))).toBe('image');
    await expect(fileKind(file('clip.mp4', ''))).toBe('video');
    await expect(fileKind(file('notes.docx', ''))).toBe('doc');
    await expect(fileKind(file('mystery', ''))).toBe('doc');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
