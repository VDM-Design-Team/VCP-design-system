import type { Meta, StoryObj } from '@storybook/react-vite';
import { AttachmentPreview } from './AttachmentPreview';

const IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280"><rect width="480" height="280" fill="#c6d5f6"/><circle cx="120" cy="90" r="44" fill="#1a56db"/><path d="M0 280 160 120l120 96 56-40 144 104z" fill="#1441a4"/></svg>',
  );

const meta = {
  title: 'Display/AttachmentPreview',
  component: AttachmentPreview,
  parameters: {
    docs: {
      description: {
        component:
          'The opened attachment: a header naming the file with download/close affordances ' +
          '(the system’s own IconButtons), and a body showing the image — or an honest "No ' +
          'inline preview" with download as the real path. An inline panel: wrap it in ' +
          '`Modal` when it should interrupt.',
      },
    },
  },
  args: { name: 'dock-photo.png', size: '840 KB', src: IMAGE },
  argTypes: {
    kind: { control: 'radio', options: ['image', 'doc'] },
  },
} satisfies Meta<typeof AttachmentPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full anatomy: name, size, download, close, image body. */
export const Default: Story = {
  args: { onDownload: () => {}, onClose: () => {} },
  render: (args) => (
    <div className="w-128">
      <AttachmentPreview {...args} />
    </div>
  ),
};

/** No inline preview is an honest state, and download is the way through. */
export const Document: Story = {
  args: {
    name: 'audit-evidence.pdf',
    size: '1.2 MB',
    kind: 'doc',
    src: undefined,
    onDownload: () => {},
    onClose: () => {},
  },
  render: (args) => (
    <div className="w-128">
      <AttachmentPreview {...args} />
    </div>
  ),
};

/** Header affordances are optional — a read-only embed keeps just the name. */
export const ReadOnly: Story = {
  render: (args) => (
    <div className="w-128">
      <AttachmentPreview {...args} />
    </div>
  ),
};

/** Panel, header and body are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <AttachmentPreview {...args} onDownload={() => {}} onClose={() => {}} />
          </div>
        </div>
      ))}
    </div>
  ),
};
