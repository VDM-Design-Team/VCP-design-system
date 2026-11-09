import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { AcceptPendingAVModal } from './AcceptPendingAVModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/AcceptPendingAVModal',
  component: AcceptPendingAVModal,
  parameters: {
    layout: 'centered',
    docs: {
      /* Each story in its own frame, or the Docs page stacks every open dialog. */
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'The confirmation an admin answers to accept a pending Added Value, and the one decision ' +
          'that comes with it: whether the value is **multipart**. A benign confirmation, unlike ' +
          'the delete one — Cancel is the brand-outlined `secondary` rather than the grey ' +
          '`neutral`, and a backdrop click closes it. The stories that show the look render open, ' +
          'as `Modal`’s do.',
      },
    },
  },
  args: {
    open: true,
    onClose: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof AcceptPendingAVModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As it opens: multipart unchecked, the card in its resting state. */
export const Default: Story = {};

/** Checked. The card takes the brand border and tint — the design's Selected state. */
export const MultipartSelected: Story = {
  args: { multipart: true },
};

/** `showMultipart={false}` — the design draws the dialog without the card too. */
export const WithoutMultipart: Story = {
  args: { showMultipart: false },
};

const PARTS = [
  { label: 'Problem Set 1', preview: 'Planners can’t see which suppliers are behind until a delivery is already late, so they chase them by email.' },
  { label: 'Problem Set 2', preview: 'The scorecard export drops suppliers with no deliveries this quarter.' },
  { label: 'Problem Set 3', preview: 'Overdue counts reset at midnight UTC, not in the planner’s own day.' },
];

/**
 * With `parts`: ticking multipart shows "Rename Individual parts", one title
 * per problem set, each optional (Figma `1666:263661`). The first preview
 * starts open, as the design draws it.
 */
export const NamingParts: Story = {
  args: { multipart: true, parts: PARTS },
};

/**
 * Naming two of three parts and confirming: the titles travel with the
 * answer, in order, `''` where a part was left blank.
 */
export const NamingPartsFlow: Story = {
  args: { open: false },
  render: function NamingPartsStory(args) {
    const [open, setOpen] = React.useState(false);
    const [multipart, setMultipart] = React.useState(false);
    const [result, setResult] = React.useState('nothing yet');
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Accept AV
        </Button>
        <p className="text-caption-md-regular text-text-tertiary">Result: {result}</p>
        <AcceptPendingAVModal
          {...args}
          open={open}
          parts={PARTS}
          multipart={multipart}
          onMultipartChange={setMultipart}
          onClose={() => setOpen(false)}
          onConfirm={({ multipart: isMultipart, titles }) => {
            setResult(`${isMultipart ? 'multipart' : 'single'}: ${JSON.stringify(titles ?? null)}`);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Accept AV' }));
    await screen.findByRole('dialog');

    /* Nothing to name until multipart is ticked. */
    await expect(screen.queryByText('Rename Individual parts')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Multipart Value' }));
    await expect(screen.getByText('Rename Individual parts')).toBeInTheDocument();

    /* Each title field is named by its part; the first preview is open. */
    const first = screen.getByRole('textbox', { name: 'Problem Set 1' });
    const preview1 = screen.getByRole('button', { name: 'Preview Problem Set 1' });
    await expect(preview1).toHaveAttribute('aria-expanded', 'true');
    const preview2 = screen.getByRole('button', { name: 'Preview Problem Set 2' });
    await expect(preview2).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(preview2);
    await expect(preview2).toHaveAttribute('aria-expanded', 'true');
    await expect(screen.getByText(/drops suppliers with no deliveries/)).toBeInTheDocument();

    await userEvent.type(first, '  Supplier chasing  ');
    await userEvent.type(screen.getByRole('textbox', { name: 'Problem Set 3' }), 'Local-day overdue');
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Result: multipart: ["Supplier chasing","","Local-day overdue"]')).toBeInTheDocument();
  },
};

/** The accept is in flight. Confirm spins and cannot be pressed twice. */
export const Accepting: Story = {
  args: { loading: true },
};

/** Every colour is a token. The dialog portals to `body`, so the theme global is what reaches it. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
};

/**
 * Ticking multipart and confirming. The decision travels with the answer, so
 * the caller never has to read it back off the dialog.
 */
export const AcceptingIt: Story = {
  args: { open: false },
  render: function AcceptingItStory(args) {
    const [open, setOpen] = React.useState(false);
    const [multipart, setMultipart] = React.useState(false);
    const [result, setResult] = React.useState('nothing yet');
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Accept AV
        </Button>
        <p className="text-caption-md-regular text-text-tertiary">Result: {result}</p>
        <AcceptPendingAVModal
          {...args}
          open={open}
          multipart={multipart}
          onMultipartChange={setMultipart}
          onClose={() => {
            setResult('cancelled');
            setOpen(false);
          }}
          onConfirm={({ multipart: isMultipart }) => {
            setResult(isMultipart ? 'accepted, multipart' : 'accepted, single');
            setOpen(false);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Accept AV' });

    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    /* The checkbox is named by its title, and explained by its subtitle. */
    const multipart = screen.getByRole('checkbox', { name: 'Multipart Value' });
    await expect(multipart).not.toBeChecked();
    await expect(multipart).toHaveAccessibleDescription(/Split this value into parts/);

    /* No close button — the two answers and Escape are the way out. */
    await expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

    /* The whole card is the label, so clicking the explanation ticks it. */
    await userEvent.click(screen.getByText(/Split this value into parts/));
    await expect(multipart).toBeChecked();

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Result: accepted, multipart')).toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    /* Nothing is destroyed by closing, so the backdrop closes it. */
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(dialog.parentElement as HTMLElement);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Result: cancelled')).toBeInTheDocument();
  },
};
