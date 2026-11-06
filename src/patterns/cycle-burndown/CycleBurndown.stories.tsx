import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CycleBurndown, type CycleBurndownStat } from './CycleBurndown';
import type { LineChartDatum } from '../../components/line-chart';

/* What a backend might return for a cycle: one row per working day, in snake_case, dates as ISO strings. */
const API_RESPONSE = {
  cycle: 'C37',
  days: [
    { date: '2025-06-16', completed_pts: 175, committed_pts: 180, overdue_pts: 12, available_pts: 150 },
    { date: '2025-06-17', completed_pts: 150, committed_pts: 160, overdue_pts: 14, available_pts: 135 },
    { date: '2025-06-18', completed_pts: 162, committed_pts: 140, overdue_pts: 18, available_pts: 120 },
    { date: '2025-06-19', completed_pts: 158, committed_pts: 120, overdue_pts: 25, available_pts: 105 },
    { date: '2025-06-20', completed_pts: 100, committed_pts: 100, overdue_pts: 20, available_pts: 90 },
    { date: '2025-06-23', completed_pts: 70, committed_pts: 80, overdue_pts: 16, available_pts: 75 },
    { date: '2025-06-24', completed_pts: 45, committed_pts: 60, overdue_pts: 10, available_pts: 60 },
    { date: '2025-06-25', completed_pts: 30, committed_pts: 40, overdue_pts: 6, available_pts: 45 },
    { date: '2025-06-26', completed_pts: 20, committed_pts: 20, overdue_pts: 2, available_pts: 30 },
  ],
  totals: { completed: 168, remaining: 0, off_track: 0 },
};

/* The whole of "plugging it in": map each day to `{ key, label, title, values }`, and the totals to `stats`. Dates are formatted here, by the caller. */
const fullDate = (iso: string) => `${iso.slice(5, 7)}.${iso.slice(8)}.${iso.slice(0, 4)}`;
const dayLabel = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
const toData = (r: typeof API_RESPONSE): LineChartDatum[] =>
  r.days.map((d) => ({
    key: d.date,
    label: dayLabel(d.date),
    title: fullDate(d.date),                    // the hover card's heading, under `pointLabel` ("Date: 06.20.2025")
    values: { completed: d.completed_pts, committed: d.committed_pts, overdue: d.overdue_pts, available: d.available_pts },
  }));
const toStats = (r: typeof API_RESPONSE): CycleBurndownStat[] => [
  { key: 'completed', label: 'Completed', value: r.totals.completed, tone: 'success' },
  { key: 'remaining', label: 'Remaining', value: r.totals.remaining, tone: 'brand' },
  { key: 'off-track', label: 'Off-track', value: r.totals.off_track, tone: 'critical' },
];

const meta = {
  title: 'Patterns/CycleBurndown',
  component: CycleBurndown,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'How a cycle burned down over its days: a line for each of Completed, Committed, Overdue and Available, with a row of totals under the chart. Pass one entry per day; the axis, lines, tooltip and legend follow. There are no filters: when the page’s timeframe or team changes, pass the new data.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    data: toData(API_RESPONSE),
    stats: toStats(API_RESPONSE),
    hint: 'How the cycle’s points burned down day by day: completed, committed, overdue and available.',
  },
} satisfies Meta<typeof CycleBurndown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nine working days, four lines, the totals under the chart, the legend at the bottom. Hover for the day's card: "Date: 06.20.2025" over each line's value. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Cycle Burndown' })).toBeInTheDocument();
    await expect(c.getByRole('button', { name: 'About Cycle Burndown' })).toBeInTheDocument();
    await expect(c.getByText('Completed', { selector: 'dt' })).toBeVisible();
    await expect(c.getByText('168', { selector: 'dd' })).toBeVisible();
    await expect(within(c.getByRole('list', { name: 'Legend' })).getAllByRole('listitem')).toHaveLength(4);
    await expect(canvasElement.querySelectorAll('svg circle')).toHaveLength(36);
    const target = canvasElement.querySelector('svg rect[fill="transparent"]') as SVGRectElement;
    const r = target.getBoundingClientRect();
    await userEvent.pointer({ target, coords: { clientX: r.left + r.width / 2, clientY: r.top + 40 } });
    await expect((await c.findByText('Date:')).parentElement).toHaveTextContent('Date: 06.20.2025');
  },
};

/** **How to supply the data.** This story starts from a raw API response (`API_RESPONSE`, in its source) and shows the whole mapping: each day becomes `{ key, label, values }`, the totals become `stats`. The chart does no arithmetic and no date formatting of its own. */
export const FromAnApiResponse: Story = {
  render: (args) => {
    const [response, setResponse] = React.useState(API_RESPONSE);
    return (
      <div className="flex flex-col gap-4">
        <button type="button" className="self-start rounded-sm border border-stroke-default px-3 py-1 text-body-sm-regular text-text-primary" onClick={() => setResponse({ ...API_RESPONSE, days: API_RESPONSE.days.slice(0, 5), totals: { completed: 80, remaining: 100, off_track: 12 } })}>
          Switch to the first week
        </button>
        <CycleBurndown {...args} data={toData(response)} stats={toStats(response)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(canvasElement.querySelectorAll('svg circle')).toHaveLength(36);
    c.getByRole('button', { name: 'Switch to the first week' }).click();
    await expect(await c.findByText('80', { selector: 'dd' })).toBeVisible();
    await expect(canvasElement.querySelectorAll('svg circle')).toHaveLength(20);
  },
};

/** The page's timeframe is changing: the card says so, the stats go, and one status announces it. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading Cycle Burndown');
    await expect(c.queryByRole('term')).toBeNull();
  },
};

/** A cycle with no days yet. */
export const Empty: Story = {
  args: { data: [], stats: [], empty: 'This cycle has no burndown yet.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('This cycle has no burndown yet.')).toBeVisible();
  },
};

/** Without a hint or totals it is just the title, the chart and the legend. */
export const Minimal: Story = {
  args: { hint: undefined, stats: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /About/ })).toBeNull();
  },
};

/** Fewer lines: pass the series you want, and the legend follows. */
export const TwoLines: Story = { args: { series: ['committed', 'completed'] } };

/** In a 360 card the plot narrows and thins its date labels, and the totals and legend wrap; nothing overflows. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('section') as HTMLElement;
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
