import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { BulkActionHandoffModal, type BulkHandoffAV } from './BulkActionHandoffModal';

const ITEMS: BulkHandoffAV[] = [
  { ref: 'VCP-12345', href: '#/added-values/VCP-12345', title: 'Improve customer onboarding', attachments: [{ name: 'image.png', kind: 'image' }, { name: 'brief.pdf', kind: 'pdf' }] },
  { ref: 'VCP-12346', href: '#/added-values/VCP-12346', title: 'Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard' },
  { ref: 'VCP-12347', href: '#/added-values/VCP-12347', title: 'Rework the notification bell so unread state survives a reload' },
  { ref: 'VCP-12348', href: '#/added-values/VCP-12348', title: 'Export the table to CSV' },
];

/** Every date chosen and something to review on each (a file already on it). The popup itself starts with the dates blank. */
const FILLED: BulkHandoffAV[] = ITEMS.map((item) => ({ attachments: [{ name: 'handoff-notes.pdf', kind: 'pdf' }], ...item, defaultDate: '2026-03-02' }));

const meta = {
  title: 'Patterns/BulkActionHandoffModal',
  component: BulkActionHandoffModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Handing several Added Values on at once: one page each (date, demo links, attachments; a late one also has its banner, reason and notes), Publish for Development, and a pager to step between them. Handoff waits until every Added Value is complete.',
      },
    },
  },
  args: { open: true, onClose: fn(), onHandoff: fn(), items: ITEMS, domain: 'development' },
} satisfies Meta<typeof BulkActionHandoffModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = () => within(within(document.body).getByRole('dialog', { name: 'Handoff 4 Added Values' }));

/** How the popup opens: the first Added Value, its date blank, and Handoff waiting until one is chosen. */
export const Default: Story = {
  play: async () => {
    const d = dialog();
    await expect(d.getByRole('button', { name: 'Handoff' })).toBeDisabled();
    await expect(d.getByRole('combobox', { name: /Handoff Date/ })).toBeVisible();
  },
};

/** Figma's Development popup, every detail filled: Handoff is available. */
export const Development: Story = {
  args: { items: FILLED },
  play: async () => {
    const d = dialog();
    await expect(d.getByText('Improve customer onboarding')).toBeVisible();
    await expect(d.getByRole('checkbox', { name: 'Publish' })).toBeVisible();
    await expect(d.getByRole('button', { name: 'Handoff' })).toBeEnabled();
  },
};

/** Other domains: the same without Publish. */
export const NonDevelopment: Story = {
  args: { domain: 'design-governance', items: FILLED },
  play: async () => {
    await expect(dialog().queryByRole('checkbox', { name: 'Publish' })).toBeNull();
  },
};

/** Figma's incomplete state, and how a popup starts: the date is blank, so Handoff is disabled until one is chosen from the calendar. */
export const Incomplete: Story = {
  play: async () => {
    const d = dialog();
    const handoff = d.getByRole('button', { name: 'Handoff' });
    await expect(handoff).toBeDisabled();
    await expect(handoff).toHaveAccessibleDescription('4 of 4 Added Values still need their handoff details.');
    await userEvent.click(d.getByRole('combobox', { name: /Handoff Date/ }));
    await userEvent.click(await within(document.body).findByRole('button', { name: /^15\b/ }));
    await expect(d.getByRole('combobox', { name: /Handoff Date/ })).not.toHaveValue('');
    await expect(handoff).toHaveAccessibleDescription('3 of 4 Added Values still need their handoff details.');
  },
};

/** A link that is typed has to be a valid `https://` URL: it says so under the box, and Handoff waits. Extra links can be removed. */
export const InvalidLink: Story = {
  args: { items: FILLED },
  play: async () => {
    const d = dialog();
    await userEvent.type(d.getByRole('textbox', { name: 'Demo link 1' }), 'not a link');
    await userEvent.tab();
    await expect(await d.findByText('Please enter a valid URL starting with https://')).toBeVisible();
    await expect(d.getByRole('button', { name: 'Handoff' })).toBeDisabled();
    await userEvent.clear(d.getByRole('textbox', { name: 'Demo link 1' }));
    await userEvent.type(d.getByRole('textbox', { name: 'Demo link 1' }), 'https://example.com/demo');
    await expect(d.getByRole('button', { name: 'Handoff' })).toBeEnabled();
    await userEvent.click(d.getByRole('button', { name: 'Add Another Link' }));
    await userEvent.click(d.getByRole('button', { name: 'Remove demo link 2' }));
    await expect(d.queryByRole('textbox', { name: 'Demo link 2' })).toBeNull();
  },
};

