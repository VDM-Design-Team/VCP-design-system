import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { BulkActionConfirmModal } from './BulkActionConfirmModal';

const ITEMS = [
  { href: '#/added-values/VCP-12345', ref: 'VCP-12345', title: 'Added Value Title Here (if the title is super long, just truncate it so that the row keeps its shape in the list)' },
  { href: '#/added-values/VCP-12346', ref: 'VCP-12346', title: 'Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard' },
];
const REASONS = ['Duplicate', 'Out of scope', 'Needs more information'];

/* One mock per story that reads what `onConfirm` is handed. */
const backlogConfirm = fn();
const multipartConfirm = fn();
const rejectConfirm = fn();

const meta = {
  title: 'Patterns/BulkActionConfirmModal',
  component: BulkActionConfirmModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The question after a bulk choice, one component for every action: pass the `action` and the selected Added Values, and it draws the title, the field the ' +
          'action collects (or the value it changes to), the list with a field per Added Value where the action has one, and Cancel / Confirm. It does nothing itself.',
      },
    },
  },
} satisfies Meta<typeof BulkActionConfirmModal>;

export default meta;
type Story = StoryObj;

const dialog = (name: string) => within(within(document.body).getByRole('dialog', { name }));
const open = async (d: ReturnType<typeof dialog>) => userEvent.click(d.getByRole('button', { name: 'List of Added Values' }));

/** Figma's `Change Urgency`: the new value as its own tag, the list collapsed, Cancel and Confirm. Type, Cycle and Status are the same with their own tag. */
export const Urgency: Story = {
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="urgency" value="Low" items={ITEMS} />,
  play: async () => {
    const d = dialog('Change Urgency for 2 Added Values');
    await expect(d.getByText('Selected AVs will be updated to:')).toBeVisible();
    await expect(d.getByRole('button', { name: 'List of Added Values' })).toHaveAttribute('aria-expanded', 'false');
    await open(d);
    await expect(d.getByText('VCP-12345')).toBeVisible();
    await userEvent.click(d.getByRole('button', { name: 'List of Added Values' }));
    await expect(d.queryByText('VCP-12345')).toBeNull();
  },
};

export const TypeCycleAndStatus: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <>
      <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="type" value="Type 2" items={ITEMS} />
    </>
  ),
  play: async () => {
    await expect(dialog('Change Type for 2 Added Values').getByText('Type 2')).toBeVisible();
  },
};

export const Cycle: Story = {
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="cycle" value={{ code: 'C18', start: '2025-09-20', end: '2026-10-02' }} items={ITEMS} />,
  play: async () => {
    await expect(dialog('Change Cycle for 2 Added Values').getByText(/C18/)).toBeVisible();
  },
};

/** Any other status (In Progress, For QA…): Figma draws no popup for these, so this is the plain "Change Status". */
export const Status: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="status" value="In Progress" items={ITEMS} />,
  play: async () => {
    await expect(dialog('Change Status for 2 Added Values').getByText('In Progress')).toBeVisible();
  },
};

/** Backlog: a Feedback field for all (optional), and in the list each Added Value can take its own reason instead. `onConfirm` gets `{ value, overrides }`. */
export const Backlog: Story = {
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={backlogConfirm} action="backlog" items={ITEMS} defaultExpanded />,
  play: async () => {
    const d = dialog('Move 2 Added Values to Backlog');
    await expect(d.getByText('This will be applied to all selected Added Values unless overridden below.')).toBeVisible();
    await userEvent.type(d.getByRole('textbox', { name: 'Feedback' }), 'Not this quarter');
    await userEvent.type(d.getByRole('textbox', { name: 'Reason for VCP-12346' }), 'Waiting on design');
    await expect(d.getByRole('textbox', { name: 'Reason for VCP-12345' })).toHaveAttribute('placeholder', 'Uses bulk reason unless overridden');
    await userEvent.click(d.getByRole('button', { name: 'Confirm' }));
    await waitFor(() =>
      expect(backlogConfirm).toHaveBeenCalledWith({ value: 'Not this quarter', overrides: { 'VCP-12346': 'Waiting on design' } }),
    );
  },
};

