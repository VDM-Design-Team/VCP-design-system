import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../atoms/button';
import { AttachmentViewer, type AttachmentViewerFile } from './AttachmentViewer';

/* Small inline pictures stand in for uploaded images. */
const picture = (fill: string, accent: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400'><rect width='640' height='400' fill='%23${fill}'/><circle cx='180' cy='140' r='60' fill='%23${accent}'/><path d='M0 400 L220 220 L360 330 L460 250 L640 380 V400Z' fill='%23${accent}'/></svg>`;

const FILES: AttachmentViewerFile[] = [
  { id: 'a', name: 'booth-example.png', kind: 'image', src: picture('fde68a', 'f43f5e') },
  { id: 'b', name: 'flow-diagram.png', kind: 'image', src: picture('c7d2fe', '4f46e5') },
  { id: 'c', name: 'local-testing.pdf', kind: 'pdf' },
  { id: 'd', name: 'notes.docx', kind: 'doc' },
];

const meta = {
  title: 'Components/Overlays/AttachmentViewer',
  component: AttachmentViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A full-screen gallery for the files attached to something: open one, step through the rest with the arrows or the strip of ' +
          'thumbnails, download or close. An image can be zoomed (− + and reset, with the percentage); a PDF shows in the browser\'s own viewer; ' +
          'anything else says there is no preview and offers the download. Built on `Modal` at its `full` size.',
      },
    },
  },
  args: { files: FILES, open: true, defaultIndex: 0, onClose: fn(), onDownload: fn() },
} satisfies Meta<typeof AttachmentViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An image: zoom in and out, reset, and the percentage beside them; "1 of 4" in the header; the strip below. */
export const Image: Story = {
  play: async ({ args }) => {
    const dialog = await screen.findByRole('dialog');
    const view = within(dialog);
    await expect(view.getByRole('heading', { name: 'booth-example.png' })).toBeVisible();
    await expect(view.getByText('1 of 4')).toBeVisible();
    await expect(view.getByText('100%')).toBeVisible();
    await userEvent.click(view.getByRole('button', { name: 'Zoom in' }));
    await expect(view.getByText('125%')).toBeVisible();
    await userEvent.click(view.getByRole('button', { name: 'Reset zoom' }));
    await expect(view.getByText('100%')).toBeVisible();
    await userEvent.click(view.getByRole('button', { name: 'Download booth-example.png' }));
    await expect(args.onDownload).toHaveBeenCalledWith(FILES[0]);
  },
};

/** Stepping: the arrows, the thumbnails and the arrow keys. The first has no previous, the last no next. */
export const Stepping: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async () => {
    const view = within(await screen.findByRole('dialog'));
    await expect(view.getByRole('button', { name: 'Previous attachment' })).toBeDisabled();
    await userEvent.click(view.getByRole('button', { name: 'Next attachment' }));
    await expect(view.getByRole('heading', { name: 'flow-diagram.png' })).toBeVisible();
    await userEvent.keyboard('{ArrowRight}');
    await expect(view.getByRole('heading', { name: 'local-testing.pdf' })).toBeVisible();
    /* A PDF has no zoom of ours: the browser's viewer has its own. */
    await expect(view.queryByRole('group', { name: 'Zoom' })).toBeNull();
    await userEvent.click(view.getByRole('button', { name: 'notes.docx, 4 of 4' }));
    await expect(view.getByRole('heading', { name: 'notes.docx' })).toBeVisible();
    await expect(view.getByRole('button', { name: 'Next attachment' })).toBeDisabled();
    await expect(view.getByText('No preview available for this file.')).toBeVisible();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    await expect(view.getByRole('heading', { name: 'booth-example.png' })).toBeVisible();
  },
};

/** Keys: + and - zoom an image, 0 resets, Escape closes. */
export const Keyboard: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ args }) => {
    const view = within(await screen.findByRole('dialog'));
    await userEvent.keyboard('{+}{+}');
    await expect(view.getByText('150%')).toBeVisible();
    await userEvent.keyboard('{-}');
    await expect(view.getByText('125%')).toBeVisible();
    await userEvent.keyboard('{0}');
    await expect(view.getByText('100%')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(args.onClose).toHaveBeenCalled());
  },
};

/** A file with nothing to show inline says so and offers the download. */
export const NoPreview: Story = {
  args: { defaultIndex: 3 },
  play: async ({ args }) => {
    const view = within(await screen.findByRole('dialog'));
    await expect(view.getByText('No preview available for this file.')).toBeVisible();
    await userEvent.click(view.getByText('Download notes.docx'));
    await expect(args.onDownload).toHaveBeenCalled();
  },
};

/** Opened from a button: closing returns focus to it (Modal's contract). */
export const OpenedFromAButton: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { open: false },
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open attachments</Button>
        <AttachmentViewer {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const opener = within(canvasElement).getByRole('button', { name: 'Open attachments' });
    await userEvent.click(opener);
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(opener).toHaveFocus());
  },
};

/* WCAG 1.4.3 / 1.4.11: text 4.5:1, glyphs and the marks that carry meaning 3:1. axe does not measure icons. */
const channels = (css: string) => css.match(/[\d.]+/g)!.slice(0, 3).map(Number);
const luminance = ([r, g, b]: number[]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The viewer's text and controls hold their contrast on its dark surface (disabled controls are exempt). */
export const ContrastHolds: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async () => {
    const dialog = await screen.findByRole('dialog');
    const view = within(dialog);
    const canvas = channels(getComputedStyle(dialog.querySelector('.dark') as HTMLElement).backgroundColor);
    const colour = (el: HTMLElement) => channels(getComputedStyle(el).color);
    const pill = channels(getComputedStyle(dialog.querySelector('[role="group"]') as HTMLElement).backgroundColor);
    const checks: Array<[string, number[], number[], number]> = [
      ['file name', colour(view.getByRole('heading')), canvas, 4.5],
      ['count', colour(dialog.querySelector('header p') as HTMLElement), canvas, 4.5],
      ['download', colour(view.getByRole('button', { name: /^Download/ })), canvas, 3],
      ['close', colour(view.getByRole('button', { name: 'Close' })), canvas, 3],
      ['next arrow glyph', colour(view.getByRole('button', { name: 'Next attachment' })), canvas, 3],
      [
        'next arrow edge',
        channels(getComputedStyle(view.getByRole('button', { name: 'Next attachment' })).borderTopColor),
        canvas,
        3,
      ],
      ['zoom in', colour(view.getByRole('button', { name: 'Zoom in' })), pill, 3],
      ['percentage', colour(dialog.querySelector('[aria-live]') as HTMLElement), pill, 4.5],
      [
        'open thumbnail mark',
        channels(getComputedStyle(view.getByRole('button', { name: /1 of 4/ })).outlineColor),
        canvas,
        3,
      ],
    ];
    for (const [name, fg, bg, min] of checks) {
      await expect({ name, ok: contrast(fg, bg) >= min }).toEqual({ name, ok: true });
    }
  },
};
