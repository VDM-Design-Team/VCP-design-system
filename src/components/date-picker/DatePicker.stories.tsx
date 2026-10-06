import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker, type DatePickerPreset, type DatePickerProps } from './DatePicker';
import { Popover } from '../popover';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';

/* Stories pin "today" so snapshots don't drift with the calendar. */
const TODAY = '2026-09-15';

/**
 * Figma's quick picks, resolved against the pinned today. What "Overdue"
 * spans is the caller's business — the panel only sees label → dates.
 */
const PRESETS: DatePickerPreset[] = [
  { label: 'Today', value: TODAY },
  { label: 'Last 7 days', value: '2026-09-09', rangeEnd: TODAY },
  { label: 'This Month', value: '2026-09-01', rangeEnd: '2026-09-30' },
  { label: 'Last Month', value: '2026-08-01', rangeEnd: '2026-08-31' },
  { label: 'This Quarter', value: '2026-07-01', rangeEnd: '2026-09-30' },
  { label: 'Overdue', value: '2026-08-17', rangeEnd: '2026-09-14' },
  { label: 'Due Soon', value: TODAY, rangeEnd: '2026-09-22' },
];

/** The Storybook-only switches that stand in for Figma's yes/no axes. */
type PlaygroundArgs = DatePickerProps & {
  /** Figma `Button=Yes`: the footer button. */
  button?: boolean;
  /** The quick picks Figma shows with Dual View and Mobile Friendly. */
  showPresets?: boolean;
};

const meta = {
  title: 'Components/Forms/DatePicker',
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component:
          'The calendar panel, in the shapes Figma’s `Date_Picker_VCP` set draws: **Mode** ' +
          '(day, range, month), **Button** (a footer Clear), **Dual View** (two calendars ' +
          'that page independently) and **Mobile Friendly** (`h-10` days, presets as a ' +
          'scrolling row). Flip them with the controls on the first story. One tab stop per ' +
          'grid — arrows move by day and week and drag the view across month boundaries; the ' +
          'month heading opens the month grid. Generic `markers`/`flagged`/`presets`; the ' +
          'planning patterns own their meaning. ISO dates in local time.',
      },
    },
  },
  args: { value: '2026-09-14', today: TODAY },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['day', 'range', 'month'],
      description: 'Figma **Mode**: Day, Day & Range, Month.',
    },
    button: { control: 'boolean', name: 'button (footer)', description: 'Figma **Button**.' },
    showPresets: { control: 'boolean', name: 'presets', description: 'Quick picks.' },
    dualView: { control: 'boolean', description: 'Figma **Dual View**. Day and range mode only.' },
    mobile: { control: 'boolean', description: 'Figma **Mobile Friendly**.' },
    clearLabel: { control: 'text' },
    value: { control: 'text' },
    rangeEnd: { control: 'text' },
    min: { control: 'text' },
    max: { control: 'text' },
    today: { control: 'text' },
    presets: { control: false },
    markers: { control: false },
    flagged: { control: false },
    month: { control: false },
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<PlaygroundArgs>;

/**
 * Holds the picked value (and range end) so every story is live. Picking in
 * range mode runs the two-click flow; the footer button clears.
 */
function Live({ button, showPresets, ...args }: PlaygroundArgs) {
  const [value, setValue] = React.useState(args.value);
  const [rangeEnd, setRangeEnd] = React.useState(args.rangeEnd);
  /* Follow the controls when they change the starting point. */
  React.useEffect(() => {
    setValue(args.value);
    setRangeEnd(args.rangeEnd);
  }, [args.value, args.rangeEnd, args.mode]);
  return (
    /* w-90 = Figma's 362 mobile frame, to the nearest step. */
    <div className={args.mobile ? 'w-90' : undefined}>
      <DatePicker
        {...args}
        /* Remount on a layout switch so each calendar starts on the value. */
        key={`${args.mode}-${args.dualView}-${args.mobile}`}
        value={value}
        rangeEnd={rangeEnd}
        presets={showPresets ? PRESETS : args.presets}
        onChange={(iso) => {
          setValue(iso);
          setRangeEnd(undefined);
          args.onChange?.(iso);
        }}
        onRangeChange={(start, end) => {
          setValue(start);
          setRangeEnd(end);
          args.onRangeChange?.(start, end);
        }}
        onClear={
          button
            ? () => {
                setValue(undefined);
                setRangeEnd(undefined);
                args.onClear?.();
              }
            : args.onClear
        }
      />
    </div>
  );
}

/**
 * **Playground.** Every Figma variant is a combination of the controls:
 * Mode, Button, Dual View, Mobile Friendly (and presets, which Figma pairs
 * with the last two).
 */
export const Default: Story = {
  args: { mode: 'day', button: false, showPresets: false, dualView: false, mobile: false },
  render: (args) => <Live {...args} />,
};

/** Figma `Mode=Day & Range`: the first click starts the range, the second ends it. */
export const DayAndRange: Story = {
  args: { mode: 'range', value: '2026-09-14', rangeEnd: '2026-09-17' },
  render: (args) => <Live {...args} />,
};

/** Figma `Mode=Day & Range, Button=Yes` — the footer button (Figma labels this one Cancel). */
export const DayAndRangeWithButton: Story = {
  args: { mode: 'range', value: '2026-09-14', rangeEnd: '2026-09-17', button: true, clearLabel: 'Cancel' },
  render: (args) => <Live {...args} />,
};

/** Figma `Mode=Month`: a year of months; picking reports the first of the month. */
export const Month: Story = {
  args: { mode: 'month', value: '2026-09-01' },
  render: (args) => <Live {...args} />,
};

