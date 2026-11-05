import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PlanningFilters, type PlanningFiltersValue } from './PlanningFilters';

const STATUSES = ['Backlog', 'Accepted', 'In Progress', 'For QA', 'Completed'];
const EMPTY: PlanningFiltersValue = { search: '', status: '', priority: '' };

const meta = {
  title: 'Patterns/PlanningFilters',
  component: PlanningFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The row above the Planning list: search, status, priority, Reset and View Cycle. Only what that page needs — ' +
          'the library’s larger filter bar (tags, period, users, a Filters toggle) is a separate piece. The bar holds no ' +
          'state: `value` in, `onChange` out.',
      },
    },
  },
  args: {
    value: EMPTY,
    onChange: fn(),
    onReset: fn(),
    onViewCycle: fn(),
    statusOptions: STATUSES,
  },
  decorators: [
    (Story) => (
      <div className="min-h-56 bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlanningFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(args: React.ComponentProps<typeof PlanningFilters>) {
  const [value, setValue] = React.useState(args.value);
  return (
    <PlanningFilters
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange(next);
      }}
      onReset={() => {
        setValue(EMPTY);
        args.onReset();
      }}
    />
  );
}

export const Default: Story = { render: (args) => <Controlled {...args} /> };

/** Everything picked: the selects show their values and the search its text. */
export const Filled: Story = {
  args: { value: { search: 'planning', status: 'In Progress', priority: 'Normal' } },
  render: (args) => <Controlled {...args} />,
  /* Filters read regular weight, so a row of them sits quietly. */
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const weight = (name: RegExp) => Number(getComputedStyle(c.getByRole('combobox', { name })).fontWeight);
    await expect(weight(/^Status/)).toBe(400);
    await expect(weight(/^Priority/)).toBe(400);
  },
};

/** No `onViewCycle`, no button. */
export const WithoutViewCycle: Story = { args: { onViewCycle: undefined }, render: (args) => <Controlled {...args} /> };

/** A different domain's steps — the status options are the page's. */
export const DesignDomainStatuses: Story = {
  args: { statusOptions: ['Pending', 'Accepted', 'In Progress', 'Design Review', 'Completed'] },
  render: (args) => <Controlled {...args} />,
};

export const DarkTheme: Story = { ...Filled, globals: { theme: 'dark' } };

/** Type, pick, reset, open the cycle view — each reported once and the bar holds nothing itself. */
export const UsingIt: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search by title or ID' }), 'a');
    await expect(args.onChange).toHaveBeenLastCalledWith({ search: 'a', status: '', priority: '' });

    await userEvent.click(canvas.getByRole('combobox', { name: /Status/ }));
    await userEvent.click(await canvas.findByRole('option', { name: 'In Progress' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ search: 'a', status: 'In Progress', priority: '' });

    await userEvent.click(canvas.getByRole('combobox', { name: /Priority/ }));
    await userEvent.click(await canvas.findByRole('option', { name: 'Urgent' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ search: 'a', status: 'In Progress', priority: 'Urgent' });

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(args.onReset).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('searchbox')).toHaveValue('');

    await userEvent.click(canvas.getByRole('button', { name: 'View Cycle' }));
    await expect(args.onViewCycle).toHaveBeenCalledTimes(1);
  },
};
