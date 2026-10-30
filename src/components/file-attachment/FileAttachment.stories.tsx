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
          'One attached file as a card: kind glyph and name, optional open ' +
          'and remove. The openable area is a real button and the ✕ is its own sibling tab ' +
          'stop, revealed by hover *or focus* — the export mounted it on hover only, which no ' +
          'keyboard can do. `Dropzone` is how files arrive; `AttachmentPreview` is where ' +
          'opening one leads.',
      },
    },
  },
  args: { name: 'audit-evidence.pdf', kind: 'pdf' },
  argTypes: {
    kind: { control: 'radio', options: ['image', 'pdf', 'doc', 'csv', 'video'] },
  },
} satisfies Meta<typeof FileAttachment>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No handlers: a passive tile in a read-only list. */
export const Default: Story = {};

/** `thumb` shows the image in the glyph's place, at the glyph's size. */
export const WithThumbnail: Story = {
  args: { name: 'dock-photo.png', kind: 'image', thumb: THUMB },
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
        <span className="font-sans text-caption-md-regular text-text-subtle">
          Removed — reload the story.
        </span>
      );
    return <FileAttachment {...args} onClick={() => {}} onRemove={() => setGone(true)} />;
  },
};

/**
 * `domain` adds the corner badge for an AV handed over from another domain —
 * the domain's glyph and code, in a fixed neutral-tonal pill. Hover a card to
 * see it fill; press and hold to see the deeper fill.
 */
export const WithDomainLabel: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <FileAttachment {...args} domain="design" onClick={() => {}} />
      <FileAttachment {...args} name="capacity-export.csv" kind="csv" onClick={() => {}} />
    </div>
  ),
};

/** All six domains: Design DS, Development DV, Governance GV, Content CN, Partners PT, QA QA. */
export const Domains: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <FileAttachment name="brand-guide.pdf" kind="pdf" domain="design" onClick={() => {}} />
      <FileAttachment name="release-notes.pdf" kind="pdf" domain="development" onClick={() => {}} />
      <FileAttachment name="policy-draft.pdf" kind="pdf" domain="governance" onClick={() => {}} />
      <FileAttachment name="hero-image.png" kind="image" domain="content" onClick={() => {}} />
      <FileAttachment name="contract-signed.pdf" kind="pdf" domain="partners" onClick={() => {}} />
      <FileAttachment name="test-report.pdf" kind="pdf" domain="qa" onClick={() => {}} />
    </div>
  ),
};

/**
 * The edit-mode states, one hover at a time: hover the card (fills, ✕ appears);
 * hover the ✕ (the card stays unfilled, the ✕ takes its hover fill); press the card
 * (deeper fill, no ✕). Without `onRemove` it is view mode: hover and pressed fills
 * only, no ✕.
 */
export const EditAndViewMode: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-24 font-sans text-caption-md-medium text-text-tertiary">Edit mode</span>
        <FileAttachment name="audit-evidence.pdf" kind="pdf" domain="design" onClick={() => {}} onRemove={() => {}} />
        <FileAttachment name="remove-only.csv" kind="csv" onRemove={() => {}} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 font-sans text-caption-md-medium text-text-tertiary">View mode</span>
        <FileAttachment name="audit-evidence.pdf" kind="pdf" domain="design" onClick={() => {}} />
      </div>
    </div>
  ),
};

/** A gallery row — the natural habitat, under a comment or in an evidence panel. */
export const GalleryRow: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <FileAttachment name="dock-photo.png" kind="image" thumb={THUMB} onClick={() => {}} />
      <FileAttachment name="audit-evidence.pdf" kind="pdf" onClick={() => {}} />
      <FileAttachment name="capacity-export.csv" kind="csv" onClick={() => {}} />
      <FileAttachment name="line-walkthrough.mp4" kind="video" onClick={() => {}} />
    </div>
  ),
};

/**
 * A long name shortens its stem and keeps the extension; a short one stays
 * centred under the glyph. The full name stays in the tooltip and the ✕'s label.
 */
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
            <FileAttachment name="dock-photo.png" kind="image" thumb={THUMB} />
            <FileAttachment name="audit-evidence.pdf" kind="pdf" onRemove={() => {}} />
          </div>
        </div>
      ))}
    </div>
  ),
};