/**
 * A handoff needs something to review: with a date but neither a demo link nor a file, Handoff waits, and the form says what is needed under Demo Links. A link on one and a file already on the other
 * are both enough; removing that file takes it away again.
 */
export const NeedsALinkOrAFile: Story = {
  args: {
    items: [
      { ref: 'VCP-12346', title: 'Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard', defaultDate: '2026-03-02' },
      { ref: 'VCP-12347', title: 'Rework the notification bell so unread state survives a reload', defaultDate: '2026-03-02', attachments: [{ name: 'recording.pdf', kind: 'pdf' }] },
    ],
  },
  play: async () => {
    const d = within(within(document.body).getByRole('dialog', { name: 'Handoff 2 Added Values' }));
    const handoff = d.getByRole('button', { name: 'Handoff' });
    await expect(d.getAllByText('A handoff needs at least one demo link or one attachment.')[0]).toBeVisible();
    await expect(handoff).toBeDisabled();
    await expect(handoff).toHaveAccessibleDescription('1 of 2 Added Values still need their handoff details.');
    await userEvent.type(d.getByRole('textbox', { name: 'Demo link 1' }), 'https://example.com/demo');
    await expect(handoff).toBeEnabled();
    /* The second one's file is its evidence: remove it and Handoff waits again. */
    await userEvent.click(d.getByRole('button', { name: 'Next Added Value' }));
    await userEvent.click(d.getByRole('button', { name: /Remove recording\.pdf/ }));
    await expect(handoff).toBeDisabled();
  },
};

/** Clicking an attachment opens its preview on top of the popup; Escape closes only the preview. (A modal over a modal: design to confirm.) */
export const PreviewingAnAttachment: Story = {
  args: { items: FILLED },
  play: async () => {
    const d = dialog();
    await userEvent.click(await d.findByText(/image/, { selector: 'button *' }));
    const viewer = await within(document.body).findByRole('dialog', { name: 'Attachment: image.png' });
    await expect(viewer).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog', { name: 'Attachment: image.png' })).toBeNull());
    await expect(within(document.body).getByRole('dialog', { name: 'Handoff 4 Added Values' })).toBeVisible();
  },
};

/** The `Overdue` variant: a banner, a required reason, and notes. The Added Value is late, so Handoff waits for the reason. */
export const Overdue: Story = {
  args: { items: FILLED.map((item, i) => (i === 0 ? { ...item, overdueDays: 5 } : item)) },
  play: async () => {
    const d = dialog();
    await expect(d.getByText('Overdue')).toBeVisible();
    await expect(d.getByRole('button', { name: 'Handoff' })).toBeDisabled();
    await userEvent.selectOptions(d.getByRole('combobox', { name: /Overdue Reason/ }), 'Dependencies: Waiting on others (team or external)');
    await expect(d.getByRole('button', { name: 'Handoff' })).toBeEnabled();
  },
};