/** Figma `Mode=Month, Button=Yes`. */
export const MonthWithButton: Story = {
  args: { mode: 'month', value: '2026-09-01', button: true },
  render: (args) => <Live {...args} />,
};

/**
 * Figma `Dual View=Yes`: quick picks down the side, two calendars that page
 * independently — a range from June can end in September with both ends in
 * view.
 */
export const DualView: Story = {
  args: {
    mode: 'range',
    value: '2026-09-14',
    rangeEnd: '2026-10-02',
    dualView: true,
    showPresets: true,
    button: true,
  },
  render: (args) => <Live {...args} />,
};

/**
 * Figma `Mobile Friendly=Yes`: `h-10` day targets, full width, quick picks as a
 * row that scrolls sideways.
 */
export const MobileFriendly: Story = {
  args: {
    mode: 'range',
    value: '2026-09-14',
    rangeEnd: '2026-09-27',
    mobile: true,
    showPresets: true,
    button: true,
  },
  render: (args) => <Live {...args} />,
};

/** `min`/`max` disable the outside; arrows refuse to leave the window. */
export const Bounded: Story = {
  args: { min: '2026-09-07', max: '2026-09-25' },
  render: (args) => <Live {...args} />,
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

/**
 * Panel, days, range, presets, markers and flags are tokens, so dark is free.
 * Light above dark: the dual view (with presets and the footer) and the
 * month grid.
 */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="flex flex-col">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-wrap items-start gap-6 bg-surface-canvas p-8">
            <DatePicker
              {...args}
              mode="range"
              dualView
              presets={PRESETS}
              onClear={() => {}}
              value="2026-09-07"
              rangeEnd="2026-09-18"
              flagged={['2026-09-21']}
              markers={{ '2026-09-22': 'danger' }}
            />
            <DatePicker {...args} mode="month" value="2026-09-01" onClear={() => {}} />
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
    /* Drawn as "Sep 2026"; announced in full from a polite live region. */
    const heading = canvas.getByText('September 2026');
    await expect(heading.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
    await expect(canvas.getByText('Sep 2026')).toHaveAttribute('aria-hidden', 'true');

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

/**
 * **Flow:** range mode takes two clicks — the first starts a range (no end
 * yet), the second closes it. A click before the start, or any click once
 * the range is closed, starts over.
 */
export const RangeTwoClicks: Story = {
  parameters: { controls: { disable: true } },
  args: { mode: 'range', value: undefined, onRangeChange: fn() },
  render: (args) => <Live {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(day(canvas, '10 September 2026'));
    await expect(args.onRangeChange).toHaveBeenLastCalledWith('2026-09-10', undefined);
    await userEvent.click(day(canvas, '16 September 2026'));
    await expect(args.onRangeChange).toHaveBeenLastCalledWith('2026-09-10', '2026-09-16');
    await expect(day(canvas, '10 September 2026')).toHaveAttribute('aria-pressed', 'true');
    await expect(day(canvas, '16 September 2026')).toHaveAttribute('aria-pressed', 'true');

    /* Closed — the next click starts a new range. */
    await userEvent.click(day(canvas, '20 September 2026'));
    await expect(args.onRangeChange).toHaveBeenLastCalledWith('2026-09-20', undefined);
    /* Before the start — starts over from there rather than running backwards. */
    await userEvent.click(day(canvas, '18 September 2026'));
    await expect(args.onRangeChange).toHaveBeenLastCalledWith('2026-09-18', undefined);
  },
};

/**
 * **Flow:** in day mode the month heading opens the month grid (the caret
 * promises it); picking a month goes back to its days without choosing a
 * date.
 */
export const HeadingOpensMonths: Story = {
  parameters: { controls: { disable: true } },
  args: { onChange: fn() },
  render: (args) => <Live {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'September 2026, choose month' }));
    await expect(canvas.getByRole('button', { name: 'September 2026' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Next year' }));
    await userEvent.click(canvas.getByRole('button', { name: 'February 2027' }));
    await expect(day(canvas, '1 February 2027')).toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/**
 * **Flow:** month mode picks a month, reported as its first day. The grid
 * roves like the day grid: arrows by month and by row of three, across years.
 */
export const MonthModePicks: Story = {
  parameters: { controls: { disable: true } },
  args: { mode: 'month', value: '2026-09-01', onChange: fn() },
  render: (args) => <Live {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const month = (name: string) => canvas.getByRole('button', { name });
    await expect(month('September 2026')).toHaveAttribute('tabindex', '0');
    month('September 2026').focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(month('December 2026')).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(month('January 2027')).toHaveFocus());
    await expect(canvas.getByText('2027', { selector: '.sr-only' })).toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenCalledWith('2027-01-01');
  },
};

/**
 * **Flow:** a quick pick applies its dates (a range, here) and pages the
 * calendar to them; it reads as pressed while those dates are the value.
 * The footer button clears.
 */
export const PresetsAndClear: Story = {
  parameters: { controls: { disable: true } },
  args: {
    mode: 'range',
    value: undefined,
    showPresets: true,
    button: true,
    onRangeChange: fn(),
    onClear: fn(),
  },
  render: (args) => <Live {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const lastMonth = canvas.getByRole('button', { name: 'Last Month' });
    await expect(lastMonth).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(lastMonth);
    await expect(args.onRangeChange).toHaveBeenLastCalledWith('2026-08-01', '2026-08-31');
    await expect(lastMonth).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByText('August 2026')).toBeInTheDocument();
    await expect(day(canvas, '1 August 2026')).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(args.onClear).toHaveBeenCalledOnce();
    await expect(lastMonth).toHaveAttribute('aria-pressed', 'false');
    await expect(day(canvas, '1 August 2026')).not.toHaveAttribute('aria-pressed');
  },
};
