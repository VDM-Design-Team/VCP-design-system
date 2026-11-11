import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CyclePerformance, type CyclePerformanceFilter } from './CyclePerformance';

const ALL = [
  { key: 1, label: 'Jan C23', values: { available: 130, completed: 140, overdue: 30 } },
  { key: 2, label: 'Jan C24', values: { available: 115, completed: 125, overdue: 20 } },
  { key: 3, label: 'Feb C25', values: { available: 157, completed: 120, overdue: 46 } },
  { key: 4, label: 'Feb C26', values: { available: 139, completed: 66 } },
  { key: 5, label: 'Mar C27', values: { available: 104, completed: 146, overdue: 15 } },
  { key: 6, label: 'Mar C28', values: { available: 125, completed: 112, overdue: 25 } },
  { key: 7, label: 'Mar C29', values: { available: 125, completed: 112, overdue: 25 } },
];

const meta = {
  title: 'Patterns/CyclePerformance',
  component: CyclePerformance,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'How each cycle went, as grouped bars (Available, Overdue, Completed), with filters over the chart. Pass the data; the axis, bars and legend follow. The filters are the page’s: it does the filtering and passes the result.',
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
  args: { data: ALL },
} satisfies Meta<typeof CyclePerformance>;

export default meta;
type Story = StoryObj<typeof meta>;

const FILTERS = (state: { scope: string; quarter: string; year: string }, set: (k: 'scope' | 'quarter' | 'year', v: string) => void): CyclePerformanceFilter[] => [
  { key: 'scope', label: 'Show', value: state.scope, onChange: (v) => set('scope', v), options: ['All', 'Mine', 'Earl', 'Francis Magallen', 'Jiriko Jan Lapa', 'John', 'Winstone Fale'], className: 'w-40' },
  { key: 'quarter', label: 'Quarter', value: state.quarter, onChange: (v) => set('quarter', v), options: ['Q1', 'Q2', 'Q3', 'Q4'], className: 'w-24' },
  { key: 'year', label: 'Year', value: state.year, onChange: (v) => set('year', v), options: ['2025', '2026'], className: 'w-28' },
];

/** Live: the page filters and passes the result; the chart redraws from whatever it is given. Here "Mine" shows three cycles. */
export const Default: Story = {
  render: (args) => {
    const [f, setF] = React.useState({ scope: 'All', quarter: 'Q1', year: '2026' });
    const data = f.scope === 'Mine' ? ALL.slice(0, 3) : ALL;
    return <CyclePerformance {...args} data={data} filters={FILTERS(f, (k, v) => setF((s) => ({ ...s, [k]: v })))} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Cycle Performance' })).toBeInTheDocument();
    await expect(c.getByRole('table', { name: 'Cycle Performance' })).toBeInTheDocument();
    await expect(within(c.getByRole('table')).getAllByRole('row')).toHaveLength(8);
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Show' }), 'Mine');
    await expect(within(c.getByRole('table')).getAllByRole('row')).toHaveLength(4);
  },
};

/** Without filters it is just the title and the chart. */
export const NoFilters: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('combobox')).toHaveLength(0);
  },
};

/** While the data loads: the filters stay, the chart is a placeholder, and one status says so. */
export const Loading: Story = {
  args: { loading: true, filters: FILTERS({ scope: 'All', quarter: 'Q1', year: '2026' }, () => {}) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading Cycle Performance');
    await expect(c.getAllByRole('combobox')).toHaveLength(3);
  },
};

/** With no cycles it says so, and the filters stay so the person can change them. */
export const Empty: Story = {
  args: { data: [], empty: 'No cycles in Q1 2026.', filters: FILTERS({ scope: 'All', quarter: 'Q1', year: '2026' }, () => {}) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No cycles in Q1 2026.')).toBeVisible();
  },
};

/** The title and the filters share a row; narrow, the filters wrap under the title and the chart narrows to the card. */
export const Narrow: Story = {
  args: { filters: FILTERS({ scope: 'All', quarter: 'Q1', year: '2026' }, () => {}) },
  decorators: [
    (Story) => (
      <div className="w-96">
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
export const DarkTheme: Story = { args: { filters: FILTERS({ scope: 'All', quarter: 'Q1', year: '2026' }, () => {}) }, globals: { theme: 'dark' } };
