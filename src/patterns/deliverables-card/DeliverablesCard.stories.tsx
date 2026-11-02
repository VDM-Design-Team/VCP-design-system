import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, within } from 'storybook/test';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';
import { DeliverablesCard, type DeliverableFile, type DeliverableLinkItem } from './DeliverablesCard';

const LINKS: DeliverableLinkItem[] = [
  { id: 'l1', title: 'Some Link Goes Here', url: 'https://www.example.com/one', domain: 'design' },
  { id: 'l2', title: 'Some Link Goes Here', url: 'https://www.example.com/two', domain: 'development' },
];
const VIDEOS: DeliverableLinkItem[] = [
  { id: 'v1', title: 'Some Link Goes Here', url: 'https://www.example.com/video', domain: 'design' },
];
const FILES: DeliverableFile[] = [
  { id: 'f1', name: '2)-Current-and-Su....pdf', kind: 'pdf', domain: 'design' },
  { id: 'f2', name: 'image.png', kind: 'image', domain: 'design' },
];
/** The card's width in the page. */
const CARD_WIDTH = 'w-[26rem] max-w-full';

const meta = {
  title: 'Patterns/DeliverablesCard',
  component: DeliverablesCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'What an Added Value delivers: the links to it and the files attached. `domain` picks the sections (Design: Links; Development: ' +
          'Video Links then Links; both: Attachments) and `mode` is `view` or `edit`. The page owns the data; the card reports.',
      },
    },
  },
  args: { domain: 'design', mode: 'view', links: LINKS, files: FILES },
  argTypes: {
    domain: { control: 'inline-radio', options: ['design', 'development'] },
    mode: { control: 'inline-radio', options: ['view', 'edit'] },
  },
  decorators: [
    /* A story's own `decorators: []` doesn't remove this one, so a fullscreen story is skipped here. */
    (Story, { parameters }) =>
      parameters.layout === 'fullscreen' ? (
        <Story />
      ) : (
        <div className={`${CARD_WIDTH} bg-surface-canvas p-4`}>
          <Story />
        </div>
      ),
  ],
} satisfies Meta<typeof DeliverablesCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Viewing (Design): the links and the files. */
export const ViewingDesign: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Deliverables' })).toBeVisible();
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
    await expect(canvas.queryByRole('button', { name: /^Add/ })).toBeNull();
  },
};

/** Editing (Design): the + opens the add form, the added links have a pencil and bin, the files a ✕, and a drop area. */
export const EditingDesign: Story = {
  args: { mode: 'edit', onAddLinks: fn(), onRemoveLink: fn(), onEditLink: fn(), onRemoveFile: fn(), onFiles: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add link' }));
    await expect(canvas.getByRole('button', { name: 'Add link' })).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link URL' }), 'https://www.example.com');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link title' }), 'New');
    await userEvent.click(canvas.getByRole('button', { name: 'Add' }));
    await expect(args.onAddLinks).toHaveBeenCalledWith('links', [{ url: 'https://www.example.com', title: 'New' }]);
    await userEvent.click(canvas.getAllByRole('button', { name: 'Delete Link' })[0]!);
    await expect(args.onRemoveLink).toHaveBeenCalledWith('links', 'l1');
    await userEvent.click(canvas.getByRole('button', { name: 'Remove image.png' }));
    await expect(args.onRemoveFile).toHaveBeenCalledWith('f2');
    await expect(canvas.getByText(/Upload a file/)).toBeVisible();
  },
};

/** Viewing (Development): Video Links, then Links, then Attachments. */
export const ViewingDevelopment: Story = {
  args: { domain: 'development', videoLinks: VIDEOS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: /Video Links/ })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'Links' })).toBeVisible();
  },
};

/** Editing (Development): each of the two links sections has its own + and its own add form. */
export const EditingDevelopment: Story = {
  args: { domain: 'development', mode: 'edit', videoLinks: VIDEOS, onAddLinks: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add video link' }));
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link URL' }), 'https://video.example.com');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Link title' }), 'Demo');
    await userEvent.click(canvas.getByRole('button', { name: 'Add' }));
    await expect(args.onAddLinks).toHaveBeenCalledWith('video', [{ url: 'https://video.example.com', title: 'Demo' }]);
  },
};

/** A press on a file card opens the viewer, in view or edit: the open file's name, "1 of 2", download and close. */
export const OpensTheViewer: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { onDownloadFile: fn() },
  play: async ({ canvasElement, args }) => {
    /* The card names itself through its caption, whose full text is its title. */
    await userEvent.click(within(canvasElement).getByTitle('image.png'));
    const view = within(await screen.findByRole('dialog'));
    await expect(view.getByRole('heading', { name: 'image.png' })).toBeVisible();
    await expect(view.getByText('2 of 2')).toBeVisible();
    /* These files have no `src`, so the stage also offers the download: take the header's. */
    await userEvent.click(view.getAllByRole('button', { name: 'Download image.png' })[0]!);
    await expect(args.onDownloadFile).toHaveBeenCalledWith('f2');
  },
};

/** Both themes. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true }, ...SIDE_BY_SIDE },
  render: (args) => (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="h-full bg-surface-canvas p-6">
            <DeliverablesCard {...args} mode="edit" className={`${CARD_WIDTH} mx-auto`} />
          </div>
        </div>
      ))}
    </div>
  ),
};
