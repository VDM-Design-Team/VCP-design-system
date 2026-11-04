import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DateField, formatMonth } from './DateField';

const meta = {
  title: 'Components/Forms/DateField',
  component: DateField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A date in a form: a read-only field with a calendar glyph, and a calendar that picks it. Estimated dates ' +
          'read “(est.)”. The calendar floats over a scrolling dialog or table instead of being clipped by it.',
      },
    },
  },
  args: { 'aria-label': 'Due date' },
  decorators: [
    (Story) => (
      <div className="h-96 w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(args: React.ComponentProps<typeof DateField>) {
  const [value, setValue] = React.useState(args.value);
  const [estimated, setEstimated] = React.useState(args.estimated);
  return (
    <DateField
      {...args}
      value={value}
      estimated={estimated}
      onChange={(iso) => {
        setValue(iso);
        setEstimated(false);
      }}
    />
  );
}

export const Empty: Story = { render: (args) => <Controlled {...args} /> };

export const WithADate: Story = { args: { value: '2026-03-02' }, render: (args) => <Controlled {...args} /> };

/** A calculated date: “(est.)”. Picking a day yourself makes it yours. */
export const Estimated: Story = {
  args: { value: '2026-03-12', estimated: true },
  render: (args) => <Controlled {...args} />,
};

export const Invalid: Story = { args: { value: '2026-03-02', invalid: true } };

export const Disabled: Story = { args: { value: '2026-03-02', disabled: true } };

export const DarkTheme: Story = { globals: { theme: 'dark' }, args: { value: '2026-03-02' } };

/** Open the calendar, pick a day: the field shows it and the estimate is gone. */
export const PickingADay: Story = {
  args: { value: '2026-03-12', estimated: true },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Due date' });
    await expect(field).toHaveValue('2026-03-12 (est.)');
    await userEvent.click(field);
    await userEvent.click(await canvas.findByRole('button', { name: /^15\b/ }));
    await expect(field).toHaveValue('2026-03-15');
  },
};

/**
 * `mode="month"`: the same field for a month with no day. It reads "September 2026", the calendar opens on the month
 * grid, and what comes back is the first of the month.
 */
export const MonthMode: Story = {
  args: { mode: 'month', 'aria-label': 'Month', value: '2026-09-14' },
  render: (args) => <Controlled {...args} />,
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

/** The first of the month goes out, whatever day came in. */
export const MonthModeReportsTheFirst: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { mode: 'month', 'aria-label': 'Month', value: '2026-09-14', onChange: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Month' }));
    await userEvent.click(await within(document.body).findByRole('button', { name: 'November 2026' }));
    await expect(args.onChange).toHaveBeenCalledWith('2026-11-01');
  },
};

/** The calendar has no Clear button, in either mode: there is nothing for it to do in a field. */
export const NoClearButton: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <DateField aria-label="Day" value="2026-03-12" />
      <DateField aria-label="Month" mode="month" value="2026-09-01" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(c.getByRole('combobox', { name: 'Day' }));
    await body.findByRole('button', { name: /^15\b/ });
    await expect(body.queryByRole('button', { name: 'Clear' })).toBeNull();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(c.getByRole('combobox', { name: 'Month' }));
    await body.findByRole('button', { name: 'March 2026' });
    await expect(body.queryByRole('button', { name: 'Clear' })).toBeNull();
  },
};

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

/** The chosen date is medium weight and the placeholder regular — as `Select` — in both modes; a filter says `regular`. */
export const ValueWeight: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <DateField aria-label="Day" value="2026-03-02" />
      <DateField aria-label="Month" mode="month" value="2026-09-01" />
      <DateField aria-label="Empty" />
      <DateField aria-label="Filter" mode="month" emphasis="regular" value="2026-09-01" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const weight = (name: string) => Number(getComputedStyle(c.getByRole('combobox', { name })).fontWeight);
    await expect(weight('Day')).toBe(500);
    await expect(weight('Month')).toBe(500);
    await expect(weight('Empty')).toBe(400);
    /* A filter passes `emphasis="regular"`. */
    await expect(weight('Filter')).toBe(400);
  },
};

/**
 * Range mode: two clicks on a two-month calendar, then **Apply**. Nothing reaches the page until then; **Clear** empties it. The field reads the range in the day format it is given.
 */
export const RangeMode: Story = {
  render: () => {
    const [range, setRange] = React.useState<{ start?: string; end?: string }>({});
    return (
      <DateField
        mode="range"
        placeholder="Select period"
        value={range.start}
        rangeEnd={range.end}
        formatDate={(iso) => iso.split('-').reverse().join('/')}
        onRangeChange={(start, end) => setRange({ start: start || undefined, end })}
        picker={{ today: '2026-05-01' }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('combobox');
    await userEvent.click(field);
    const body = within(document.body);
    const first = within(await body.findByRole('group', { name: 'First calendar' }));
    await userEvent.click(first.getByRole('button', { name: /^4 / }));
    await expect(field).toHaveValue('');
    await userEvent.click(first.getByRole('button', { name: /^6 / }));
    await userEvent.click(body.getByRole('button', { name: 'Apply' }));
    await expect(field).toHaveValue('04/05/2026 - 06/05/2026');
  },
};
