import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './StatCard';
import { Icon } from '../../atoms/icon';
import { DonutChart } from '../../atoms/donut-chart';

const meta = {
  title: 'Components/Display/StatCard',
  component: StatCard,
  parameters: {
    docs: {
      description: {
        component:
          'One number that matters, on a card. `deltaTone` is judgment, not direction — the ' +
          'caller says positive/negative/neutral and the colour follows the meaning; the sign ' +
          'lives in the delta text. The label is not a heading: the dashboard section owns ' +
          'the outline.',
      },
    },
  },
  args: { label: 'Open claims', value: '128' },
  argTypes: {
    deltaTone: { control: 'radio', options: ['positive', 'negative', 'neutral'] },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    delta: '+12%',
    deltaTone: 'positive',
    footer: 'vs last cycle',
    icon: <Icon name="graph" size="sm" />,
  },
  render: (args) => (
    <div className="w-64">
      <StatCard {...args} />
    </div>
  ),
};

/**
 * Judgment, not direction: costs going up is negative even though the arrow
 * points up. The sign carries the direction; the colour carries the verdict.
 */
export const DeltaIsJudgment: Story = {
  render: () => (
    <div className="grid w-160 grid-cols-3 gap-4">
      <StatCard label="Points delivered" value="34" delta="+8" deltaTone="positive" footer="vs last cycle" />
      <StatCard label="Handling cost" value="€41k" delta="+12%" deltaTone="negative" footer="vs last cycle" />
      <StatCard label="Suppliers active" value="42" delta="±0" deltaTone="neutral" footer="vs last cycle" />
    </div>
  ),
};

/** `unit` sits beside the value at caption size. */
export const WithUnit: Story = {
  args: { label: 'Capacity used', value: '26', unit: 'of 40 pts' },
  render: (args) => (
    <div className="w-64">
      <StatCard {...args} />
    </div>
  ),
};

/** A dashboard row — the natural habitat. */
export const Tiled: Story = {
  render: () => (
    <div className="grid w-200 grid-cols-4 gap-4">
      <StatCard label="Open claims" value="128" delta="+6" deltaTone="neutral" icon={<Icon name="file" size="sm" />} />
      <StatCard label="Escalations" value="6" delta="+2" deltaTone="negative" icon={<Icon name="warning" size="sm" />} />
      <StatCard label="Reconciled" value="1,204" delta="+38" deltaTone="positive" icon={<Icon name="check-circle" size="sm" />} />
      <StatCard label="Avg. response" value="2.4" unit="days" delta="−0.3" deltaTone="positive" icon={<Icon name="clock" size="sm" />} />
    </div>
  ),
};

/** Values are nodes — a small DonutChart makes a gauge tile. */
export const WithADonut: Story = {
  render: () => (
    <div className="w-64">
      <StatCard
        label="Capacity used"
        value={<DonutChart value={26} max={40} size={72} thickness={10} caption="of 40 pts" />}
        footer="Cycle 2026-Q3"
      />
    </div>
  ),
};

/** Card, numerals and deltas are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="grid grid-cols-2 gap-4 bg-surface-canvas p-8">
            <StatCard label="Points delivered" value="34" delta="+8" deltaTone="positive" />
            <StatCard label="Handling cost" value="€41k" delta="+12%" deltaTone="negative" />
          </div>
        </div>
      ))}
    </div>
  ),
};
