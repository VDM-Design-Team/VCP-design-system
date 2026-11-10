import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CapacityBar, capacityDescription, capacityTotal } from './CapacityBar';
import { CHART_SERIES, CHART_SERIES_ORDER } from '../../lib/chart-series';

const meta = {
  title: 'Components/Display/CapacityBar',
  component: CapacityBar,
  parameters: {
    docs: {
      description: {
        component:
          'One stacked bar of how a capacity is spent (Completed, Committed, Overdue, Available, Leave), sized by value. It fills the width it is given. Each segment writes its number on itself unless it is too thin, and the whole bar is one image to assistive tech, named by its series and values.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl bg-surface-elevated p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    segments: [
      { series: 'completed', value: 60 },
      { series: 'committed', value: 30 },
      { series: 'overdue', value: 30 },
      { series: 'available', value: 60 },
    ],
    label: 'Team capacity',
  },
} satisfies Meta<typeof CapacityBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Segments are sized by value; the bar is one image, named by its series and values. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const bar = within(canvasElement).getByRole('img', { name: 'Team capacity: Completed 60, Committed 30, Overdue 30, Available 60, total 180 pts' });
    await expect(bar).toBeInTheDocument();
    const widths = [...bar.children].map((c) => (c as HTMLElement).getBoundingClientRect().width);
    /* 60 : 30 : 30 : 60, give or take the 2px gaps. */
    await expect(widths[0]! / widths[1]!).toBeGreaterThan(1.9);
    await expect(widths[0]! / widths[1]!).toBeLessThan(2.1);
    await expect(capacityTotal(args.segments)).toBe(180);
  },
};

/** A row in a list of people is `sm` (24 high). */
export const Small: Story = { args: { size: 'sm', label: 'John', segments: [{ series: 'completed', value: 15 }, { series: 'committed', value: 15 }] } };

/** All five series, in the system's order. */
export const EverySeries: Story = {
  args: { segments: CHART_SERIES_ORDER.map((series) => ({ series, value: 20 })) },
};

/** A segment under 5% of the bar is too thin to write on: its number is dropped from the picture (it stays in the text alternative). Zero, negative and not-a-number segments are not drawn at all. */
export const ThinAndEmptySegments: Story = {
  args: {
    segments: [
      { series: 'completed', value: 120 },
      { series: 'committed', value: 4 },
      { series: 'overdue', value: 0 },
      { series: 'available', value: -3 },
      { series: 'leave', value: Number.NaN },
    ],
  },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('img');
    await expect(bar.children).toHaveLength(2);
    await expect(bar.textContent).toBe('120');
    await expect(bar).toHaveAttribute('aria-label', 'Team capacity: Completed 120, Committed 4, total 124 pts');
  },
};

/** No data: just the empty track. */
export const Empty: Story = {
  args: { segments: [] },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('img');
    await expect(bar.children).toHaveLength(0);
    await expect(bar).toHaveAttribute('aria-label', 'Team capacity: none, total 0 pts');
  },
};

/** It has no width of its own: it fills what it is given. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

/* WCAG 1.4.3: the number on each series' fill is 14 semibold, so it needs 4.5:1. axe cannot see through the `aria-hidden` bars, so this measures it. */
const channels = (css: string) => css.match(/[\d.]+/g)!.slice(0, 3).map(Number);
const luminance = ([r, g, b]: number[]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The number on every series holds 4.5:1 against its own fill, in both themes. */
export const ContrastHolds: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true }, chromatic: { disableSnapshot: true } },
  render: () => (
    <div>
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined} data-theme-case={isDark ? 'dark' : 'light'}>
          <div className="bg-surface-elevated p-6">
            <CapacityBar segments={CHART_SERIES_ORDER.map((series) => ({ series, value: 20 }))} label={isDark ? 'Dark' : 'Light'} />
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const theme of ['light', 'dark']) {
      const scope = canvasElement.querySelector(`[data-theme-case="${theme}"]`) as HTMLElement;
      const segments = [...scope.querySelectorAll('[role="img"] > div')] as HTMLElement[];
      await expect(segments).toHaveLength(CHART_SERIES_ORDER.length);
      for (const [i, el] of segments.entries()) {
        const series = CHART_SERIES_ORDER[i]!;
        const number = el.querySelector('span') as HTMLElement;
        const ratio = contrast(channels(getComputedStyle(number).color), channels(getComputedStyle(el).backgroundColor));
        await expect({ theme, series, ok: ratio >= 4.5 }).toEqual({ theme, series, ok: true });
      }
    }
  },
};

/** The description is the same string the bar is named by, so a caller can reuse it. */
export const Description: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  play: async () => {
    await expect(capacityDescription([{ series: 'leave', value: 5 }], 'days', 'Earl')).toBe('Earl: Leave 5, total 5 days');
    await expect(CHART_SERIES.overdue.label).toBe('Overdue');
  },
};
