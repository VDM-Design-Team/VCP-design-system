import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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

/** Sprint Metrics' look: the numbers over the bars, dashed gridlines and a few ticks. */
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

/** The plot is one tab stop: the left and right arrows move from group to group, the group is announced, Home and End jump and Escape clears. */
export const KeyboardReading: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole('group', { name: /Cycle Performance/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(c.getByRole('status')).toHaveTextContent('Jan C23: Available 130 pts, Overdue 30 pts, Completed 140 pts');
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(c.getByRole('status')).toHaveTextContent('Feb C25: Available 157 pts');
    await userEvent.keyboard('{End}');
    await expect(c.getByRole('status')).toHaveTextContent('Mar C29');
    await userEvent.keyboard('{Home}');
    await expect(c.getByRole('status')).toHaveTextContent('Jan C23');
    await userEvent.keyboard('{Escape}');
    await expect(c.getByRole('status')).toHaveTextContent('');
  },
};

/** `formatValue` says how a number reads on a bar, in the tooltip, the table and the announcement; `formatTick` says how the value axis reads. Here, thousands as "1.2k" and money with a symbol. */
export const FormattedNumbers: Story = {
  args: {
    data: [
      { key: 1, label: 'Q1', values: { available: 1200, completed: 900 } },
      { key: 2, label: 'Q2', values: { available: 1500, completed: 1350 } },
    ],
    series: ['available', 'completed'],
    unit: 'USD',
    yLabel: 'Revenue',
    formatValue: (v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`),
    formatTick: (t) => (t >= 1000 ? `${t / 1000}k` : String(t)),
  },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg')!;
    await expect(svg.textContent).toContain('$1.2k');
    await expect(svg.textContent).toMatch(/1\.5k|2k/);
    await expect(within(canvasElement).getByRole('row', { name: /Q2/ })).toHaveTextContent('$1.5k');
    await userEvent.tab();
    await userEvent.keyboard('{Home}');
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Q1: Available $1.2k, Completed $0.9k'.replace('$0.9k', '$900'));
  },
};

/** `onSelectDatum` hears a click on a group (with the series of the bar when the click lands on one) and Enter on the keyboard. */
export const SelectingAGroup: Story = {
  args: { onSelectDatum: fn() },
  play: async ({ canvasElement, args }) => {
    const rects = canvasElement.querySelectorAll('svg rect[fill="transparent"]');
    /* The middle of the group is the middle bar: Overdue. */
    const mid = (rects[2] as Element).getBoundingClientRect();
    await userEvent.pointer({ keys: '[MouseLeft]', target: rects[2] as Element, coords: { clientX: mid.left + mid.width / 2, clientY: mid.top + 40 } });
    await expect(args.onSelectDatum).toHaveBeenLastCalledWith(expect.objectContaining({ key: 3 }), 'overdue');
    /* The left edge of the group is between groups: no bar. */
    const r = (rects[0] as Element).getBoundingClientRect();
    await userEvent.pointer({ keys: '[MouseLeft]', target: rects[0] as Element, coords: { clientX: r.left + 2, clientY: r.top + 20 } });
    await expect(args.onSelectDatum).toHaveBeenLastCalledWith(expect.objectContaining({ key: 1 }), undefined);
    /* And from the keyboard: Enter on the group the arrows are on. */
    within(canvasElement).getByRole('group').focus();
    await userEvent.keyboard('{Home}{ArrowRight}{Enter}');
    await expect(args.onSelectDatum).toHaveBeenLastCalledWith(expect.objectContaining({ key: 2 }));
    await expect(within(canvasElement).getByRole('group', { name: /Enter to choose one/ })).toBeInTheDocument();
  },
};

/** `renderTooltip` replaces what the tooltip says (the card and its position stay). */
export const CustomTooltip: Story = {
  args: {
    renderTooltip: ({ datum, series }) => (
      <p className="m-0 text-caption-md-medium text-text-primary">
        {datum.label}: {series.reduce((sum, s) => sum + (datum.values[s] ?? 0), 0)} pts in all
      </p>
    ),
  },
  play: async ({ canvasElement }) => {
    const target = canvasElement.querySelectorAll('svg rect[fill="transparent"]')[2] as Element;
    await userEvent.hover(target);
    await expect(await within(canvasElement).findByText('Feb C25: 323 pts in all')).toBeVisible();
  },
};

/** `toggleSeries` makes each legend entry a button: the chart redraws without that series and its axis follows. The last visible series cannot be hidden. */
export const TogglingSeries: Story = {
  args: { toggleSeries: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const bars = () => canvasElement.querySelectorAll('svg path').length;
    const before = bars();
    const overdue = c.getByRole('button', { name: 'Overdue' });
    await expect(overdue).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(overdue);
    await expect(overdue).toHaveAttribute('aria-pressed', 'false');
    await expect(bars()).toBeLessThan(before);
    /* The data is still all in the table. */
    await expect(within(c.getByRole('table')).getAllByRole('columnheader')).toHaveLength(4);
    await userEvent.click(c.getByRole('button', { name: 'Available' }));
    await userEvent.click(c.getByRole('button', { name: 'Completed' }));
    /* One left: it stays. */
    await expect(c.getByRole('button', { name: 'Completed' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(overdue);
    await expect(overdue).toHaveAttribute('aria-pressed', 'true');
  },
};

/** The axis follows what is drawn: hide the tallest series and the top comes down. */
export const AxisFollowsTheVisibleSeries: Story = {
  args: {
    toggleSeries: true,
    series: ['available', 'completed'],
    data: [{ key: 1, label: 'A', values: { available: 400, completed: 90 } }],
  },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg')!;
    await expect(svg.textContent).toContain('400');
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Available' }));
    await expect(svg.textContent).not.toContain('400');
  },
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

/* WCAG 1.4.3 (text) and 1.4.11 (the bars are graphics that carry meaning). axe cannot see into an `aria-hidden` SVG, so this measures it. */
const channels = (css: string) => css.match(/[\d.]+/g)!.slice(0, 3).map(Number);
const luminance = ([r, g, b]: number[]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** In both themes: the axis text and the numbers over bars hold 4.5:1 on the card, each bar holds 3:1 against the card, and a number written on a bar holds 4.5:1 on that bar. */
export const ContrastHolds: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true }, chromatic: { disableSnapshot: true } },
  render: () => (
    <div>
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined} data-theme-case={isDark ? 'dark' : 'light'}>
          <div className="w-160 bg-surface-elevated p-6" data-card>
            <BarChart data={CYCLES.slice(0, 3)} series={['available', 'committed', 'overdue', 'completed', 'leave']} caption="Contrast" yLabel="Points" legend="none" />
            <BarChart data={CYCLES.slice(0, 3)} series={['available', 'completed']} caption="Over" valueLabels="above" legend="none" />
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const theme of ['light', 'dark']) {
      const scope = canvasElement.querySelector(`[data-theme-case="${theme}"]`) as HTMLElement;
      /* The chart measures its own width: wait for it. */
      await new Promise((r) => setTimeout(r, 300));
      const card = channels(getComputedStyle(scope.querySelector('[data-card]') as HTMLElement).backgroundColor);
      const fills = (el: Element) => channels(getComputedStyle(el).fill);
      const checks: [string, number, number][] = [];
      for (const text of scope.querySelectorAll('svg text.fill-text-secondary, svg text.fill-text-primary')) {
        checks.push([`text "${text.textContent}"`, contrast(fills(text), card), 4.5]);
      }
      for (const g of scope.querySelectorAll('svg g > g')) {
        const path = g.querySelector(':scope > path');
        if (!path) continue;
        checks.push([`bar ${path.getAttribute('class')}`, contrast(fills(path), card), 3]);
        const number = g.querySelector(':scope > text');
        if (number && !number.getAttribute('class')?.includes('fill-text-primary')) checks.push([`number on ${path.getAttribute('class')}`, contrast(fills(number), fills(path)), 4.5]);
      }
      await expect(checks.length).toBeGreaterThan(20);
      for (const [name, ratio, need] of checks) await expect({ theme, name, ok: ratio >= need }).toEqual({ theme, name, ok: true });
    }
  },
};
