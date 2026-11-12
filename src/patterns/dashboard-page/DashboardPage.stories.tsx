import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DashboardPage, type DashboardCycleSections, type DashboardPageProps, type DashboardQuarterSections, type DashboardView } from './DashboardPage';

const CYCLES = [
  { value: 'C36', label: 'C36 (Jul 06, 2026 - Jul 20, 2026)' },
  { value: 'C37', label: 'C37 (Jul 20, 2026 - Aug 03, 2026)' },
  { value: 'C38', label: 'C38 (Aug 03, 2026 - Aug 17, 2026)' },
];

const globalFilters = (withTeamAndExport: boolean): NonNullable<DashboardPageProps['filters']> => ({
  filters: [
    { key: 'cycle', label: 'Cycle', value: 'C37', searchable: true, options: CYCLES, onChange: fn() },
    { key: 'year', label: 'Year', value: '2026', options: ['2026', '2025'], onChange: fn() },
    ...(withTeamAndExport ? [{ key: 'team', label: 'Team', value: 'All Teams', options: ['All Teams', 'Platform', 'Growth'], onChange: fn() }] : []),
  ],
  onReset: fn(),
  ...(withTeamAndExport ? { exportLabel: 'Export Cycle Report', exportOptions: [{ key: 'pdf', label: 'PDF (.pdf)' }, { key: 'csv', label: 'CSV (.csv)' }], onExport: fn() } : {}),
});

const VALUE_CARDS = {
  items: [
    { key: 'overdue', label: 'Overdue', value: 3, accent: 'critical' as const },
    { key: 'in-progress', label: 'In Progress', value: 8, accent: 'brand' as const },
    { key: 'pending', label: 'Pending', value: 4, accent: 'yellow' as const },
    { key: 'draft', label: 'Draft', value: 5, accent: 'neutral' as const },
  ],
  filter: { label: 'Show', value: 'Assigned', options: ['All', 'Initiated', 'Assigned', 'Team'], onChange: fn() },
};

const person = (name: string) => ({ id: name, name, segments: [{ series: 'completed', value: 15 }, { series: 'committed', value: 15 }] as const });

const days = ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24'];
const BURNDOWN_DATA = days.map((d, i) => ({
  key: d,
  label: new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }),
  title: `${d.slice(5, 7)}.${d.slice(8)}.${d.slice(0, 4)}`,
  values: { completed: 175 - i * 30, committed: 180 - i * 35, overdue: 12 + i * 3, available: 150 - i * 25 },
}));

const CYCLE: DashboardCycleSections = {
  summary: { committed: 180, completed: 142, carriedOver: 38, completion: 79 },
  valueCards: VALUE_CARDS,
  missed: {
    hint: 'Added Values that have been waiting for you.',
    onOpen: fn(),
    onDismiss: fn(),
    items: [
      { id: 'av-1', type: 'overdue', title: 'Revamp customer onboarding documentation', user: { name: 'John Smith' }, created: '6 months ago', days: 12 },
      { id: 'av-2', type: 'due-soon', title: 'Revamp customer onboarding documentation', user: { name: 'John Smith' }, created: '6 months ago', days: 2 },
    ],
  },
  teamCapacity: { hint: 'How the team’s capacity for this cycle is spent.', remaining: 40, segments: [{ series: 'completed', value: 60 }, { series: 'committed', value: 30 }, { series: 'overdue', value: 30 }, { series: 'available', value: 60 }] },
  userCapacity: { hint: 'How each person’s capacity for this cycle is spent.', members: [person('John'), person('Jiriko Jan Lapa'), person('Francis Magallen')] },
  sprintMetrics: {
    description: 'Current: Mar 1 - Mar 15',
    data: [
      { key: 1, label: 'Jan 18 - Feb 1', values: { available: 120, committed: 96, completed: 88, overdue: 8 } },
      { key: 2, label: 'Feb 1 - Feb 15', values: { available: 120, committed: 110, completed: 104, overdue: 6 } },
      { key: 3, label: 'Feb 15 - Mar 1', values: { available: 120, committed: 92, completed: 60, overdue: 32 } },
    ],
  },
  burndown: {
    hint: 'How the cycle’s points burned down, day by day.',
    pointLabel: 'Date',
    data: BURNDOWN_DATA,
    stats: [
      { key: 'completed', label: 'Completed', value: 168, tone: 'success' },
      { key: 'remaining', label: 'Remaining', value: 0, tone: 'brand' },
      { key: 'off-track', label: 'Off-track', value: 0, tone: 'critical' },
    ],
  },
};

const QUARTER: DashboardQuarterSections = {
  budget: {
    allocated: 120,
    consumed: 70,
    quarter: 1,
    year: 2026,
    years: [2026, 2025, 2024],
    period: { kind: 'current', endsOn: 'Mar 31', daysLeft: 48, daysTotal: 90 },
    onQuarterChange: fn(),
    onYearChange: fn(),
    onGoToCurrent: fn(),
  },
  valueCards: VALUE_CARDS,
  performance: {
    filters: [
      { key: 'whose', label: 'Whose cycles', value: 'All', options: ['All', 'Mine'], onChange: fn() },
      { key: 'quarter', label: 'Quarter', value: 'Q1', options: ['Q1', 'Q2', 'Q3', 'Q4'], onChange: fn() },
      { key: 'year', label: 'Year', value: '2026', options: ['2026', '2025'], onChange: fn() },
    ],
    data: [
      { key: 1, label: 'Jan C23', values: { available: 130, completed: 140, overdue: 30 } },
      { key: 2, label: 'Jan C24', values: { available: 115, completed: 125, overdue: 20 } },
      { key: 3, label: 'Feb C25', values: { available: 157, completed: 120, overdue: 46 } },
    ],
  },
};

