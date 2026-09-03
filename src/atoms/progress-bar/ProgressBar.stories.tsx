import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'Atoms/ProgressBar',
  component: ProgressBar,
  parameters: {
    docs: {
      description: {
        component:
          'A determinate meter: how much of a known whole is used or done. `role="progressbar"` ' +
          'with real values — the promise `Spinner` refuses to make. `tone` is consumption ' +
          'status, not decoration; the threshold that picks it is the caller’s domain ' +
          'knowledge, so it lives outside this component.',
      },
    },
  },
  args: { value: 64 },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    max: { control: 'number' },
    tone: { control: 'radio', options: ['brand', 'success', 'warning', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md'] },
    label: { control: 'text' },
    showValue: { control: 'boolean' },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The visible label names the meter via `aria-labelledby`. */
export const Default: Story = {
  args: { label: 'Capacity points used', showValue: true },
  render: (args) => (
    <div className="w-96">
      <ProgressBar {...args} />
    </div>
  ),
};

/** One token per tone: `surface.brand.strong`, then the `accent.*.filled` surfaces. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-6">
      <ProgressBar {...args} tone="brand" label="On track" value={40} />
      <ProgressBar {...args} tone="success" label="Delivered" value={100} />
      <ProgressBar {...args} tone="warning" label="Running low" value={78} />
      <ProgressBar {...args} tone="danger" label="Over budget" value={97} />
    </div>
  ),
};

/** `sm` for dense table rows, `md` everywhere else. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-6">
      <ProgressBar {...args} size="md" label="md — the default" />
      <ProgressBar {...args} size="sm" label="sm — table rows" />
    </div>
  ),
};

/**
 * `max` other than 100: the announced value is the real one (34 of 40); only
 * the painted percentage is derived.
 */
export const RealUnits: Story = {
  args: { value: 34, max: 40, label: 'Points consumed', showValue: true },
  render: (args) => (
    <div className="w-96">
      <ProgressBar {...args} />
    </div>
  ),
};

/**
 * No visible label — the name must come from somewhere, so pass `aria-label`.
 * A bare unnamed meter announces as a percentage of nothing.
 */
export const Unlabelled: Story = {
  args: { 'aria-label': 'Upload progress' } as never,
  render: (args) => (
    <div className="w-96">
      <ProgressBar {...args} />
    </div>
  ),
};

/** Track and fills are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-6 bg-surface-canvas p-8">
            <ProgressBar value={40} label="On track" showValue />
            <ProgressBar value={78} tone="warning" label="Running low" showValue />
            <ProgressBar value={97} tone="danger" label="Over budget" showValue />
          </div>
        </div>
      ))}
    </div>
  ),
};
