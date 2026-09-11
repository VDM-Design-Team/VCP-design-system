import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SegmentedControl } from './SegmentedControl';
import { Field } from '../../components/field';
import { useFakeSave } from '../../lib/story-saving';

const meta = {
  title: 'Atoms/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          'A small set of mutually exclusive options, all visible at once. Use it to switch how ' +
          'the same content is shown — List / Board / Calendar — not to move between different ' +
          'pages of content. Two to five options; past five, use a Select. It is a radio group, ' +
          'so arrow keys move between segments and the whole control is a single tab stop.',
      },
    },
  },
  args: {
    'aria-label': 'View mode',
    options: ['List', 'Board', 'Calendar'],
    defaultValue: 'Board',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'] },
    fullWidth: { control: 'boolean' },
    status: { control: 'inline-radio', options: ['idle', 'pending', 'success', 'error'] },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <SegmentedControl {...args} size="sm" />
      <SegmentedControl {...args} size="md" />
    </div>
  ),
};

/** Two options is the floor. Below that, use a Toggle. */
export const TwoOptions: Story = {
  args: { options: ['Active', 'Archived'], defaultValue: 'Active' },
};

/** Five is the ceiling. Past that the labels crowd and a Select reads better. */
export const FiveOptions: Story = {
  args: {
    options: ['Day', 'Week', 'Month', 'Quarter', 'Year'],
    defaultValue: 'Week',
    'aria-label': 'Time range',
  },
};

/** A disabled segment stays visible and announced, so the option is discoverable but unavailable. */
export const WithDisabledOption: Story = {
  args: {
    options: [
      { value: 'List', label: 'List' },
      { value: 'Board', label: 'Board' },
      { value: 'Calendar', label: 'Calendar', disabled: true },
    ],
    defaultValue: 'List',
  },
};

/** Stretches to its container — mobile toolbars and modal headers. */
export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <div className="w-96">
      <SegmentedControl {...args} />
    </div>
  ),
};

/** Long labels truncate rather than wrap, so the control keeps one row. */
export const LongLabels: Story = {
  args: {
    options: ['Everything assigned to me', 'My team', 'All'],
    defaultValue: 'My team',
    fullWidth: true,
  },
  render: (args) => (
    <div className="w-80">
      <SegmentedControl {...args} />
    </div>
  ),
};

/** Controlled — the parent owns the value. */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('List');
    return (
      <div className="flex flex-col gap-2">
        <SegmentedControl {...args} value={value} onChange={setValue} />
        <p className="text-body-sm text-text-secondary">Showing: {value}</p>
      </div>
    );
  },
};

/** Both themes side by side — the selected segment must stay readable in each. */
export const DarkTheme: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      <div className="bg-surface-canvas p-8">
        <SegmentedControl {...args} />
      </div>
      <div className="dark bg-surface-canvas p-8">
        <SegmentedControl {...args} />
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
 * Saving a change. The parent drives `status`; the control only shows it.
 * ------------------------------------------------------------------------- */

const VIEWS = ['List', 'Board', 'Calendar'];

/** Both themes of one fixed state, side by side. No landmarks, so no a11y exemption needed. */
const BothThemes = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2">
    <div className="bg-surface-canvas p-8">{children}</div>
    <div className="dark bg-surface-canvas p-8">{children}</div>
  </div>
);

/**
 * A save in flight: the selected label mutes, a spinner rides in the segment,
 * the group is `aria-busy`, and no other segment can be chosen until it settles.
 */
export const Pending: Story = {
  parameters: { layout: 'fullscreen' },
  args: { value: 'Board', status: 'pending' },
  render: (args) => (
    <BothThemes>
      <SegmentedControl {...args} />
    </BothThemes>
  ),
};

/** The save landed: a check in the selected segment. The parent returns it to idle after about 1.5 s. */
export const Success: Story = {
  parameters: { layout: 'fullscreen' },
  args: { value: 'Board', status: 'success' },
  render: (args) => (
    <BothThemes>
      <SegmentedControl {...args} />
    </BothThemes>
  ),
};