const meta = {
  title: 'Patterns/DashboardPage',
  component: DashboardPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main content of a dashboard: the title band with the Cycle / Quarter switch and the filters, then the chosen view’s cards in Figma’s order. ' +
          'The page passes each card’s own props; a card shows only when it is passed, so a role is what the page passes. It goes inside `AppShell`.',
      },
    },
  },
  args: { cycle: CYCLE, quarter: QUARTER, filters: globalFilters(true), onViewChange: fn() },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Headings in the page, in the order they appear. */
const headings = (c: ReturnType<typeof within>) => c.getAllByRole('heading').map((h: HTMLElement) => h.textContent);

/** The Development admin's dashboard, as Figma draws it: the switch, the filters, and the Cycle view's seven cards. */
export const DevelopmentAdmin: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
    await expect(c.getByRole('radiogroup', { name: 'Dashboard view' })).toBeVisible();
    await expect(c.getByRole('radio', { name: 'Cycle' })).toBeChecked();
    /* The global filters and Export are on the Cycle view. */
    await expect(c.getByRole('button', { name: /Export Cycle Report/ })).toBeVisible();
    /* The cards, in Figma's order. */
    const order = ['Cycle Summary', 'Value Cards', 'In Case You Missed it', 'Team Capacity', 'User Capacity', 'Sprint Metrics', 'Cycle Burndown'];
    const positions = order.map((name) => headings(c).findIndex((h: string | null) => h?.includes(name)));
    await expect(positions.every((p) => p >= 0)).toBe(true);
    await expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    /* The Quarter view has the budget, the value cards and the cycle chart, and no global filters. */
    await userEvent.click(c.getByRole('radio', { name: 'Quarter' }));
    await expect(args.onViewChange).toHaveBeenCalledWith('quarter');
    await expect(c.getByRole('heading', { name: 'Domain Budget' })).toBeVisible();
    await expect(c.getByRole('heading', { name: 'Cycle Performance' })).toBeVisible();
    await expect(c.queryByRole('heading', { name: 'Cycle Summary' })).toBeNull();
    await expect(c.queryByRole('button', { name: /Export Cycle Report/ })).toBeNull();
    /* Back to Cycle: the filters come back. */
    await userEvent.click(c.getByRole('radio', { name: 'Cycle' }));
    await expect(c.getByRole('button', { name: /Export Cycle Report/ })).toBeVisible();
  },
};

/** Opened on the Quarter view. */
export const StartsOnQuarter: Story = {
  args: { defaultView: 'quarter' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('radio', { name: 'Quarter' })).toBeChecked();
    await expect(c.getByRole('heading', { name: 'Domain Budget' })).toBeVisible();
  },
};

/** The page owns the view when it passes `view`: the switch asks, and the page answers. */
export const ControlledView: Story = {
  render: function Render(args: DashboardPageProps) {
    const [view, setView] = React.useState<DashboardView>('cycle');
    return <DashboardPage {...args} view={view} onViewChange={setView} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('radio', { name: 'Quarter' }));
    await expect(c.getByRole('heading', { name: 'Domain Budget' })).toBeVisible();
  },
};

/** A Development user: the same Cycle view without the team's capacity, and filters without a team or Export (from the product's description, not a Figma frame). */
export const DevelopmentUser: Story = {
  args: { cycle: { ...CYCLE, teamCapacity: undefined }, filters: globalFilters(false) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('heading', { name: 'Team Capacity' })).toBeNull();
    await expect(c.queryByRole('button', { name: /Export/ })).toBeNull();
    await expect(c.getByRole('heading', { name: 'Cycle Summary' })).toBeVisible();
  },
};

/** One view only, so no switch: there is nothing to switch to. */
export const CycleOnly: Story = {
  args: { quarter: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('radiogroup')).toBeNull();
    await expect(c.getByRole('heading', { name: 'Cycle Summary' })).toBeVisible();
  },
};

export const QuarterOnly: Story = {
  args: { cycle: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('radiogroup')).toBeNull();
    await expect(c.getByRole('heading', { name: 'Domain Budget' })).toBeVisible();
  },
};

/** Asked for the Quarter view on a dashboard that has none: the first view it does have shows. */
export const AViewItDoesNotHave: Story = {
  args: { quarter: undefined, view: 'quarter' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { name: 'Cycle Summary' })).toBeVisible();
  },
};

/** Each card keeps its own loading state while the numbers arrive. */
export const Loading: Story = {
  args: {
    cycle: {
      ...CYCLE,
      valueCards: { ...VALUE_CARDS, loading: true },
      teamCapacity: { ...CYCLE.teamCapacity!, loading: true },
      userCapacity: { ...CYCLE.userCapacity!, loading: true },
      sprintMetrics: { ...CYCLE.sprintMetrics!, loading: true },
      burndown: { ...CYCLE.burndown!, loading: true },
    },
  },
};

export const DarkTheme: Story = { globals: { theme: 'dark' } };
