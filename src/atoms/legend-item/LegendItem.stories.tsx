import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { LegendItem } from './LegendItem';

const meta = {
  title: 'Atoms/LegendItem',
  component: LegendItem,
  parameters: {
    docs: {
      description: {
        component:
          'One entry in a chart legend: a colour key and its word. The swatch is decoration; the ' +
          'label is the meaning. `tone` is `ProgressBar`’s and `DonutChart`’s, so a legend ' +
          'cannot drift from its chart.',
      },
    },
  },
  args: { label: 'Completed', tone: 'success' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['brand', 'success', 'warning', 'critical', 'info'],
    },
    size: { control: 'radio', options: ['sm', 'md'] },
    label: { control: 'text' },
  },
} satisfies Meta<typeof LegendItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* The swatch is decoration — only the word is exposed. */
    await expect(c.getByText('Completed')).toBeVisible();
    await expect(canvasElement.querySelector('[aria-hidden="true"]')).not.toBeNull();
  },
};

/** A legend is a row of items; wrap them in a list. `md` for dashboards, `sm` under a Gantt. */
export const InALegend: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-wrap gap-4">
        {(
          [
            ['Completed', 'success'],
            ['Committed', 'info'],
            ['Overdue', 'critical'],
            ['Available', 'brand'],
          ] as const
        ).map(([label, tone]) => (
          <li key={label}>
            <LegendItem label={label} tone={tone} />
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-4">
        {(
          [
            ['Planned', 'brand'],
            ['Work In Progress', 'warning'],
            ['Completed', 'success'],
            ['Overdue', 'critical'],
          ] as const
        ).map(([label, tone]) => (
          <li key={label}>
            <LegendItem size="sm" label={label} tone={tone} />
          </li>
        ))}
      </ul>
    </div>
  ),
};

/** Same tones as `ProgressBar`; dark comes from the tokens. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-wrap gap-4 bg-surface-canvas p-8">
            {(['brand', 'success', 'warning', 'critical', 'info'] as const).map(
              (tone) => (
                <LegendItem key={tone} tone={tone} label={tone} />
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  ),
};
