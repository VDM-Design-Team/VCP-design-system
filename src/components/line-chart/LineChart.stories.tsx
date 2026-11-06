import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { LineChart, type LineChartDatum } from './LineChart';

/* Nine working days: the chart spaces the points evenly in the order given, so the weekend between June 20 and 23 leaves no gap. */
const DAYS: LineChartDatum[] = [
  { key: '06-16', label: 'June 16', values: { completed: 175, committed: 180, overdue: 12, available: 150 } },
  { key: '06-17', label: 'June 17', values: { completed: 150, committed: 160, overdue: 14, available: 135 } },
  { key: '06-18', label: 'June 18', values: { completed: 162, committed: 140, overdue: 18, available: 120 } },
  { key: '06-19', label: 'June 19', values: { completed: 158, committed: 120, overdue: 25, available: 105 } },
  { key: '06-20', label: 'June 20', title: 'Fri 20 June 2025', values: { completed: 100, committed: 100, overdue: 20, available: 90 } },
  { key: '06-23', label: 'June 23', values: { completed: 70, committed: 80, overdue: 16, available: 75 } },
  { key: '06-24', label: 'June 24', values: { completed: 45, committed: 60, overdue: 10, available: 60 } },
  { key: '06-25', label: 'June 25', values: { completed: 30, committed: 40, overdue: 6, available: 45 } },
  { key: '06-26', label: 'June 26', values: { completed: 20, committed: 20, overdue: 2, available: 30 } },
];

const meta = {
  title: 'Components/Display/LineChart',
  component: LineChart,
  parameters: {
    docs: {
      description: {
        component:
          'One line per series across an ordered axis, a dot at every point, drawn in SVG to the width it is given. Pass `data` and `series`; the axis, lines, tooltip and legend follow. The plot is a single keyboard stop (arrow keys read each point), and the data is also in a visually hidden table.',
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
  args: { data: DAYS, series: ['completed', 'committed', 'overdue', 'available'], caption: 'Cycle Burndown', yLabel: 'Development Points' },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four lines over nine days. The axis tops out at the next readable number above the largest value (180 → 200). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const svg = canvasElement.querySelector('svg')!;
    await expect(svg.querySelectorAll('path[stroke-width="2"]')).toHaveLength(4);
    /* A dot for every point of every line. */
    await expect(svg.querySelectorAll('circle')).toHaveLength(36);
    await expect(within(c.getByRole('list', { name: 'Legend' })).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Completed', 'Committed', 'Overdue', 'Available']);
    const table = c.getByRole('table', { name: 'Cycle Burndown' });
    await expect(within(table).getAllByRole('row')).toHaveLength(10);
    await expect(within(table).getByRole('row', { name: /Fri 20 June 2025/ })).toHaveTextContent('100 pts');
  },
};

/** Hover for every series at the nearest point; the heading is the point's `title` when it has one. */
export const Tooltip: Story = {
  play: async ({ canvasElement }) => {
    const target = canvasElement.querySelector('svg rect[fill="transparent"]') as SVGRectElement;
    const r = target.getBoundingClientRect();
    /* Halfway along: the fifth of nine points. */
    await userEvent.pointer({ target, coords: { clientX: r.left + r.width / 2, clientY: r.top + 40 } });
    const c = within(canvasElement);
    await expect(await c.findByText('Fri 20 June 2025', { selector: 'p' })).toBeVisible();
    await expect(c.getAllByText('100 pts').length).toBeGreaterThan(0);
  },
};

/** One tab stop for the whole plot; the arrow keys move from point to point, the point is announced, Escape clears. */
export const KeyboardReading: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    const plot = c.getByRole('group', { name: /Cycle Burndown/ });
    await expect(plot).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(c.getByRole('status')).toHaveTextContent('June 16: Completed 175 pts, Committed 180 pts, Overdue 12 pts, Available 150 pts');
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(c.getByRole('status')).toHaveTextContent('June 18: Completed 162 pts');
    await userEvent.keyboard('{End}');
    await expect(c.getByRole('status')).toHaveTextContent('June 26');
    await userEvent.keyboard('{Home}');
    await expect(c.getByRole('status')).toHaveTextContent('June 16');
    await userEvent.keyboard('{Escape}');
    await expect(c.getByRole('status')).toHaveTextContent('');
  },
};

/** A point with no value breaks that line (a gap, not a drop to 0): Overdue starts on June 19 and Available stops on June 24. */
export const LinesThatStartLateOrEndEarly: Story = {
  args: {
    data: DAYS.map((d, i) => ({ ...d, values: { ...d.values, overdue: i < 3 ? null : d.values.overdue, available: i > 6 ? undefined : d.values.available } })),
  },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg')!;
    await expect(svg.querySelectorAll('circle')).toHaveLength(36 - 3 - 2);
    await expect(within(canvasElement).getByRole('row', { name: /June 16/ })).toHaveTextContent('no data');
  },
};