/**
 * The save failed. The track takes the critical stroke and `aria-invalid`; the
 * message belongs to `Field`, which wires it to the group through
 * `aria-describedby`. The parent has kept the previous `value`.
 */
export const ErrorState: Story = {
  parameters: { layout: 'fullscreen' },
  args: { value: 'Board', status: 'error' },
  render: (args) => (
    <BothThemes>
      <Field error="Couldn’t save the view. Try again.">
        {(control) => <SegmentedControl {...args} {...control} />}
      </Field>
    </BothThemes>
  ),
};

/* ---------------------------------------------------------------------------
 * Interaction tests. Each `play` runs in the browser under `npm test`.
 * ------------------------------------------------------------------------- */

/** Clicking a segment selects it and deselects the previous one. */
export const SelectsOnClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Calendar' }));
    await expect(canvas.getByRole('radio', { name: 'Calendar' })).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('radio', { name: 'Board' })).toHaveAttribute('aria-checked', 'false');
  },
};

/**
 * One tab stop, then arrows. Tab lands on the selected segment; arrows move
 * and select as they go; Home and End jump to the ends.
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = (name: string) => canvas.getByRole('radio', { name });
    await userEvent.tab();
    await expect(radio('Board')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(radio('Calendar')).toHaveFocus();
    await expect(radio('Calendar')).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Home}');
    await expect(radio('List')).toHaveFocus();
    await expect(radio('List')).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{End}');
    await expect(radio('Calendar')).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(radio('Board')).toHaveAttribute('aria-checked', 'true');
  },
};

/**
 * The parent's half of the contract, from the shared story helper: keep the
 * previous value, start the save, move `status` along with it, return to idle
 * after a beat. The control times nothing and reverts nothing.
 */
function SavingView({ outcome }: { outcome: 'resolve' | 'reject' }) {
  const { value, status, error, save } = useFakeSave('List', outcome);
  return (
    <Field error={error}>
      {(control) => (
        <SegmentedControl
          aria-label="View mode"
          options={VIEWS}
          value={value}
          onChange={save}
          status={status}
          {...control}
        />
      )}
    </Field>
  );
}

/** Choose, wait, saved: pending → success → idle, each observable. */
export const SaveSucceeds: Story = {
  render: () => <SavingView outcome="resolve" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup');
    await userEvent.click(canvas.getByRole('radio', { name: 'Calendar' }));
    await expect(group).toHaveAttribute('aria-busy', 'true');
    await expect(group).toHaveAttribute('data-status', 'pending');
    /* While pending, the selection is spoken for. */
    await userEvent.click(canvas.getByRole('radio', { name: 'List' }));
    await expect(canvas.getByRole('radio', { name: 'Calendar' })).toHaveAttribute('aria-checked', 'true');
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'success'));
    await expect(group).not.toHaveAttribute('aria-busy');
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'idle'), { timeout: 3000 });
    await expect(canvas.getByRole('radio', { name: 'Calendar' })).toHaveAttribute('aria-checked', 'true');
  },
};

/** Choose, wait, failed: the previous selection comes back and the message is announced. */
export const SaveFails: Story = {
  render: () => <SavingView outcome="reject" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup');
    await userEvent.click(canvas.getByRole('radio', { name: 'Calendar' }));
    await expect(group).toHaveAttribute('data-status', 'pending');
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'error'));
    await expect(group).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('radio', { name: 'Calendar' })).toHaveAttribute('aria-checked', 'false');
    const message = canvas.getByRole('alert');
    await expect(message).toHaveTextContent('Couldn’t save');
    await expect(group).toHaveAttribute('aria-describedby', message.id);
    /* The next choice clears the error. */
    await userEvent.click(canvas.getByRole('radio', { name: 'Board' }));
    await expect(group).toHaveAttribute('data-status', 'pending');
  },
};
