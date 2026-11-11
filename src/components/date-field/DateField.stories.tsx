import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DateFormatProvider, formatDate, formatDateTime, formatTime, useDateFormat } from '../../lib/format-date';
import { DateField, formatMonth } from './DateField';
import { Button } from '../../atoms/button';
import { Field } from '../field';

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
    await expect(field).toHaveValue('12/03/2026 (est.)');
    await userEvent.click(field);
    await userEvent.click(await canvas.findByRole('button', { name: /^15\b/ }));
    await expect(field).toHaveValue('15/03/2026');
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
 * Range mode: two clicks on a two-month calendar, then **Apply**. Nothing reaches the page until then; **Clear** empties it. The field reads the range as every date reads, dd/mm/yyyy.
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

/**
 * In a form, under a `Field`'s label. The label names it (by reference, as it names every control in a `Field`), never the placeholder. And **Apply and Clear only apply and clear**: they are
 * `type="button"`, so the form around the calendar is not submitted. (They used to submit it: in the Holiday dialog that checked the form again before the date had landed, and the error stayed.)
 */
export const RangeInAForm: Story = {
  render: () => {
    const [range, setRange] = React.useState<{ start?: string; end?: string }>({});
    const [saves, setSaves] = React.useState(0);
    return (
      <form
        className="flex w-80 flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSaves((n) => n + 1);
        }}
      >
        <Field label="Date">
          {(c) => (
            <DateField
              {...c}
              mode="range"
              placeholder="Select period"
              value={range.start}
              rangeEnd={range.end}
              onRangeChange={(start, end) => setRange({ start: start || undefined, end })}
              picker={{ today: '2026-05-01' }}
            />
          )}
        </Field>
        <p className="text-body-sm-regular text-text-secondary">Times submitted: {saves}</p>
        <div>
          <Button type="submit" size="sm">
            Save
          </Button>
        </div>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('combobox', { name: 'Date' });
    await expect(field).toHaveAccessibleName('Date');
    await expect(document.getElementById(field.getAttribute('aria-labelledby') ?? '')).toHaveTextContent('Date');
    const body = within(document.body);

    await userEvent.click(field);
    const first = within(await body.findByRole('group', { name: 'First calendar' }));
    await userEvent.click(first.getByRole('button', { name: /^4 / }));
    await userEvent.click(body.getByRole('button', { name: 'Apply' }));
    await expect(field).toHaveValue('04/05/2026');
    await expect(c.getByText('Times submitted: 0')).toBeVisible();

    await userEvent.click(field);
    await userEvent.click(await body.findByRole('button', { name: 'Clear' }));
    await expect(field).toHaveValue('');
    await expect(c.getByText('Times submitted: 0')).toBeVisible();

    /* The form's own button still submits it. */
    await userEvent.click(c.getByRole('button', { name: 'Save' }));
    await expect(c.getByText('Times submitted: 1')).toBeVisible();
  },
};

