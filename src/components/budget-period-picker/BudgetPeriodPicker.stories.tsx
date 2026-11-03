import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { BudgetPeriodPicker } from './BudgetPeriodPicker';
import type { Quarter } from '../domain-budget-summary';

const meta = {
  title: 'Components/Forms/BudgetPeriodPicker',
  component: BudgetPeriodPicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Which quarter’s budget is being edited: Q1–Q4 as a segmented control and the year as a dropdown, both 40 high so they sit as one row.',
      },
    },
  },
  args: { quarter: 1, year: 2026, years: [2026, 2025, 2024, 2023], onQuarterChange: fn(), onYearChange: fn() },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BudgetPeriodPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Both controls are 40 high — the segmented control at `lg`, the dropdown at `md`. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole('radiogroup', { name: 'Quarter' });
    const year = c.getByRole('combobox', { name: 'Year' });
    await expect(Math.round(group.getBoundingClientRect().height)).toBe(40);
    await expect(Math.round(year.parentElement!.getBoundingClientRect().height)).toBe(40);
  },
};

/** Controlled: a pick is reported, and the caller decides what the page then shows. */
export const Interactive: Story = {
  render: (args) => {
    const [quarter, setQuarter] = React.useState<Quarter>(args.quarter);
    const [year, setYear] = React.useState(args.year);
    return <BudgetPeriodPicker {...args} quarter={quarter} year={year} onQuarterChange={setQuarter} onYearChange={setYear} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('radio', { name: 'Q3' }));
    await expect(c.getByRole('radio', { name: 'Q3' })).toBeChecked();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Year' }), '2025');
    await expect(c.getByRole('combobox', { name: 'Year' })).toHaveValue('2025');
  },
};

/** While a save is in flight, both are locked. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('combobox', { name: 'Year' })).toBeDisabled();
    for (const name of ['Q1', 'Q2', 'Q3', 'Q4']) await expect(c.getByRole('radio', { name })).toBeDisabled();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
