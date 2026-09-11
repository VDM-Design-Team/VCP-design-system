import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { ReviewAVModal } from './ReviewAVModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/ReviewAVModal',
  component: ReviewAVModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'What an initiator or admin reads before accepting or rejecting handed-off work. The ' +
          'body is **read-only** — the estimate, the completion date, the links and the ' +
          'attachments, shown to be judged rather than edited. **Rejecting opens a second dialog ' +
          'on top of this one**, which is the design’s `Rejection Modal=Show` variant and a real ' +
          'nested `Modal`: the review goes inert behind it and is dimmed by the inner backdrop.',
      },
    },
  },
  args: {
    open: true,
    onClose: () => {},
    onAccept: () => {},
    onReject: () => {},
    avName: 'AV Name',
    completionDate: 'May 1, 2026',
    links: ['https://test.com'],
    domainOption: true,
  },
  argTypes: {
    domain: { control: 'inline-radio', options: ['design', 'development'] },
  },
} satisfies Meta<typeof ReviewAVModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Design reviewing. The one domain choice is "Copy to Dev". */
export const Default: Story = {
  args: { attachments: [{ name: 'image.png', size: '284 KB' }] },
};

/** Development reviewing. The same dialog, asking a different question. */
export const DevelopmentDomain: Story = {
  args: { domain: 'development', attachments: [{ name: 'image.png', size: '284 KB' }] },
};

/**
 * Nothing was filled in. Missing values show an em dash; an empty attachment
 * list gets the design's own sentence, because "none" is a fact about the
 * handoff rather than a missing value.
 */
export const NothingHandedOff: Story = {
  args: { completionDate: undefined, links: [], attachments: [], domainOption: false },
};

/** Every colour is a token. The dialog portals to `body`, so the theme global reaches it. */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  args: { attachments: [{ name: 'image.png', size: '284 KB' }] },
};

/**
 * Accepting. The domain's one choice travels with the answer, so the caller
 * never reads it back off its own state.
 */
export const Accepting: Story = {
  args: { open: false },
  render: function AcceptingStory(args) {
    const [open, setOpen] = React.useState(false);
    const [option, setOption] = React.useState(false);
    const [result, setResult] = React.useState('nothing yet');
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Review AV
        </Button>
        <p className="text-body-sm text-text-tertiary">Result: {result}</p>
        <ReviewAVModal
          {...args}
          open={open}
          domainOption={option}
          onDomainOptionChange={setOption}
          onClose={() => setOpen(false)}
          onAccept={({ domainOption }) => {
            setResult(`accepted, copyToDev=${domainOption}`);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Review AV' }));
    await screen.findByRole('dialog');

    /* The body is a read: the links are real links, not inputs. */
    await expect(screen.getByRole('link', { name: 'https://test.com' })).toHaveAttribute(
      'href',
      'https://test.com',
    );
    await expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Copy to Dev' }));
    await userEvent.click(screen.getByRole('button', { name: 'Accept' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByText('Result: accepted, copyToDev=true')).toBeInTheDocument();
  },
};

/**
 * Rejecting, which is the whole nested-dialog case: the review goes inert
 * behind the rejection dialog, Escape closes only the inner one, and the
 * reason travels out with the rejection.
 */
export const RejectingOpensASecondDialog: Story = {
  args: { open: false },
  render: function RejectingStory(args) {
    const [open, setOpen] = React.useState(false);
    const [result, setResult] = React.useState('nothing yet');
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Review AV
        </Button>
        <p className="text-body-sm text-text-tertiary">Result: {result}</p>
        <ReviewAVModal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onReject={({ reason }) => {
            setResult(`rejected: ${reason}`);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const named = (name: string) =>
      screen
        .queryAllByRole('dialog')
        .find(
          (d) =>
            document.getElementById(d.getAttribute('aria-labelledby') ?? '')?.textContent === name,
        );

    await userEvent.click(canvas.getByRole('button', { name: 'Review AV' }));
    await waitFor(() => expect(named('Review Task: AV Name')).toBeTruthy());

    /* Reject opens the second dialog over the first. */
    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));
    await waitFor(() => expect(named('Rejection Reason')).toBeTruthy());

    const review = named('Review Task: AV Name') as HTMLElement;
    const rejection = named('Rejection Reason') as HTMLElement;

    /* The review is background now — inert, and dimmed by the inner backdrop. */
    await expect(review.parentElement).toHaveAttribute('inert');
    await expect(rejection.parentElement).not.toHaveAttribute('inert');

    /* The inner Reject is faded until a reason is chosen. */
    const confirm = within(rejection).getByRole('button', { name: 'Reject' });
    await expect(confirm).toBeDisabled();

    /* Escape closes the inner dialog only, and the review comes back live. */
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(named('Rejection Reason')).toBeFalsy());
    await expect((named('Review Task: AV Name') as HTMLElement).parentElement).not.toHaveAttribute(
      'inert',
    );

    /* Reopen, choose a handoff reason, and reject for real. */
    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));
    await waitFor(() => expect(named('Rejection Reason')).toBeTruthy());
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Rejection Reason' }),
      'design-mismatch',
    );
    await userEvent.click(
      within(named('Rejection Reason') as HTMLElement).getByRole('button', { name: 'Reject' }),
    );
    await expect(canvas.getByText('Result: rejected: design-mismatch')).toBeInTheDocument();
  },
};