/** A filter's Period: month mode with named periods (sprints) passed in as presets, and Clear. A sprint reads after its month. */
export const MonthWithSprints: Story = {
  render: () => {
    const [period, setPeriod] = React.useState<{ start: string; end: string } | null>(null);
    return (
      <DateField
        mode="month"
        emphasis="regular"
        placeholder="Select Period"
        value={period?.start}
        rangeEnd={period?.end}
        picker={{
          presets: [
            { label: 'Sprint 34 (19-22 May)', value: '2026-05-19', rangeEnd: '2026-05-22' },
            { label: 'Sprint 33 (1-15 May)', value: '2026-05-01', rangeEnd: '2026-05-15' },
          ],
        }}
        onChange={(first) => setPeriod({ start: first, end: first })}
        onRangeChange={(start, end) => setPeriod(end ? { start, end } : null)}
        onClear={() => setPeriod(null)}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('combobox');
    await userEvent.click(field);
    await userEvent.click(await within(document.body).findByRole('button', { name: 'Sprint 33 (1-15 May)' }));
    await expect(field).toHaveValue('May 2026, Sprint 33 (1-15 May)');
    await userEvent.click(field);
    await userEvent.click(await within(document.body).findByRole('button', { name: 'Clear' }));
    await expect(field).toHaveValue('');
  },
};

/** Every date reads dd/mm/yyyy; give the app the person's locale (`DateFormatProvider`) and the field follows it. */
export const InThePersonsLocale: Story = {
  render: () => (
    <DateFormatProvider locale="en-US">
      <Controlled value="2026-03-12" aria-label="Due date" />
    </DateFormatProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox', { name: 'Due date' })).toHaveValue('03/12/2026');
  },
};

/** A component that shows a time asks the hook; the provider's locale orders the date and its time zone places an instant. The clock is 24-hour whatever the locale. */
function WhenShown({ iso }: { iso: string }) {
  const dates = useDateFormat();
  return <time dateTime={iso}>{dates.dateTime(iso)}</time>;
}

export const DateAndTime: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <WhenShown iso="2026-06-10T14:37:00" />
      <DateFormatProvider locale="en-US">
        <WhenShown iso="2026-06-10T14:37:00" />
      </DateFormatProvider>
      <DateFormatProvider timeZone="Europe/Athens">
        <WhenShown iso="2026-06-10T11:37:00Z" />
      </DateFormatProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* No provider: dd/mm/yyyy and 24-hour. */
    await expect(c.getAllByText('10/06/2026 14:37')).toHaveLength(2);
    /* A US locale reorders the date ("06/10/2026") and keeps the 24-hour clock. */
    await expect(c.getByText('06/10/2026 14:37')).toBeVisible();
  },
};

/** The formatter's rules (hidden, tested): zone-less clocks read as written, instants are placed in the zone given, date-only is a date, junk comes back. */
export const DateAndTimeRules: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <div />,
  play: async () => {
    /* No zone: as written, never converted. */
    await expect(formatDateTime('2026-06-10T14:37')).toBe('10/06/2026 14:37');
    await expect(formatDateTime('2026-06-10 14:37:59')).toBe('10/06/2026 14:37');
    await expect(formatDateTime('2026-06-10T14:37:00.123')).toBe('10/06/2026 14:37');
    await expect(formatDateTime('2026-06-10T00:05')).toBe('10/06/2026 00:05');
    await expect(formatDateTime('2026-06-10T23:59')).toBe('10/06/2026 23:59');
    /* The locale orders the date, the clock stays 24-hour. */
    await expect(formatDateTime('2026-06-10T14:37', 'en-US')).toBe('06/10/2026 14:37');
    await expect(formatDateTime('2026-06-10T14:37', 'de-DE')).toBe('10.06.2026 14:37');
    /* An instant is placed in the zone given: Athens is UTC+3 in June, and a date can cross midnight. */
    await expect(formatDateTime('2026-06-10T11:37:00Z', undefined, 'Europe/Athens')).toBe('10/06/2026 14:37');
    await expect(formatDateTime('2026-06-10T22:30:00Z', undefined, 'Europe/Athens')).toBe('11/06/2026 01:30');
    await expect(formatDateTime('2026-06-10T14:37:00+02:00', undefined, 'UTC')).toBe('10/06/2026 12:37');
    await expect(formatDateTime('2026-06-10T14:37:00+0200', undefined, 'UTC')).toBe('10/06/2026 12:37');
    await expect(formatDateTime('2026-06-10T14:37Z', 'en-US', 'UTC')).toBe('06/10/2026 14:37');
    /* Midnight is 00:00, not 24:00. */
    await expect(formatDateTime('2026-06-10T21:00:00Z', undefined, 'Europe/Athens')).toBe('11/06/2026 00:00');
    /* Just the time. */
    await expect(formatTime('2026-06-10T14:37')).toBe('14:37');
    await expect(formatTime('2026-06-10T11:37:00Z', 'Europe/Athens')).toBe('14:37');
    /* No time: just the date. Not a date: as given. */
    await expect(formatDateTime('2026-06-10')).toBe(formatDate('2026-06-10'));
    await expect(formatDateTime('2026-06-10', 'en-US')).toBe('06/10/2026');
    await expect(formatTime('2026-06-10')).toBe('2026-06-10');
    await expect(formatDateTime('Jun 10, 2026 2:37 PM')).toBe('Jun 10, 2026 2:37 PM');
    await expect(formatDateTime('')).toBe('');
    await expect(formatDateTime('2026-06-10Z')).toBe('2026-06-10Z');
  },
};
