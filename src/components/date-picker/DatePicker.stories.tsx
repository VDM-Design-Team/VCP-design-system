import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';
import { Popover } from '../popover';
import { Input } from '../../atoms/input';
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
        <div className="flex gap-4 font-sans text-label-sm text-text-tertiary">
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

/** The composition: an Input trigger opening the panel in a Popover. */
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
            <button type="button" aria-label="Choose start date" className="w-64 text-left">
              <Input
                aria-hidden="true"
                tabIndex={-1}
                readOnly
                fullWidth
                value={value ?? ''}
                placeholder="Pick a date"
                leadingIcon={<Icon name="calendar-blank" size="sm" />}
                className="pointer-events-none"
              />
            </button>
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