/** Accept Pending, development: **Multipart Value** for all, and per Added Value (which follows the bulk one until it is changed). */
export const AcceptPendingDevelopment: Story = {
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={multipartConfirm} action="accept-pending" domain="development" items={ITEMS} defaultExpanded />,
  play: async () => {
    const d = dialog('Accept 2 Pending Added Values');
    await expect(d.getByText(/Split this value into parts/)).toBeVisible();
    /* Ticking the bulk one ticks every Added Value that was not touched; untick one and it overrides. */
    await userEvent.click(d.getByRole('checkbox', { name: /^Multipart Value$|Split this value/ }));
    await expect(d.getByRole('checkbox', { name: 'Multipart Value for VCP-12345' })).toBeChecked();
    await expect(d.getByRole('checkbox', { name: 'Multipart Value for VCP-12346' })).toBeChecked();
    await userEvent.click(d.getByRole('checkbox', { name: 'Multipart Value for VCP-12346' }));
    await userEvent.click(d.getByRole('button', { name: 'Confirm' }));
    await waitFor(() =>
      expect(multipartConfirm).toHaveBeenCalledWith({ value: true, overrides: { 'VCP-12346': false } }),
    );
  },
};

/** Accept Pending outside development: nothing to collect, just the list. `onConfirm` gets `null`. */
export const AcceptPendingOther: Story = {
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="accept-pending" domain="other" items={ITEMS} />,
  play: async () => {
    const d = dialog('Accept 2 Pending Added Values');
    await expect(d.queryByRole('checkbox')).toBeNull();
  },
};

/** Accept: development asks **Require Cypress Test Script**, design asks **Copy to Dev**, anything else asks nothing. */
export const AcceptDevelopmentAndDesign: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="accept" domain="development" items={ITEMS} />,
  play: async () => {
    await expect(dialog('Accept 2 Added Values').getByRole('checkbox', { name: 'Require Cypress Test Script' })).toBeVisible();
  },
};

export const AcceptDesign: Story = {
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="accept" domain="design" items={ITEMS} />,
  play: async () => {
    await expect(dialog('Accept 2 Added Values').getByRole('checkbox', { name: 'Copy to Dev' })).toBeVisible();
  },
};

/** Reject Pending: a **Rejection Reason** from the page's list, required; a Confirm without one says so and goes nowhere. */
export const RejectPending: Story = {
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={rejectConfirm} action="reject-pending" reasons={REASONS} items={ITEMS} defaultExpanded />,
  play: async () => {
    const d = dialog('Reject 2 Pending Added Values');
    await userEvent.click(d.getByRole('button', { name: 'Confirm' }));
    await expect(await d.findByText('Select a rejection reason, or one for each Added Value.')).toBeVisible();
    await expect(rejectConfirm).not.toHaveBeenCalled();
    /* One for all, and a different one for the second. */
    await userEvent.selectOptions(d.getByRole('combobox', { name: 'Rejection Reason' }), 'Duplicate');
    await userEvent.selectOptions(d.getByRole('combobox', { name: 'Rejection reason for VCP-12346' }), 'Out of scope');
    await userEvent.click(d.getByRole('button', { name: 'Confirm' }));
    await waitFor(() =>
      expect(rejectConfirm).toHaveBeenCalledWith({ value: 'Duplicate', overrides: { 'VCP-12346': 'Out of scope' } }),
    );
  },
};

/** Reject: the same, with a red Confirm — it is the destructive one. */
export const Reject: Story = {
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="reject" reasons={REASONS} items={ITEMS} />,
  play: async () => {
    const d = dialog('Reject 2 Added Values');
    const confirm = d.getByRole('button', { name: 'Confirm' });
    await expect(getComputedStyle(confirm).backgroundColor).not.toBe(getComputedStyle(d.getByRole('button', { name: 'Cancel' })).backgroundColor);
    await expect(confirm.className).toContain('critical');
  },
};

/** A single Added Value reads singular. */
export const One: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="urgency" value="High" items={ITEMS.slice(0, 1)} />,
  play: async () => {
    await expect(dialog('Change Urgency for 1 Added Value').getByText('High')).toBeVisible();
  },
};

/** Confirm is in flight: it spins and Cancel locks. */
export const Confirming: Story = {
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="urgency" value="Low" items={ITEMS} confirming />,
  play: async () => {
    await expect(dialog('Change Urgency for 2 Added Values').getByRole('button', { name: 'Cancel' })).toBeDisabled();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  render: () => <BulkActionConfirmModal open onClose={fn()} onConfirm={fn()} action="reject" reasons={REASONS} items={ITEMS} defaultExpanded />,
};
