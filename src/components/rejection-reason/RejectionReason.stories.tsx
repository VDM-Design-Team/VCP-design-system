import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  RejectionReason,
  PENDING_REJECTION_REASONS,
  HANDOFF_REJECTION_REASONS,
} from './RejectionReason';

const meta = {
  title: 'Components/Forms/RejectionReason',
  component: RejectionReason,
  parameters: {
    docs: {
      description: {
        component:
          'The reason someone gives for rejecting an Added Value: a `Select` of named reasons, the ' +
          'chosen reason’s explanation underneath, and a free-text box when the reason is `Other`. ' +
          '**Two modals need this with different reason sets** — the pending rejection has five, ' +
          'the handoff rejection has six — which is why the sets live here as constants rather ' +
          'than in either modal.',
      },
    },
  },
  args: { reasons: PENDING_REJECTION_REASONS },
  argTypes: { reasons: { control: false } },
  decorators: [
    (Story) => (
      <div className="w-[34rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RejectionReason>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen: the placeholder, and no explanation to give yet. */
export const Default: Story = {};

/** A reason chosen. The explanation is the design's own wording for what it covers. */
export const ReasonChosen: Story = {
  args: { value: 'out-of-scope' },
};

/** `Other` opens the free-text box. It is the only reason in either set that does. */
export const Other: Story = {
  args: { value: 'other', detail: '' },
};

/** The handoff set — six reasons, for work that has been delivered and is being sent back. */
export const HandoffReasons: Story = {
  args: { reasons: HANDOFF_REJECTION_REASONS, value: 'design-mismatch' },
};

/** Every reason in both sets, so the explanations can be read side by side. */
export const EveryReason: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      {(
        [
          ['Pending', PENDING_REJECTION_REASONS],
          ['Handoff', HANDOFF_REJECTION_REASONS],
        ] as const
      ).map(([name, reasons]) => (
        <div key={name} className="flex flex-col gap-4">
          <p className="text-label-md text-text-tertiary">{name}</p>
          {reasons.map((reason) => (
            <RejectionReason
              key={reason.value}
              reasons={reasons}
              value={reason.value}
              label={`${name} rejection reason`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Every colour is a token, so dark comes free. */
export const LightAndDark: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-6">
            <RejectionReason {...args} value="duplicate" />
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Choosing a reason, then choosing `Other`. The explanation follows the
 * choice, and the free-text box appears only for the reason that asks for it.
 */
export const ChoosingAReason: Story = {
  render: function ChoosingAReasonStory(args) {
    const [value, setValue] = React.useState<string>();
    const [detail, setDetail] = React.useState('');
    return (
      <RejectionReason
        {...args}
        value={value}
        onChange={setValue}
        detail={detail}
        onDetailChange={setDetail}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Rejection reason' });

    /* Nothing chosen: no explanation, no free text. */
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();

    await userEvent.selectOptions(select, 'duplicate');
    const description = canvas.getByText(/Overlaps with an existing/);
    await expect(description).toBeInTheDocument();
    /* The explanation describes the control, rather than floating beside it. */
    await expect(select).toHaveAttribute('aria-describedby', description.id);
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();

    /* `Other` is the one that opens the box — and it has no explanation. */
    await userEvent.selectOptions(select, 'other');
    await expect(canvas.queryByText(/Overlaps with an existing/)).not.toBeInTheDocument();
    const detail = canvas.getByRole('textbox', { name: 'Rejection reason — details' });
    await userEvent.type(detail, 'Raised in the wrong quarter');
    await expect(detail).toHaveValue('Raised in the wrong quarter');

    /* And going back to a named reason closes it again. */
    await userEvent.selectOptions(select, 'needs-refinement');
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};