/** Two lines: just pass the series you want. */
export const TwoLines: Story = { args: { series: ['committed', 'completed'] } };

/** `yMax` pins the top, so two burndowns can be read against the same axis. */
export const PinnedAxis: Story = {
  args: { yMax: 250 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg')!.textContent).toContain('250');
  },
};

/** It draws to the width it is given. At 320 the axis labels thin out so none collide, and nothing overflows. */
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
    await expect(svg.getBoundingClientRect().width).toBeLessThanOrEqual((svg.parentElement as HTMLElement).getBoundingClientRect().width);
    const labels = [...svg.querySelectorAll('text')].filter((t) => /^June/.test(t.textContent ?? ''));
    await expect(labels.length).toBeLessThan(9);
    await expect(labels.length).toBeGreaterThan(0);
  },
};

/** One point: it sits in the middle. */
export const OnePoint: Story = { args: { data: DAYS.slice(0, 1) } };

export const Empty: Story = { args: { data: [] }, play: async ({ canvasElement }) => expect(within(canvasElement).getByText('Nothing to show for this period.')).toBeVisible() };

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Loading Cycle Burndown');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

/* WCAG 1.4.11: a line that carries meaning needs 3:1 against what it sits on, and the axis text 4.5:1. axe cannot see into the `aria-hidden` SVG, so this measures it. */
const channels = (css: string) => css.match(/[\d.]+/g)!.slice(0, 3).map(Number);
const luminance = ([r, g, b]: number[]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** In both themes: every line holds 3:1 against the card, and the axis text 4.5:1. */
export const ContrastHolds: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true }, chromatic: { disableSnapshot: true } },
  render: () => (
    <div>
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined} data-theme-case={isDark ? 'dark' : 'light'}>
          <div className="w-160 bg-surface-elevated p-6" data-card>
            <LineChart data={DAYS} series={['completed', 'committed', 'overdue', 'available', 'leave']} caption="Contrast" yLabel="Points" legend="none" />
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const theme of ['light', 'dark']) {
      await new Promise((r) => setTimeout(r, 300));
      const scope = canvasElement.querySelector(`[data-theme-case="${theme}"]`) as HTMLElement;
      const card = channels(getComputedStyle(scope.querySelector('[data-card]') as HTMLElement).backgroundColor);
      const lines = [...scope.querySelectorAll('svg path[stroke-width="2"]')];
      await expect(lines).toHaveLength(5);
      for (const line of lines) {
        const ratio = contrast(channels(getComputedStyle(line).stroke), card);
        await expect({ theme, line: line.getAttribute('class'), ok: ratio >= 3 }).toEqual({ theme, line: line.getAttribute('class'), ok: true });
      }
      for (const text of scope.querySelectorAll('svg text')) {
        const ratio = contrast(channels(getComputedStyle(text).fill), card);
        await expect({ theme, text: text.textContent, ok: ratio >= 4.5 }).toEqual({ theme, text: text.textContent, ok: true });
      }
    }
  },
};
