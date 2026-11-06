import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DashboardFilters, type DashboardFilter } from './DashboardFilters';

const FILTERS: DashboardFilter[] = [
  { key: 'cycle', label: 'Cycle', value: 'C37', options: [{ value: 'C37', label: 'C37 (Jul 20, 2026 - Aug 03, 2026)' }, { value: 'C36', label: 'C36 (Jul 06, 2026 - Jul 20, 2026)' }], onChange: () => {} },
  { key: 'year', label: 'Year', value: '2026', options: ['2026', '2025'], onChange: () => {} },
  { key: 'team', label: 'Team', value: 'All Teams', options: ['All Teams', 'Platform', 'Growth'], onChange: () => {} },
];

const meta = {
  title: 'Patterns/DashboardFilters',
  component: DashboardFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The global filter bar at the top of a dashboard: a Reset Filters link, the filters (cycle, year, team) and an Export button. Pass the filters; the bar lays them out and wraps when the page is narrow. It does no filtering: it reports each choice.',
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
  args: { filters: FILTERS, onReset: fn(), resetLabel: 'Reset Filters', exportLabel: 'Export Cycle Report', onExport: fn() },
} satisfies Meta<typeof DashboardFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Reset, three filters and an export button, as Figma draws them. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('group', { name: 'Dashboard filters' })).toBeInTheDocument();
    await expect(c.getByRole('combobox', { name: 'Cycle' })).toHaveValue('C37');
    /* One height across the row: the selects and the buttons are all 36. */
    const heights = [
      ...c.getAllByRole('combobox').map((el) => (el.parentElement as HTMLElement).getBoundingClientRect().height),
      ...c.getAllByRole('button').map((el) => el.getBoundingClientRect().height),
    ];
    await expect(new Set(heights.map(Math.round))).toEqual(new Set([36]));
    await userEvent.click(c.getByRole('button', { name: 'Reset Filters' }));
    await expect(args.onReset).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole('button', { name: 'Export Cycle Report' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
  },
};

/** Live: each choice is reported and the page changes what it shows. */
export const Controlled: Story = {
  render: (args) => {
    const [values, setValues] = React.useState({ cycle: 'C37', year: '2026', team: 'All Teams' });
    const filters = FILTERS.map((f) => ({ ...f, value: values[f.key as keyof typeof values], onChange: (v: string) => setValues((s) => ({ ...s, [f.key]: v })) }));
    return <DashboardFilters {...args} filters={filters} onReset={() => setValues({ cycle: 'C37', year: '2026', team: 'All Teams' })} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Team' }), 'Platform');
    await expect(c.getByRole('combobox', { name: 'Team' })).toHaveValue('Platform');
    await userEvent.click(c.getByRole('button', { name: 'Reset Filters' }));
    await expect(c.getByRole('combobox', { name: 'Team' })).toHaveValue('All Teams');
  },
};

/** With `exportOptions` the export button opens a menu and reports the option's key. */
export const ExportMenu: Story = {
  args: { exportOptions: [{ key: 'pdf', label: 'PDF' }, { key: 'csv', label: 'CSV' }] },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Export Cycle Report' }));
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'CSV' }));
    await expect(args.onExport).toHaveBeenCalledWith('csv');
  },
};

/** A user's bar has fewer filters (no team), and may have no export. */
export const FewerParts: Story = {
  args: { filters: FILTERS.slice(0, 2), exportLabel: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('combobox')).toHaveLength(2);
    await expect(c.queryByRole('button', { name: /Export/ })).toBeNull();
  },
};

/** Narrow, the row wraps (right-aligned) instead of overflowing. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector('[role="group"]') as HTMLElement;
    await expect(bar.scrollWidth).toBeLessThanOrEqual(bar.clientWidth);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
