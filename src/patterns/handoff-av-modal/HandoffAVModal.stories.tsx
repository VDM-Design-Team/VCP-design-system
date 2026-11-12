import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { HandoffAVModal, type HandoffDraft } from './HandoffAVModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/HandoffAVModal',
  component: HandoffAVModal,
  parameters: {
    layout: 'centered',
    docs: {
      /* Each story in its own frame, or the Docs page stacks every open dialog. */
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'What an assignee fills in to hand an Added Value on: the date, the links that show the ' +
          'work, and anything attached. **`overdueDays` switches the dialog** to the design’s ' +
          'second variant — a warning banner, a *required* overdue reason, and a notes field. ' +
          'The footer is the domain’s: Development can hand off *and publish*, which is a third ' +
          'button and a different weight on the other two.',
      },
    },
  },
  args: {
    open: true,
    onClose: () => {},
    onHandoff: () => {},
    defaultDate: '2026-03-02',
  },
  argTypes: {
    domain: { control: 'inline-radio', options: ['design-governance', 'development'] },
    overdueDays: { control: 'number' },
  },
} satisfies Meta<typeof HandoffAVModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On time, Design or Governance: date, links, attachments, two buttons. */
export const Default: Story = {};

/** With files already on the value, shown as cards above the picker: each previews on click and can be removed. */
export const WithAttachments: Story = {
  args: {
    attachments: [{ name: 'image.png', kind: 'image' }, { name: 'brief.pdf', kind: 'pdf' }],
  },
};

/**
 * Development gets a third button. `Handoff & Publish` is the primary, so
 * plain `Handoff` steps down to the outlined weight and Cancel to text.
 */
export const DevelopmentDomain: Story = {
  args: { domain: 'development' },
};

/**
 * Overdue. The banner names the delay, and two fields appear — the reason is
 * required, which is the only validation the design draws.
 */
export const Overdue: Story = {
  args: { overdueDays: 5 },
};

/** Overdue in Development: the longest the dialog gets. */
export const OverdueInDevelopment: Story = {
  args: { overdueDays: 12, domain: 'development' },
};

/** Every colour is a token. The dialog portals to `body`, so the theme global reaches it. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  args: { overdueDays: 5 },
};

/**
 * Filling it in and handing off. Adding a link grows the group, empty rows are
 * dropped, and the draft leaves once with everything in it.
 */
export const HandingOff: Story = {
  args: { open: false },
  render: function HandingOffStory(args) {
    const [open, setOpen] = React.useState(false);
    const [sent, setSent] = React.useState<string>('nothing yet');
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Handoff AV
        </Button>
        <p className="text-caption-md-regular text-text-tertiary">Sent: {sent}</p>
        <HandoffAVModal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onHandoff={(draft: HandoffDraft, { publish }) => {
            setSent(`${draft.links.length} link(s), publish=${publish}`);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Handoff AV' });

    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    /* Not overdue: no banner, no reason, no notes. */
    await expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await expect(screen.queryByLabelText('Overdue Reason')).not.toBeInTheDocument();

    /* One link row to start; adding grows the group and each row is named. */
    await userEvent.type(screen.getByRole('textbox', { name: 'Demo link 1' }), 'https://a.example');
    await userEvent.click(screen.getByRole('button', { name: 'Add Another Link' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Demo link 2' }), 'https://b.example');
    /* A third, left empty — it should not survive the submit. */
    await userEvent.click(screen.getByRole('button', { name: 'Add Another Link' }));

    await userEvent.click(screen.getByRole('button', { name: 'Handoff' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Sent: 2 link(s), publish=false')).toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

/**
 * A late value has to say why. Submitting without a reason is refused with the
 * design's own message, and choosing one clears it.
 */
export const OverdueNeedsAReason: Story = {
  args: { open: false, overdueDays: 5 },
  render: function OverdueNeedsAReasonStory(args) {
    const [open, setOpen] = React.useState(false);
    const [sent, setSent] = React.useState('nothing yet');
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Handoff late AV
        </Button>
        <p className="text-caption-md-regular text-text-tertiary">Sent: {sent}</p>
        <HandoffAVModal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onHandoff={(draft: HandoffDraft) => {
            setSent(draft.overdueReason ?? 'no reason');
            setOpen(false);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Handoff late AV' }));
    await screen.findByRole('dialog');

    /* The banner names the delay. Matched on the sentence, not the word —
       "Overdue" alone also hits the "Overdue Reason" label below it. */
    await expect(screen.getByText(/This value is/)).toHaveTextContent(
      'This value is Overdue by 5 days.',
    );

    /* Submitting with no reason is refused, and says why. */
    await userEvent.click(screen.getByRole('button', { name: 'Handoff' }));
    const error = await screen.findByRole('alert');
    await expect(error).toHaveTextContent('Please select a reason before completing the AV');
    await expect(screen.getByRole('dialog')).toBeInTheDocument();

    const reason = screen.getByLabelText(/Overdue Reason/);
    await expect(reason).toHaveAttribute('aria-invalid', 'true');

    /* Choosing one clears the error and lets it through. */
    await userEvent.selectOptions(reason, 'resourcing');
    await expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Handoff' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Sent: resourcing')).toBeInTheDocument();
  },
};

/** The date is required, and chosen from the calendar: a handoff with none is refused under the field, with focus on it. */
export const DateIsRequired: Story = {
  args: { open: false, defaultDate: '' },
  render: function DateIsRequiredStory(args) {
    const [open, setOpen] = React.useState(false);
    const [sent, setSent] = React.useState('nothing yet');
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Handoff AV
        </Button>
        <p className="text-caption-md-regular text-text-tertiary">Sent: {sent}</p>
        <HandoffAVModal {...args} open={open} onClose={() => setOpen(false)} onHandoff={(draft: HandoffDraft) => { setSent(draft.date); setOpen(false); }} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Handoff AV' }));
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: 'Handoff' }));
    await expect(await dialog.findByText('Select a handoff date.')).toBeVisible();
    await waitFor(() => expect(dialog.getByRole('combobox', { name: /Handoff Date/ })).toHaveFocus());
    /* Choosing one from the calendar clears it and lets the handoff through. */
    await userEvent.click(dialog.getByRole('combobox', { name: /Handoff Date/ }));
    await userEvent.click(await within(document.body).findByRole('button', { name: /^15\b/ }));
    await waitFor(() => expect(dialog.queryByText('Select a handoff date.')).toBeNull());
    await userEvent.click(dialog.getByRole('button', { name: 'Handoff' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText(/Sent: \d{4}-\d{2}-15/)).toBeInTheDocument();
  },
};

/** A link that is typed must be a valid `https://` address: the handoff is refused under the box, with focus on it. Empty boxes are simply dropped. */
export const LinkMustBeAnAddress: Story = {
  args: { open: true },
  play: async () => {
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.type(dialog.getByRole('textbox', { name: 'Demo link 1' }), 'not a link');
    await userEvent.click(dialog.getByRole('button', { name: 'Handoff' }));
    await expect(await dialog.findByText('Please enter a valid URL starting with https://')).toBeVisible();
    await waitFor(() => expect(dialog.getByRole('textbox', { name: 'Demo link 1' })).toHaveFocus());
  },
};
