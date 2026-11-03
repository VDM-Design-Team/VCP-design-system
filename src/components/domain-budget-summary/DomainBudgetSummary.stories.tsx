import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  DomainBudgetSummary,
  budgetStatus,
  budgetUsage,
  type DomainBudgetSummaryProps,
  type Quarter,
} from './DomainBudgetSummary';

const YEARS = [2026, 2025, 2024, 2023];

const LEVELS: ReadonlyArray<{ label: string; consumed: number }> = [
  { label: 'Fine', consumed: 70 },
  { label: 'Warning', consumed: 90 },
  { label: 'Over budget', consumed: 170 },
];

const meta = {
  title: 'Components/Display/DomainBudgetSummary',
  component: DomainBudgetSummary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A domain’s development-point budget for one quarter: allocated, consumed, remaining, the quarter’s dates, and a ' +
          'usage bar whose status (fine, warning, over budget) the card owns. It reflows with the card’s own width.',
      },
    },
  },
  args: {
    allocated: 120,
    consumed: 70,
    quarter: 1,
    year: 2026,
    years: YEARS,
    period: { kind: 'current', endsOn: 'Mar 31', daysLeft: 48, daysTotal: 90 },
    onQuarterChange: fn(),
    onYearChange: fn(),
    onGoToCurrent: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DomainBudgetSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Under 75% used: the brand-blue bar, and Remaining in green. */
export const Fine: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Domain Budget' })).toBeVisible();
    const bar = canvas.getByRole('progressbar', { name: 'Budget Usage' });
    await expect(Math.round(Number(bar.getAttribute('aria-valuenow')))).toBe(58);
    await expect(canvas.getByText('Current Quarter')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Go to Current Quarter' })).toBeNull();
  },
};

/** 75–99% used: the bar turns to the warning tone. */
export const Warning: Story = { args: { consumed: 90 } };

/** 100% and over: a critical bar capped at 100%, and a negative Remaining in red. */
export const OverBudget: Story = {
  args: { consumed: 170 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('-50')).toBeVisible();
    await expect(canvas.getByText('100%')).toBeVisible();
  },
};

/** Nothing consumed yet — an empty bar and the full allocation remaining. */
export const Untouched: Story = { args: { consumed: 0 } };

/** A past quarter shows when it started and ended, and offers the way back to now. */
export const PastQuarter: Story = {
  args: {
    quarter: 4,
    year: 2025,
    consumed: 90,
    period: { kind: 'past', startedOn: 'Oct 1', endedOn: 'Dec 31' },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Past Quarter')).toBeVisible();
    await expect(canvas.getByText('Started On')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Go to Current Quarter' }));
    await expect(args.onGoToCurrent).toHaveBeenCalledTimes(1);
  },
};

/** An upcoming quarter shows when it starts and ends. */
export const UpcomingQuarter: Story = {
  args: {
    quarter: 2,
    year: 2026,
    consumed: 0,
    period: { kind: 'upcoming', startsOn: 'Apr 1', endsOn: 'Jun 30' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Upcoming Quarter')).toBeVisible();
    await expect(canvas.getByText('Starts On')).toBeVisible();
  },
};

/** The info glyphs are real buttons named for what they explain, so the definitions are reachable by keyboard. */
export const Hints: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Allocated', 'Consumed', 'Remaining']) {
      await expect(canvas.getByRole('button', { name: `About ${name}` })).toBeVisible();
    }
  },
};

/** Controlled: the pickers report a choice and the caller decides what the card then shows. */
export const Pickers: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Quarter' }), 'Q3');
    await expect(args.onQuarterChange).toHaveBeenCalledWith(3);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Year' }), '2025');
    await expect(args.onYearChange).toHaveBeenCalledWith(2025);
  },
};

/** A working example: pick a quarter and the card follows, as the dashboard will wire it. */
export const Interactive: Story = {
  render: (args) => {
    const current: { quarter: Quarter; year: number } = { quarter: 1, year: 2026 };
    const [view, setView] = React.useState(current);
    const isCurrent = view.quarter === current.quarter && view.year === current.year;
    const before = view.year < current.year || (view.year === current.year && view.quarter < current.quarter);
    const period: DomainBudgetSummaryProps['period'] = isCurrent
      ? { kind: 'current', endsOn: 'Mar 31', daysLeft: 48, daysTotal: 90 }
      : before
        ? { kind: 'past', startedOn: 'Oct 1', endedOn: 'Dec 31' }
        : { kind: 'upcoming', startsOn: 'Apr 1', endsOn: 'Jun 30' };
    return (
      <DomainBudgetSummary
        {...args}
        {...view}
        consumed={isCurrent ? 70 : before ? 100 : 0}
        period={period}
        onQuarterChange={(quarter) => setView((v) => ({ ...v, quarter }))}
        onYearChange={(year) => setView((v) => ({ ...v, year }))}
        onGoToCurrent={() => setView(current)}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Year' }), '2025');
    await expect(canvas.getByText('Past Quarter')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Go to Current Quarter' }));
    await expect(canvas.getByText('Current Quarter')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Go to Current Quarter' })).toBeNull();
  },
};

/** The three consumption levels together, as Figma’s `Levels of Consumption` frame draws them. */
export const AllLevels: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {LEVELS.map(({ label, consumed }) => (
        <DomainBudgetSummary key={label} {...args} title={`Domain Budget — ${label}`} consumed={consumed} />
      ))}
    </div>
  ),
};

/** Narrower than the side-by-side layout needs (560, the narrowest it stays whole at): points on top, the quarter's details beneath. */
export const Narrow: Story = {
  render: (args) => (
    <div className="w-140">
      <DomainBudgetSummary {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole('region', { name: 'Domain Budget' });
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};

/** Narrower than that, nothing is squeezed further: the whole card scrolls sideways. */
export const ScrollsWhenTooNarrow: Story = {
  render: (args) => (
    <div className="w-96">
      <DomainBudgetSummary {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole('region', { name: 'Domain Budget' });
    await expect(card.scrollWidth).toBeGreaterThan(card.clientWidth);
    await expect(getComputedStyle(card).overflowX).toBe('auto');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

/**
 * The status helper (hidden, tested): the boundaries are 75 and 100 percent, and a budget with no allocation is over as
 * soon as anything is consumed.
 */
export const StatusBoundaries: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <div />,
  play: async () => {
    await expect(budgetStatus(74, 100)).toBe('fine');
    await expect(budgetStatus(75, 100)).toBe('warning');
    await expect(budgetStatus(99, 100)).toBe('warning');
    await expect(budgetStatus(100, 100)).toBe('over');
    await expect(budgetStatus(170, 120)).toBe('over');
    await expect(budgetStatus(0, 0)).toBe('fine');
    await expect(budgetStatus(5, 0)).toBe('over');
    await expect(budgetUsage(170, 120)).toBe(100);
    await expect(budgetUsage(0, 120)).toBe(0);
  },
};
