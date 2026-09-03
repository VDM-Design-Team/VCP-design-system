import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup } from './RadioGroup';

const plans = [
  { value: 'starter', label: 'Starter' },
  { value: 'growth', label: 'Growth' },
  { value: 'scale', label: 'Scale' },
];

const plansWithHints = [
  { value: 'starter', label: 'Starter', hint: 'Up to 3 seats, 1 workspace.' },
  { value: 'growth', label: 'Growth', hint: 'Up to 25 seats, SSO, audit log.' },
  { value: 'scale', label: 'Scale', hint: 'Unlimited seats and a named CSM.' },
];

const meta = {
  title: 'Atoms/RadioGroup',
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          'A set of mutually exclusive options. Built on real `<input type="radio">` elements ' +
          'sharing a `name` inside a `<fieldset>`, so arrow-key navigation, the single tab stop, ' +
          'and native grouping come from the browser. Use it when every option should be visible ' +
          'at once (roughly 2–7 choices); reach for Select above that.',
      },
    },
  },
  args: {
    label: 'Plan',
    options: plans,
    defaultValue: 'growth',
  },
  argTypes: {
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    disabled: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
};

export const WithHints: Story = {
  args: { options: plansWithHints, label: 'Choose a plan' },
};

export const DisabledOption: Story = {
  args: {
    label: 'Delivery speed',
    options: [
      { value: 'standard', label: 'Standard', hint: 'Arrives in 3–5 days.' },
      { value: 'express', label: 'Express', hint: 'Arrives tomorrow.' },
      {
        value: 'same-day',
        label: 'Same day',
        hint: 'Not available at this address.',
        disabled: true,
      },
    ],
    defaultValue: 'standard',
  },
};

export const GroupDisabled: Story = {
  args: { options: plansWithHints, disabled: true, label: 'Plan (locked to your contract)' },
};

export const StringShorthand: Story = {
  args: {
    label: 'Billing period',
    options: ['Monthly', 'Quarterly', 'Annual'],
    defaultValue: 'Monthly',
    orientation: 'horizontal',
  },
};

export const Controlled: Story = {
  args: { options: plansWithHints },
  render: (args) => {
    const [value, setValue] = React.useState('growth');
    return (
      <div className="flex flex-col gap-4">
        <RadioGroup {...args} value={value} onChange={setValue} defaultValue={undefined} />
        <p className="font-sans text-body-sm text-text-secondary">
          Selected: <code>{value}</code>
        </p>
      </div>
    );
  },
};

export const LongLabels: Story = {
  args: {
    label: 'Data retention',
    options: [
      {
        value: 'short',
        label: 'Keep raw event data for 30 days, then roll it up into daily aggregates',
        hint: 'The cheapest option. Individual events are unrecoverable after the roll-up runs.',
      },
      {
        value: 'long',
        label:
          'Keep raw event data for 13 months so year-over-year comparisons stay exact to the event',
        hint: 'Recommended for teams that run compliance reporting or cohort analysis.',
      },
    ],
    defaultValue: 'short',
  },
  render: (args) => (
    <div className="max-w-sm">
      <RadioGroup {...args} />
    </div>
  ),
};

export const HiddenLabel: Story = {
  args: { hideLabel: true, label: 'Plan' },
};

export const LightAndDark: Story = {
  args: { options: plansWithHints },
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <div className="rounded-md bg-surface-canvas p-6">
        <RadioGroup {...args} label="Plan — light" />
      </div>
      <div className="dark rounded-md bg-surface-canvas p-6">
        <RadioGroup {...args} label="Plan — dark" />
      </div>
    </div>
  ),
};
