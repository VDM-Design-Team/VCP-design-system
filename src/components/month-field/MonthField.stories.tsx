import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MonthField, formatMonth } from './MonthField';

const meta = {
  title: 'Components/Forms/MonthField',
  component: MonthField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A month and year: a read-only field that reads “September 2026”, and a month picker that opens under it. ' +
          'The value is an ISO date — the first of the month on the way out.',
      },
    },
  },
  args: { 'aria-label': 'Month', value: '2026-09-01', onChange: fn() },
  decorators: [
    (Story) => (
      <div className="h-96 w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MonthField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live: open it, pick a month, and the field follows and the picker closes. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value);
    return <MonthField {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('combobox', { name: 'Month' });
    await expect(field).toHaveValue('September 2026');
    await userEvent.click(field);
    const body = within(document.body);
    await userEvent.click(await body.findByRole('button', { name: 'March 2026' }));
    await expect(field).toHaveValue('March 2026');
    /* Chosen, it closes. */
    await expect(body.queryByRole('button', { name: 'March 2026' })).toBeNull();
  },
};

/** The picker reports the first of the month, whatever day the value was. */
export const ReportsTheFirst: Story = {
  args: { value: '2026-09-14' },
  play: async ({ canvasElement, args }) => {
    const field = within(canvasElement).getByRole('combobox', { name: 'Month' });
    await expect(field).toHaveValue('September 2026');
    await userEvent.click(field);
    await userEvent.click(await within(document.body).findByRole('button', { name: 'November 2026' }));
    await expect(args.onChange).toHaveBeenCalledWith('2026-11-01');
  },
};

/** No month yet: the placeholder shows. */
export const Empty: Story = { args: { value: undefined } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox', { name: 'Month' })).toBeDisabled();
  },
};

export const Invalid: Story = { args: { invalid: true } };

/** `formatMonth` reads in UTC, so no time zone can move the month. */
export const FormatsInUTC: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <div />,
  play: async () => {
    await expect(formatMonth('2026-01-01')).toBe('January 2026');
    await expect(formatMonth('2026-12-31')).toBe('December 2026');
    await expect(formatMonth('')).toBe('');
  },
};
