import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from './Input';
import { IconButton } from '../icon-button';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          'A single-line text field. `md` (40 tall) is the default and the only size safe for touch; ' +
          '`sm` is for dense tables and toolbars. Icons are decorative — always ship a real `<label>` ' +
          'alongside the field, and pair `invalid` with a visible error message.' +
          '\n\n**From Figma:** Use a text field when someone needs to enter text into a UI, ' +
          'such as filling in contact or payment information.',
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

/**
 * `emphasis="medium"` sets a *chosen* value in medium — what `Select`, `SearchSelect` and `DateField` do — while the
 * placeholder stays regular. The default is regular.
 */
export const MediumValue: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input aria-label="Regular" defaultValue="Development" />
      <Input aria-label="Medium" emphasis="medium" defaultValue="Development" />
      <Input aria-label="Medium, empty" emphasis="medium" placeholder="Choose a domain" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const weight = (name: string) => Number(getComputedStyle(c.getByRole('textbox', { name })).fontWeight);
    await expect(weight('Regular')).toBe(400);
    await expect(weight('Medium')).toBe(500);
    /* Nothing chosen yet: the placeholder is regular whatever the emphasis. */
    await expect(weight('Medium, empty')).toBe(400);
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Input {...args} size="sm" aria-label="Small" placeholder="Small — 32 tall, dense contexts" />
      <Input {...args} size="compact" aria-label="Compact" placeholder="Compact — 36 tall, beside a small Button" />
      <Input {...args} size="md" aria-label="Medium" placeholder="Medium — 40 tall, the default" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const height = (name: string) => Math.round((c.getByRole('textbox', { name }).parentElement as HTMLElement).getBoundingClientRect().height);
    await expect([height('Small'), height('Compact'), height('Medium')]).toEqual([32, 36, 40]);
  },
};

export const WithLeadingIcon: Story = {
  args: { placeholder: 'Search by title or ID', leadingIcon: <SearchIcon /> },
};

export const WithTrailingIcon: Story = {
  args: { defaultValue: '02-03-2026', trailingIcon: <CalendarIcon /> },
};

/**
 * `trailingAction` is a control at the field's end — here a clear button — where `trailingIcon` is only decoration. It is a real, focusable button the
 * caller names, and it sits inside the field's border and ring.
 */
export const WithTrailingAction: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('Search term');
    return (
      <Input
        {...args}
        aria-label="Search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        trailingAction={<IconButton size="xs" icon="x" label="Clear search" onClick={() => setValue('')} />}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('textbox', { name: 'Search' })).toHaveValue('Search term');
    /* A real button, named, not hidden from assistive tech. */
    const clear = c.getByRole('button', { name: 'Clear search' });
    await expect(clear).toBeVisible();
    await userEvent.click(clear);
    await expect(c.getByRole('textbox', { name: 'Search' })).toHaveValue('');
  },
};

export const Invalid: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1">
      <label className="text-label-sm-medium text-text-primary" htmlFor="invalid-demo">
        Reference
      </label>
      <Input {...args} id="invalid-demo" invalid defaultValue="Invalid value" aria-describedby="invalid-demo-error" />
      <p id="invalid-demo-error" className="text-caption-md-regular text-accent-critical-outline-content-default">
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
        <label className="text-label-sm-medium text-text-primary" htmlFor="controlled-demo">
          Project name
        </label>
        <Input
          {...args}
          id="controlled-demo"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          leadingIcon={<SearchIcon />}
        />
        <p className="text-caption-md-regular text-text-secondary">Current value: {value || '—'}</p>
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
    <Input invalid defaultValue="Invalid value" aria-label="Invalid example" />
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
