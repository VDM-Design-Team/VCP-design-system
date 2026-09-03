import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileAttachment } from './FileAttachment';

/* A tiny generated thumbnail so the story needs no network. */
const THUMB =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="104" height="72"><rect width="104" height="72" fill="#c6d5f6"/><circle cx="30" cy="26" r="12" fill="#1a56db"/><path d="M0 72 40 36l30 24 14-10 20 22z" fill="#1441a4"/></svg>',
  );

const meta = {
  title: 'Components/Display/FileAttachment',
  component: FileAttachment,
  parameters: {
    docs: {
      description: {
        component:
          'One attached file as a tile: thumbnail or kind glyph, name, size, optional open ' +
          'and remove. The openable area is a real button and the ✕ is its own sibling tab ' +
          'stop, revealed by hover *or focus* — the export mounted it on hover only, which no ' +
          'keyboard can do. `Dropzone` is how files arrive; `AttachmentPreview` is where ' +
          'opening one leads.',
      },
    },
  },
  args: { name: 'audit-evidence.pdf', size: '1.2 MB', kind: 'pdf' },
  argTypes: {
    kind: { control: 'radio', options: ['image', 'pdf', 'doc', 'csv', 'video'] },
  },
} satisfies Meta<typeof FileAttachment>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No handlers: a passive tile in a read-only list. */
export const Default: Story = {};

/** `thumb` shows the image itself; the name below stays the caption. */
export const WithThumbnail: Story = {
  args: { name: 'dock-photo.png', size: '840 KB', kind: 'image', thumb: THUMB },
};

/**
 * Openable and removable: two buttons, two tab stops. Tab to the tile and
 * again to the ✕ — it appears on focus, not just hover.
 */
export const OpenAndRemove: Story = {
  render: (args) => {
    const [gone, setGone] = React.useState(false);
    if (gone)
      return (
        <span className="font-sans text-body-sm text-text-subtle">
          Removed — reload the story.
        </span>
      );
    return <FileAttachment {...args} onClick={() => {}} onRemove={() => setGone(true)} />;
  },
};

/** A gallery row — the natural habitat, under a comment or in an evidence panel. */
export const GalleryRow: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <FileAttachment name="dock-photo.png" size="840 KB" kind="image" thumb={THUMB} onClick={() => {}} />
      <FileAttachment name="audit-evidence.pdf" size="1.2 MB" kind="pdf" onClick={() => {}} />
      <FileAttachment name="capacity-export.csv" size="18 KB" kind="csv" onClick={() => {}} />
      <FileAttachment name="line-walkthrough.mp4" size="24 MB" kind="video" onClick={() => {}} />
    </div>
  ),
};

/** A long name truncates; the full name stays in the tooltip and the ✕'s label. */
export const LongName: Story = {
  args: { name: 'supplier-consolidation-proposal-final-v3-revised.pdf' },
  render: (args) => <FileAttachment {...args} onRemove={() => {}} />,
};

/** Tiles and glyphs are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex gap-3 bg-surface-canvas p-8">
            <FileAttachment name="dock-photo.png" size="840 KB" kind="image" thumb={THUMB} />
            <FileAttachment name="audit-evidence.pdf" size="1.2 MB" kind="pdf" onRemove={() => {}} />
          </div>
        </div>
      ))}
    </div>
  ),
};
