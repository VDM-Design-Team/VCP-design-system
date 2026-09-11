import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { ChangeLogModal, type ChangeLogEntry } from './ChangeLogModal';
import { Button } from '../../atoms/button';

const ENTRIES: ChangeLogEntry[] = [
  {
    kind: 'experimental',
    title: 'Experimental Features Available',
    date: 'May 6, 2026',
    version: 'v1.18.0',
    hint: 'Experimental features can change or be withdrawn without notice.',
    heading: 'Early preview features:',
    items: [
      'Requires at least the same name or same email on both Jira and VCP for first time auto syncing.',
    ],
  },
  {
    kind: 'update',
    title: 'New Update Available',
    date: 'May 6, 2026',
    version: 'v1.18.0',
    hint: 'Released to everyone on this version.',
    heading: 'What changed:',
    items: ['Statuses no longer reset when an Added Value moves domain.'],
  },
  {
    kind: 'feature',
    title: 'New Feature Available',
    date: 'May 6, 2026',
    version: 'v1.18.0',
    hint: 'New, and on by default.',
    heading: 'New in this release:',
    items: ['Multipart values can be split from the accept dialog.'],
  },
];

const meta = {
  title: 'Patterns/ChangeLogModal',
  component: ChangeLogModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'What a user sees when the product has something to tell them about a release: one ' +
          'announcement at a time, with arrows and dots. **The paging is `Carousel`**, controlled — ' +
          'which is what lets the dots sit where the design puts them, *below the footer buttons* ' +
          'rather than beside the content. Three kinds of announcement, and the glyph is the ' +
          'difference: a flask, a megaphone, a rocket.',
      },
    },
  },
  args: { open: true, onClose: () => {}, entries: ENTRIES },
  argTypes: { entries: { control: false } },
} satisfies Meta<typeof ChangeLogModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The first announcement — experimental, and its flask. */
export const Default: Story = {};

/** A release. The megaphone, in the design's own amber. */
export const Update: Story = { args: { index: 1 } };

/** A new feature. The rocket, in the design's own blue. */
export const Feature: Story = { args: { index: 2 } };

/** One announcement, so there is nothing to page through and no dots. */
export const SingleEntry: Story = { args: { entries: [ENTRIES[2]] } };

/** Every colour is a token. The dialog portals to `body`, so the theme global reaches it. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

/**
 * Paging through it. The arrows and the dots read one index, so they never
 * disagree, and the carousel wraps at both ends.
 */
export const PagingThroughIt: Story = {
  args: { open: false },
  render: function PagingStory(args) {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          What’s new
        </Button>
        <ChangeLogModal {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'What’s new' });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    const slide = () => screen.getByRole('group', { name: /of 3/ });
    await expect(slide()).toHaveAccessibleName('1 of 3');
    await expect(screen.getByText('Experimental Features Available')).toBeInTheDocument();

    /* The arrows move it. */
    await userEvent.click(screen.getByRole('button', { name: 'Next announcement' }));
    await expect(slide()).toHaveAccessibleName('2 of 3');
    await expect(screen.getByText('What changed:')).toBeInTheDocument();

    /* The dots move it too, and read the same index. */
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
    await expect(slide()).toHaveAccessibleName('3 of 3');

    /* And it wraps rather than going dead at the end. */
    await userEvent.click(screen.getByRole('button', { name: 'Next announcement' }));
    await expect(slide()).toHaveAccessibleName('1 of 3');

    /* "Got It" closes it, and reopening starts at the newest again. */
    await userEvent.click(screen.getByRole('button', { name: 'Next announcement' }));
    await userEvent.click(screen.getByRole('button', { name: 'Got It' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await expect(slide()).toHaveAccessibleName('1 of 3');
  },
};
