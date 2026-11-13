import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { HandoffForm, blankHandoffEntry, handoffHasEvidence, isHandoffComplete, type HandoffEntry } from './HandoffForm';

const meta = {
  title: 'Patterns/HandoffForm',
  component: HandoffForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The one handoff form, for one Added Value: the Handoff Date (required, from the calendar), Demo Links, Attachments and, when it is late, the banner, the Overdue Reason (required) and Additional Notes. ' +
          '`HandoffAVModal` and `BulkActionHandoffModal` both draw it.',
      },
    },
  },
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HandoffForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On time: the date, the links and the attachments. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('combobox', { name: /Handoff Date/ })).toBeVisible();
    await expect(c.getByRole('textbox', { name: 'Demo link 1' })).toBeVisible();
    await expect(c.getByText('Upload a file')).toBeVisible();
    await expect(c.queryByText('Overdue Reason')).toBeNull();
  },
};

/** Late: the banner names the delay, the reason is required and notes are optional. */
export const Overdue: Story = {
  args: { overdueDays: 5 },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(/This value is/)).toHaveTextContent('This value is Overdue by 5 days.');
    await expect(c.getByRole('combobox', { name: /Overdue Reason/ })).toBeVisible();
    await expect(c.getByText('Additional Notes (optional)')).toBeVisible();
  },
};

/** The files already on the value are cards: a PDF is a document, an image shows itself, each previews on click, and a removal is staged (reported in `removed`). */
export const WithAttachments: Story = {
  args: { attachments: [{ name: 'image.png', kind: 'image' }, { name: 'brief.pdf', kind: 'pdf' }] },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('list', { name: 'Attached files' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Remove image.png' }));
    await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.objectContaining({ removed: ['image.png'] })));
    /* Focus moved on: the next card's ✕. */
    await waitFor(() => expect(c.getByRole('button', { name: 'Remove brief.pdf' })).toHaveFocus());
  },
};

/** It reports its entry as it changes: the date from the calendar, the links typed, and the reason. */
export const ReportsItsEntry: Story = {
  args: { overdueDays: 3 },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole('textbox', { name: 'Demo link 1' }), 'https://example.com/demo');
    await userEvent.selectOptions(c.getByRole('combobox', { name: /Overdue Reason/ }), 'Resourcing: Not enough time, people, or availability (incl. leave)');
    await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(expect.objectContaining({ links: ['https://example.com/demo'], overdueReason: 'resourcing' })));
  },
};

/** A link that is typed must be a valid `https://` address; it says so under the box once the box is left. */
export const InvalidLink: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole('textbox', { name: 'Demo link 1' }), 'not a link');
    await userEvent.tab();
    await expect(await c.findByText('Please enter a valid URL starting with https://')).toBeVisible();
    await expect(c.getByRole('textbox', { name: 'Demo link 1' })).toHaveAttribute('aria-invalid', 'true');
  },
};

/** Removing a link takes the focused ✕ with it: focus goes to the next box (else the one before), and adding one focuses the new box. */
export const FocusInTheLinks: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Add Another Link' }));
    await waitFor(() => expect(c.getByRole('textbox', { name: 'Demo link 2' })).toHaveFocus());
    await userEvent.type(c.getByRole('textbox', { name: 'Demo link 2' }), 'https://b.example');
    await userEvent.click(c.getByRole('button', { name: 'Remove demo link 1' }));
    await waitFor(() => expect(c.getByRole('textbox', { name: 'Demo link 1' })).toHaveFocus());
    await expect(c.getByRole('textbox', { name: 'Demo link 1' })).toHaveValue('https://b.example');
    await expect(c.queryByRole('button', { name: /^Remove demo link/ })).toBeNull();
  },
};

/** What a dialog that asks on submit passes in: the message under the field, and focus on the first one. */
export const WithErrors: Story = {
  args: { overdueDays: 2, errors: { date: 'Select a handoff date.', overdueReason: 'Please select a reason before completing the AV' } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Select a handoff date.')).toBeVisible();
    await expect(c.getByText('Please select a reason before completing the AV')).toBeVisible();
    await waitFor(() => expect(c.getByRole('combobox', { name: /Handoff Date/ })).toHaveFocus());
  },
};

/** The one rule for "can this be handed off" (hidden, tested): a date; when late, a reason; every link typed valid; and something to review, a link or a file. Notes are optional. */
export const CompleteRule: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <div />,
  play: async () => {
    /* A dated entry with one good link, so each line below changes one thing. */
    const entry = (change: Partial<HandoffEntry> = {}): HandoffEntry => ({ ...blankHandoffEntry('2026-03-02'), links: ['https://a.example'], ...change });
    await expect(isHandoffComplete(false, entry())).toBe(true);
    await expect(isHandoffComplete(false, entry({ date: '' }))).toBe(false);
    await expect(isHandoffComplete(true, entry())).toBe(false);
    await expect(isHandoffComplete(true, entry({ overdueReason: 'resourcing' }))).toBe(true);
    await expect(isHandoffComplete(false, entry({ links: ['not a link'] }))).toBe(false);
    await expect(isHandoffComplete(false, entry({ links: ['', 'https://a.example'] }))).toBe(true);
    /* Notes are optional. */
    await expect(isHandoffComplete(false, entry({ notes: '' }))).toBe(true);
    /* Something to review: a link, a file just picked, or a file already on the value that was not removed. */
    const file = new File(['x'], 'recording.pdf', { type: 'application/pdf' });
    await expect(isHandoffComplete(false, entry({ links: [''] }))).toBe(false);
    await expect(handoffHasEvidence(entry({ links: [''] }))).toBe(false);
    await expect(isHandoffComplete(false, entry({ links: [''], files: [file] }))).toBe(true);
    await expect(isHandoffComplete(false, entry({ links: [''] }), 1)).toBe(true);
    await expect(isHandoffComplete(false, entry({ links: [''], removed: ['recording.pdf'] }), 1)).toBe(false);
    await expect(isHandoffComplete(false, entry({ links: [''], removed: ['recording.pdf'], files: [file] }), 1)).toBe(true);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { args: { overdueDays: 5 }, globals: { theme: 'dark' } };
