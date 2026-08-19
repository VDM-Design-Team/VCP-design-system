import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'Forms/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          'A single-line text field. `md` (40 tall) is the default and the only size safe for touch; ' +
          '`sm` is for dense tables and toolbars. Icons are decorative — always ship a real `<label>` ' +
          'alongside the field, and pair `invalid` with a visible error message.',
      },
    },
  },
  args: { placeholder: 'Type in the title' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'] },
    invalid: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    leadingIcon: { control: false },
    trailingIcon: { control: false },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Decorative 16px icons, matching the design export. */
const SearchIcon = () => (
  <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5 14 14" strokeLinecap="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3.5" width="12" height="10" rx="2" />
    <path d="M2 6.5h12M5.5 2v3M10.5 2v3" strokeLinecap="round" />
  </svg>
);

export const Default: Story = {};

export const Placeholder: Story = {
  args: { placeholder: 'Search by title or ID' },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Input {...args} size="sm" placeholder="Small — 32 tall, dense contexts" />
      <Input {...args} size="md" placeholder="Medium — 40 tall, the default" />
    </div>
  ),
};

export const WithLeadingIcon: Story = {
  args: { placeholder: 'Search by title or ID', leadingIcon: <SearchIcon /> },
};

export const WithTrailingIcon: Story = {
  args: { defaultValue: '02-03-2026', trailingIcon: <CalendarIcon /> },
};

export const Invalid: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1">
      <label className="text-label-md text-text-primary" htmlFor="invalid-demo">
        Reference
      </label>
      <Input {...args} id="invalid-demo" invalid defaultValue="Invalid value" aria-describedby="invalid-demo-error" />
      <p id="invalid-demo-error" className="text-body-sm text-accent-critical-outline-content-default">
        Enter a reference in the format ABC-1234.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Input {...args} disabled placeholder="Disabled" />
      <Input {...args} disabled defaultValue="Locked value" leadingIcon={<SearchIcon />} />
    </div>
  ),
};

export const FullWidth: Story = {
  args: { fullWidth: true, placeholder: 'Spans its container' },
  render: (args) => (
    <div className="w-96 rounded-md border border-stroke-subtle p-4">
      <Input {...args} />
    </div>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('Added Value');
    return (
      <div className="flex flex-col gap-1">
        <label className="text-label-md text-text-primary" htmlFor="controlled-demo">
          Project name
        </label>
        <Input
          {...args}
          id="controlled-demo"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          leadingIcon={<SearchIcon />}
        />
        <p className="text-body-sm text-text-secondary">Current value: {value || '—'}</p>
      </div>
    );
  },
};

/** Every class is a semantic token, so the dark theme comes for free via `.dark`. */
const Showcase = () => (
  <div className="flex flex-col gap-3">
    <Input placeholder="Default" />
    <Input placeholder="With icon" leadingIcon={<SearchIcon />} />
    <Input size="sm" placeholder="Small" trailingIcon={<CalendarIcon />} />
    <Input invalid defaultValue="Invalid value" />
    <Input disabled placeholder="Disabled" />
  </div>
);

export const Light: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="bg-surface-canvas p-8">
      <Showcase />
    </div>
  ),
};

export const Dark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="dark bg-surface-canvas p-8">
      <Showcase />
    </div>
  ),
};
