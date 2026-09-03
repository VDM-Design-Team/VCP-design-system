import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl } from './SegmentedControl';

const meta = {
  title: 'Atoms/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          'A small set of mutually exclusive options, all visible at once. Use it to switch how ' +
          'the same content is shown — List / Board / Calendar — not to move between different ' +
          'pages of content. Two to five options; past five, use a Select. It is a radio group, ' +
          'so arrow keys move between segments and the whole control is a single tab stop.',
      },
    },
  },
  args: {
    'aria-label': 'View mode',
    options: ['List', 'Board', 'Calendar'],
    defaultValue: 'Board',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'] },
    fullWidth: { control: 'boolean' },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <SegmentedControl {...args} size="sm" />
      <SegmentedControl {...args} size="md" />
    </div>
  ),
};

/** Two options is the floor. Below that, use a Toggle. */
export const TwoOptions: Story = {
  args: { options: ['Active', 'Archived'], defaultValue: 'Active' },
};

/** Five is the ceiling. Past that the labels crowd and a Select reads better. */
export const FiveOptions: Story = {
  args: {
    options: ['Day', 'Week', 'Month', 'Quarter', 'Year'],
    defaultValue: 'Week',
    'aria-label': 'Time range',
  },
};

/** A disabled segment stays visible and announced, so the option is discoverable but unavailable. */
export const WithDisabledOption: Story = {
  args: {
    options: [
      { value: 'List', label: 'List' },
      { value: 'Board', label: 'Board' },
      { value: 'Calendar', label: 'Calendar', disabled: true },
    ],
    defaultValue: 'List',
  },
};

/** Stretches to its container — mobile toolbars and modal headers. */
export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <div className="w-96">
      <SegmentedControl {...args} />
    </div>
  ),
};

/** Long labels truncate rather than wrap, so the control keeps one row. */
export const LongLabels: Story = {
  args: {
    options: ['Everything assigned to me', 'My team', 'All'],
    defaultValue: 'My team',
    fullWidth: true,
  },
  render: (args) => (
    <div className="w-80">
      <SegmentedControl {...args} />
    </div>
  ),
};

/** Controlled — the parent owns the value. */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('List');
    return (
      <div className="flex flex-col gap-2">
        <SegmentedControl {...args} value={value} onChange={setValue} />
        <p className="text-body-sm text-text-secondary">Showing: {value}</p>
      </div>
    );
  },
};

/** Both themes side by side — the selected segment must stay readable in each. */
export const DarkTheme: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      <div className="bg-surface-canvas p-8">
        <SegmentedControl {...args} />
      </div>
      <div className="dark bg-surface-canvas p-8">
        <SegmentedControl {...args} />
      </div>
    </div>
  ),
};
