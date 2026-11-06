import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BarChart, type BarChartDatum } from './BarChart';

const CYCLES: BarChartDatum[] = [
  { key: 1, label: 'Jan C23', values: { available: 130, completed: 140, overdue: 30 } },
  { key: 2, label: 'Jan C24', values: { available: 115, completed: 125, overdue: 20 } },
  { key: 3, label: 'Feb C25', values: { available: 157, completed: 120, overdue: 46 } },
  { key: 4, label: 'Feb C26', values: { available: 139, completed: 66 } },
  { key: 5, label: 'Mar C27', values: { available: 104, completed: 146, overdue: 15 } },
  { key: 6, label: 'Mar C28', values: { available: 125, completed: 112, overdue: 25 } },
  { key: 7, label: 'Mar C29', values: { available: 125, completed: 112, overdue: 25 } },
];

const meta = {
  title: 'Components/Display/BarChart',
  component: BarChart,
  parameters: {
    docs: {
      description: {
        component:
          'Grouped bars over a category axis, drawn in SVG to the width it is given. Pass `data` and `series`; the axis, bars, tooltip and legend follow. The picture is hidden from assistive tech and the same numbers are in a visually hidden table.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl rounded-md bg-surface-elevated p-6">
        <Story />
      </div>
    ),
  ],
  args: { data: CYCLES, series: ['available', 'overdue', 'completed'], caption: 'Cycle Performance', yLabel: 'Development Points' },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Seven cycles, three series: the axis runs to the next readable number above the largest value (157 → 175), and the numbers are written on the bars. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* The same numbers, as a table, for assistive tech. */
    const table = c.getByRole('table', { name: 'Cycle Performance' });
    await expect(within(table).getAllByRole('row')).toHaveLength(8);
    await expect(within(table).getByRole('row', { name: /Feb C25/ })).toHaveTextContent('157 pts');
    /* A series left out of a group is "no data", not 0. */
    await expect(within(table).getByRole('row', { name: /Feb C26/ })).toHaveTextContent('no data');
    /* The axis tops out at 175. */
    const svg = canvasElement.querySelector('svg')!;
    await expect(svg.textContent).toContain('175');
    await expect(svg.textContent).not.toContain('200');
    /* The legend follows the series. */
    await expect(within(c.getByRole('list', { name: 'Legend' })).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Available', 'Overdue', 'Completed']);
  },
};

/** Hover a group for every value in it. */
export const Tooltip: Story = {
  play: async ({ canvasElement }) => {
    const targets = canvasElement.querySelectorAll('svg rect[fill="transparent"]');
    await userEvent.hover(targets[2] as Element);
    const tip = await within(canvasElement).findByText('Feb C25', { selector: 'p' });
    const box = tip.parentElement as HTMLElement;
    await expect(within(box).getByText('157 pts')).toBeVisible();
    await expect(within(box).getByText('46 pts')).toBeVisible();
    await userEvent.unhover(targets[2] as Element);
    await expect(within(canvasElement).queryByText('Feb C25', { selector: 'p' })).toBeNull();
  },
};

/** Sprint Metrics' look: the numbers over the bars, dashed gridlines, the legend on top, and a few ticks. */
export const NumbersAboveDashedGrid: Story = {
  args: {
    caption: 'Sprint Metrics',
    yLabel: 'Points',
    series: ['available', 'committed', 'completed', 'overdue'],
    seriesLabels: { available: 'Capacity', committed: 'Commitment' },
    data: [
      { key: 1, label: 'Jan 18 - Feb 1', values: { available: 120, committed: 96, completed: 88, overdue: 8 } },
      { key: 2, label: 'Feb 1 - Feb 15', values: { available: 120, committed: 110, completed: 104, overdue: 6 } },
      { key: 3, label: 'Feb 15 - Mar 1', values: { available: 120, committed: 92, completed: 60, overdue: 32 } },
    ],
    valueLabels: 'above',
    grid: 'dashed',
    legend: 'top',
    yTickCount: 4,
    maxBarWidth: 48,
  },
};

/** `yMax` pins the top, so two charts can be read side by side. */
export const PinnedAxis: Story = {
  args: { yMax: 200, data: CYCLES.slice(0, 3) },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg')!.textContent).toContain('200');
  },
};

/** It draws to the width it is given. At 320 the bars narrow, give up the numbers they cannot hold, and the category labels thin out; nothing overflows. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg')!;
    const wrapper = svg.parentElement as HTMLElement;
    await expect(svg.getBoundingClientRect().width).toBeLessThanOrEqual(wrapper.getBoundingClientRect().width);
    /* Labels thinned out: fewer than seven category labels are drawn. */
    const labels = [...svg.querySelectorAll('text')].filter((t) => /C2\d/.test(t.textContent ?? ''));
    await expect(labels.length).toBeLessThan(7);
    await expect(labels.length).toBeGreaterThan(0);
  },
};

/** Many categories: every bar keeps at least a few pixels, and the labels give way first. */
export const ManyCategories: Story = {
  args: { data: Array.from({ length: 24 }, (_, i) => ({ key: i, label: `Week ${i + 1}`, values: { available: 60 + ((i * 7) % 40), completed: 40 + ((i * 11) % 50) } })), series: ['available', 'completed'] },
};

/** A value too small to hold its number keeps its bar and drops the number (it is still in the tooltip and the table). */
export const SmallValues: Story = {
  args: { data: [{ key: 1, label: 'Jan C23', values: { available: 200, completed: 3, overdue: 1 } }] },
};

/** With nothing to draw, it says so. */
export const Empty: Story = { args: { data: [] }, play: async ({ canvasElement }) => expect(within(canvasElement).getByText('Nothing to show for this period.')).toBeVisible() };

/** While the data loads: a placeholder and one status. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Loading Cycle Performance');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