/** Step with the arrows or the dots; what was typed stays, and the last handoff sends one draft per Added Value. */
export const Stepping: Story = {
  args: { items: FILLED },
  render: (args) => <BulkActionHandoffModal {...args} />,
  play: async ({ args }) => {
    const d = dialog();
    await userEvent.type(d.getByRole('textbox', { name: 'Demo link 1' }), 'https://example.com/one');
    await userEvent.click(d.getByRole('button', { name: 'Next Added Value' }));
    await expect(d.getByText('Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard')).toBeVisible();
    await expect(d.getByRole('textbox', { name: 'Demo link 1' })).toHaveValue('');
    await userEvent.click(d.getByRole('button', { name: 'Go to page 1' }));
    await expect(d.getByRole('textbox', { name: 'Demo link 1' })).toHaveValue('https://example.com/one');
    await userEvent.click(d.getByRole('checkbox', { name: 'Publish' }));
    await userEvent.click(d.getByRole('button', { name: 'Handoff' }));
    await waitFor(() => expect(args.onHandoff).toHaveBeenCalled());
    const drafts = (args.onHandoff as ReturnType<typeof fn>).mock.calls[0][0];
    await expect(Object.keys(drafts)).toHaveLength(4);
    await expect(drafts['VCP-12345']).toMatchObject({ links: ['https://example.com/one'], publish: true });
  },
};

/** Removing a link takes the focused ✕ with it: focus goes to the next box (else the one before), never to the page. */
export const FocusAfterRemovingALink: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { items: FILLED },
  play: async () => {
    const d = dialog();
    await userEvent.type(d.getByRole('textbox', { name: 'Demo link 1' }), 'https://example.com/one');
    await userEvent.click(d.getByRole('button', { name: 'Add Another Link' }));
    await waitFor(() => expect(d.getByRole('textbox', { name: 'Demo link 2' })).toHaveFocus());
    await userEvent.type(d.getByRole('textbox', { name: 'Demo link 2' }), 'https://example.com/two');
    await userEvent.click(d.getByRole('button', { name: 'Remove demo link 1' }));
    /* The second box slid into the first's place and has focus. */
    await waitFor(() => expect(d.getByRole('textbox', { name: 'Demo link 1' })).toHaveValue('https://example.com/two'));
    await waitFor(() => expect(d.getByRole('textbox', { name: 'Demo link 1' })).toHaveFocus());
  },
};

/** The attachment ✕ never drops focus either (`Attachments`'): the next card's ✕, else the previous one's, else the drop area. */
export const FocusAfterRemovingAFile: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { items: FILLED },
  play: async () => {
    const d = dialog();
    const first = d.getByRole('button', { name: 'Remove image.png' });
    first.focus();
    await userEvent.click(first);
    await waitFor(() => expect(d.getByRole('button', { name: 'Remove brief.pdf' })).toHaveFocus());
  },
};

/** A PDF already on the Added Value is a document card, not an image, and the cards are `Attachments`' (preview on click). */
export const AttachmentKinds: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { items: FILLED },
  play: async () => {
    const d = dialog();
    await expect(d.getByRole('list', { name: 'Attached files' })).toBeVisible();
    await expect(d.getByTitle('brief.pdf').querySelector('img')).toBeNull();
  },
};

/** At the first and last Added Value the arrow you pressed is `aria-disabled`, not `disabled`: it keeps focus, so a keyboard user is not sent to the page. */
export const PagerKeepsFocus: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { items: FILLED.slice(0, 2) },
  play: async () => {
    const d = within(within(document.body).getByRole('dialog', { name: 'Handoff 2 Added Values' }));
    const previous = d.getByRole('button', { name: 'Previous Added Value' });
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
    const next = d.getByRole('button', { name: 'Next Added Value' });
    next.focus();
    await userEvent.click(next);
    await expect(d.getByRole('button', { name: 'Next Added Value' })).toHaveAttribute('aria-disabled', 'true');
    /* It kept focus at the end, and pressing it again (with the keyboard: a pointer cannot press it) does nothing. */
    await expect(next).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(d.getByText('Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard')).toBeVisible();
    await expect(next).toHaveFocus();
  },
};

/** The popup is the system's `lg` (640), not Figma's 592. */
export const Width: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async () => {
    const panel = within(document.body).getByRole('dialog', { name: 'Handoff 4 Added Values' });
    await expect(Math.round(panel.getBoundingClientRect().width)).toBe(640);
  },
};

export const One: Story = { args: { items: ITEMS.slice(0, 1) }, play: async () => expect(within(document.body).getByRole('dialog', { name: 'Handoff 1 Added Value' })).toBeVisible() };

export const Handing: Story = { args: { loading: true } };

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
