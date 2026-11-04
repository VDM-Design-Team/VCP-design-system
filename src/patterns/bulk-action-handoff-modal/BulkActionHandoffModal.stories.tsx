import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { BulkActionHandoffModal, type BulkHandoffAV } from './BulkActionHandoffModal';

const ITEMS: BulkHandoffAV[] = [
  { ref: 'VCP-12345', href: '#/added-values/VCP-12345', title: 'Improve customer onboarding', attachments: [{ name: 'image.png' }] },
  { ref: 'VCP-12346', href: '#/added-values/VCP-12346', title: 'Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard' },
  { ref: 'VCP-12347', href: '#/added-values/VCP-12347', title: 'Rework the notification bell so unread state survives a reload' },
  { ref: 'VCP-12348', href: '#/added-values/VCP-12348', title: 'Export the table to CSV' },
];

/** Every date chosen. The popup itself starts with them blank. */
const FILLED = ITEMS.map((item) => ({ ...item, defaultDate: '2026-03-02' }));

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
    await expect(d.getByRole('combobox', { name: 'Handoff Date' })).toBeVisible();
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
    await userEvent.click(d.getByRole('combobox', { name: 'Handoff Date' }));
    await userEvent.click(await within(document.body).findByRole('button', { name: /^15\b/ }));
    await expect(d.getByRole('combobox', { name: 'Handoff Date' })).not.toHaveValue('');
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

/** The `Overdue` variant: a banner, a required reason, and notes. The Added Value is late, so Handoff waits for the reason. */
export const Overdue: Story = {
  args: { items: FILLED.map((item, i) => (i === 0 ? { ...item, overdueDays: 5 } : item)) },
  play: async () => {
    const d = dialog();
    await expect(d.getByText('Overdue')).toBeVisible();
    await expect(d.getByRole('button', { name: 'Handoff' })).toBeDisabled();
    await userEvent.selectOptions(d.getByRole('combobox', { name: 'Overdue Reason' }), 'Dependencies: Waiting on others (team or external)');
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

export const One: Story = { args: { items: ITEMS.slice(0, 1) }, play: async () => expect(within(document.body).getByRole('dialog', { name: 'Handoff 1 Added Value' })).toBeVisible() };

export const Handing: Story = { args: { loading: true } };

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
