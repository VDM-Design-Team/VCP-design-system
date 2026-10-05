import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker } from './DatePicker';
import { Popover } from '../popover';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';

const meta = {
  title: 'Components/Forms/DatePicker',
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component:
          'The calendar panel: named day buttons, month navigation, range shading, marker ' +
          'dots and flagged dates. One tab stop — arrows move by day and week and drag the ' +
          'view across month boundaries. The export’s VCP `capacity`/`holidays` props became ' +
          'generic `markers`/`flagged`; the planning patterns own the mapping. ISO dates are ' +
          'handled in local time (the export shifted east-of-UTC dates).',
      },
    },
  },
  args: { value: '2026-09-14' },
  argTypes: {
    value: { control: 'text' },
    min: { control: 'text' },
    max: { control: 'text' },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live: click or arrow around; the view follows focus across months. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value);
    return <DatePicker {...args} value={value} onChange={setValue} />;
  },
};

/** `min`/`max` disable the outside; arrows refuse to leave the window. */
export const Bounded: Story = {
  args: { min: '2026-09-07', max: '2026-09-25' },
  render: (args) => {
    const [value, setValue] = React.useState(args.value);
    return <DatePicker {...args} value={value} onChange={setValue} />;
  },
};

/** `value` + `rangeEnd` shade the span — a period, not two dates. */
export const Range: Story = {
  args: { value: '2026-09-07', rangeEnd: '2026-09-18' },
};

/**
 * The generic affordances the planning patterns will map: `markers` dots
 * (pair them with a legend — the dot alone is decoration) and `flagged`
 * unavailable-but-selectable dates.
 */
export const MarkersAndFlags: Story = {
  args: {
    markers: {
      '2026-09-08': 'success',
      '2026-09-09': 'success',
      '2026-09-15': 'warning',
      '2026-09-22': 'danger',
    },
    flagged: ['2026-09-21'],
  },
  render: (args) => {
    const [value, setValue] = React.useState(args.value);
    return (
      <div className="flex flex-col gap-3">
        <DatePicker {...args} value={value} onChange={setValue} />
        <div className="flex gap-4 font-sans text-caption-md-medium text-text-tertiary">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-accent-success-filled-surface-default" /> free
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-accent-warning-filled-surface-default" /> tight
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-accent-critical-filled-surface-default" /> full
          </span>
        </div>
      </div>
    );
  },
};

/**
 * The composition: a trigger opening the panel in a Popover. The trigger is a
 * real `Button` — wrapping an `Input` in a button nests two controls, which
 * assistive tech can still reach however the inner one is hidden.
 */
export const InAPopover: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value);
    const [open, setOpen] = React.useState(false);
    return (
      <div className="h-96 w-80">
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={
            <Button
              variant="secondary"
              iconLeft={<Icon name="calendar-blank" size="sm" />}
              aria-label={value ? `Start date, ${value}` : 'Choose start date'}
            >
              {value ?? 'Pick a date'}
            </Button>
          }
          content={
            <DatePicker
              {...args}
              value={value}
              onChange={(iso) => {
                setValue(iso);
                setOpen(false);
              }}
              className="border-0 shadow-none"
            />
          }
        />
      </div>
    );
  },
};

/** Panel, days, markers and flags are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <DatePicker
              {...args}
              rangeEnd="2026-09-18"
              value="2026-09-07"
              flagged={['2026-09-21']}
              markers={{ '2026-09-22': 'danger' }}
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

const day = (canvas: ReturnType<typeof within>, name: string) => canvas.getByRole('button', { name });

/**
 * **Flow:** the day grid is one tab stop, landing on the selected date. Arrows
 * move by a day and a week; crossing into the next month moves the view with
 * the focus, and the month heading (a polite live region) says so. Enter
 * chooses the focused day.
 */
export const KeyboardGrid: Story = {
  parameters: { controls: { disable: true } },
  args: { value: '2026-09-14', onChange: fn() },
  render: function Render(args) {
    const [value, setValue] = React.useState(args.value);
    return (
      <DatePicker
        {...args}
        value={value}
        onChange={(iso) => {
          setValue(iso);
          args.onChange?.(iso);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText('September 2026');
    await expect(heading).toHaveAttribute('aria-live', 'polite');

    /* One tab stop in the grid, and it is the selected day. */
    const selected = day(canvas, '14 September 2026');
    await expect(selected).toHaveAttribute('tabindex', '0');
    await expect(selected).toHaveAttribute('aria-pressed', 'true');
    await expect(day(canvas, '15 September 2026')).toHaveAttribute('tabindex', '-1');

    selected.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(day(canvas, '15 September 2026')).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(day(canvas, '22 September 2026')).toHaveFocus());
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(day(canvas, '21 September 2026')).toHaveFocus());
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(day(canvas, '14 September 2026')).toHaveFocus());

    /* Across the month boundary: the view follows, and the heading changes. */
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(day(canvas, '5 October 2026')).toHaveFocus());
    await expect(canvas.getByText('October 2026')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(day(canvas, '28 September 2026')).toHaveFocus());
    await expect(canvas.getByText('September 2026')).toBeInTheDocument();

    /* Moving never chooses; Enter does. */
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenCalledWith('2026-09-28');
    await expect(day(canvas, '28 September 2026')).toHaveAttribute('aria-pressed', 'true');
  },
};

/**
 * **Flow:** with `min` and `max`, days outside the window are disabled and the
 * arrows refuse to leave it.
 */
export const KeyboardRespectsBounds: Story = {
  parameters: { controls: { disable: true } },
  args: { value: '2026-09-14', min: '2026-09-07', max: '2026-09-25' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(day(canvas, '6 September 2026')).toBeDisabled();
    await expect(day(canvas, '26 September 2026')).toBeDisabled();

    day(canvas, '14 September 2026').focus();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(day(canvas, '7 September 2026')).toHaveFocus());
    /* A week before the minimum: refused, focus stays. */
    await userEvent.keyboard('{ArrowUp}');
    await expect(day(canvas, '7 September 2026')).toHaveFocus();
    /* A day before it: refused too. */
    await userEvent.keyboard('{ArrowLeft}');
    await expect(day(canvas, '7 September 2026')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(day(canvas, '21 September 2026')).toHaveFocus());
    /* A week past the maximum: refused. */
    await userEvent.keyboard('{ArrowDown}');
    await expect(day(canvas, '21 September 2026')).toHaveFocus();
  },
};

/** **Flow:** the month buttons page the view and report it through `onMonthChange`. */
export const MonthButtons: Story = {
  parameters: { controls: { disable: true } },
  args: { value: '2026-09-14', onMonthChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
    await expect(canvas.getByText('October 2026')).toBeInTheDocument();
    await expect(args.onMonthChange).toHaveBeenLastCalledWith('2026-10-01');
    await userEvent.click(canvas.getByRole('button', { name: 'Previous month' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Previous month' }));
    await expect(canvas.getByText('August 2026')).toBeInTheDocument();
    await expect(args.onMonthChange).toHaveBeenLastCalledWith('2026-08-01');
  },
};
