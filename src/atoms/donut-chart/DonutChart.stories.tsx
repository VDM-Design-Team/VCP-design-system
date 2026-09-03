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
    tone: { control: 'radio', options: ['brand', 'success', 'warning', 'danger'] },
    half: { control: 'boolean' },
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
      <DonutChart {...args} value={39} tone="danger" caption="nearly spent" />
    </div>
  ),
};

/** The half-donut gauge, as the Cycle Summary uses it. */
export const HalfGauge: Story = {
  args: { half: true, caption: 'capacity used' },
};

/** `label` swaps the centred text; the meter still announces the numbers. */
export const CustomLabel: Story = {
  args: { label: '26 / 40', caption: 'points' },
};

/** Geometry is numeric: a small one for a card corner, a large one for a summary. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-8">
      <DonutChart {...args} size={72} thickness={10} caption={undefined} />
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
            <DonutChart {...args} value={39} tone="danger" caption="nearly spent" />
          </div>
        </div>
      ))}
    </div>
  ),
};
