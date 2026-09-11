import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { ReportProblemModal, type ProblemReport } from './ReportProblemModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/ReportProblemModal',
  component: ReportProblemModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The form behind “Report a problem”, the row pinned to the bottom of every `Sidebar`. ' +
          'It uses `Modal`’s own header — a left-aligned title and a close button — then three ' +
          'fields, then the actions. The values live in the pattern and come out once, through ' +
          '`onSubmit`, because a report is composed and sent in one go.',
      },
    },
  },
  args: {
    open: true,
    onClose: () => {},
    onSubmit: () => {},
  },
} satisfies Meta<typeof ReportProblemModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty, as it opens: the three fields and their placeholders. */
export const Default: Story = {};

/** The report is being sent. Submit spins and cannot be pressed twice. */
export const Submitting: Story = {
  args: { loading: true },
};

/** Every colour is a token. The dialog portals to `body`, so the theme global is what reaches it. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
};

/**
 * Fill it in and send it. The report comes out once, with everything in it,
 * and the dialog is empty again the next time it opens.
 */
export const FillingItIn: Story = {
  args: { open: false },
  render: function FillingItInStory(args) {
    const [open, setOpen] = React.useState(false);
    const [sent, setSent] = React.useState<ProblemReport>();
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Report a problem
        </Button>
        <p className="text-body-sm text-text-tertiary">
          Sent: {sent ? `${sent.problem} / ${sent.description}` : 'nothing yet'}
        </p>
        <ReportProblemModal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={(report) => {
            setSent(report);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Report a problem' });

    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    await userEvent.type(screen.getByLabelText('What’s the problem?'), 'Export times out');
    await userEvent.type(screen.getByLabelText('Description'), 'Over 500 rows it never returns.');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(
      canvas.getByText('Sent: Export times out / Over 500 rows it never returns.'),
    ).toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    /* Opening it again starts clean — an abandoned report does not come back. */
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await expect(screen.getByLabelText('What’s the problem?')).toHaveValue('');
  },
};
