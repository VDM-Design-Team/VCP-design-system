import type { Meta, StoryObj } from '@storybook/react-vite';
import { DonutChart } from './DonutChart';

const meta = {
  title: 'Atoms/DonutChart',
  component: DonutChart,
  parameters: {
    docs: {
      description: {
        component:
          'One fraction of one whole as a ring, or a half-ring gauge — `ProgressBar` bent into ' +
          'a circle: same `role="progressbar"`, same tones, same track token. The export’s ' +
          'built-in 75%/90% auto-escalation is gone — thresholds are the caller’s domain ' +
          'knowledge, so set `tone` yourself.',
      },
    },
  },
  args: { value: 26, max: 40, caption: 'of 40 pts' },
  argTypes: {
    showValue: { control: 'boolean' },
    tone: { control: 'radio', options: ['brand', 'success', 'warning', 'critical'] },
    half: { control: 'boolean' },
    segmented: { control: 'boolean' },
    size: { control: 'number' },
    thickness: { control: 'number' },
  },
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The percentage is derived for the centre; the announced value stays in real units. */
export const Default: Story = {};

/** The caller walks the tone as its own thresholds decide. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-8">
      <DonutChart {...args} value={16} tone="brand" caption="on track" />
      <DonutChart {...args} value={40} tone="success" caption="delivered" />
      <DonutChart {...args} value={31} tone="warning" caption="running low" />
      <DonutChart {...args} value={39} tone="critical" caption="nearly spent" />
    </div>
  ),
};

/** The half-donut gauge, as the Cycle Summary uses it. */
export const HalfGauge: Story = {
  args: { half: true, caption: 'capacity used' },
};

/** `label` swaps the centred text; the meter still announces the numbers. */
/**
 * `segmented` — flat ends and a gap between fill and remainder, thin ring: the
 * Cycle Summary gauge. The tone is still the caller's call (here: on track,
 * slipping, behind).
 */
export const SegmentedGauge: Story = {
  args: { half: true, segmented: true, size: 200, thickness: 8, max: 100 },
  render: (args) => (
    <div className="flex flex-wrap items-end gap-8">
      <DonutChart {...args} value={92} tone="success" caption="on track" />
      <DonutChart {...args} value={74} tone="warning" caption="slipping" />
      <DonutChart {...args} value={40} tone="critical" caption="behind" />
      <DonutChart {...args} value={0} tone="critical" caption="not started" />
    </div>
  ),
};

/** The light yellow, and a one-off colour through `fillClassName` (a token class). */
export const YellowAndCustomColour: Story = {
  render: (args) => (
    <div className="flex items-end gap-8">
      <DonutChart {...args} value={30} max={40} tone="yellow" caption="getting close" />
      <DonutChart
        {...args}
        value={30}
        max={40}
        fillClassName="stroke-accent-blue-medium"
        caption="custom"
      />
    </div>
  ),
};

/** `showValue={false}`: the ring alone, for a table row. Still a meter, so it is named. */
export const RingOnly: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <DonutChart {...args} value={25} max={100} size={16} thickness={3} showValue={false} aria-label="25% done" />
      <DonutChart {...args} value={70} max={100} size={24} thickness={4} showValue={false} tone="success" aria-label="70% done" />
      <DonutChart {...args} value={40} max={100} size={72} thickness={10} showValue={false} tone="yellow" aria-label="40% done" />
    </div>
  ),
};

export const CustomLabel: Story = {
  args: { label: '26 / 40', caption: 'points' },
};

/** Geometry is numeric: a small one for a card corner, a large one for a summary. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-8">
      <DonutChart {...args} size={72} thickness={10} caption={undefined} aria-label="Storage used" />
      <DonutChart {...args} size={140} />
      <DonutChart {...args} size={200} thickness={20} />
    </div>
  ),
};

/** Track and fills are the ProgressBar tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex gap-8 bg-surface-canvas p-8">
            <DonutChart {...args} />
            <DonutChart {...args} value={39} tone="critical" caption="nearly spent" />
          </div>
        </div>
      ))}
    </div>
  ),
};
