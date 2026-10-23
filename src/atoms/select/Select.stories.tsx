import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Select } from './Select';
import { Field } from '../../components/field';

const DOMAINS = ['Development', 'Design', 'Procurement', 'Quality', 'Logistics'];

const meta = {
  title: 'Atoms/Select',
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          'A choice from a fixed list, on the native `<select>` — the popup, keyboard model ' +
          'and mobile pickers come from the platform. The shell is `Input`’s, class for ' +
          'class, so a form mixes the two seamlessly. The field reads like `SearchSelect`’s (a grey ' +
          'placeholder, a medium-weight value), but the open list is the browser’s: for the styled ' +
          'panel, or search, use `SearchSelect`.',
      },
    },
  },
  args: { options: DOMAINS, placeholder: 'Choose a domain' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'] },
    invalid: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Uncontrolled with a placeholder: starts on it, and it can't be re-picked. The placeholder is
 * `text.subtle` in regular weight, and a chosen value is `text.primary` in medium — the same pairing
 * as `SearchSelect`'s field.
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <Select {...args} aria-label="Domain" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox', { name: 'Domain' });
    const placeholder = getComputedStyle(select);
    const [subtleColor, regularWeight] = [placeholder.color, placeholder.fontWeight];

    await userEvent.selectOptions(select, 'Design');
    const chosen = getComputedStyle(select);
    /* Choosing a value darkens the text and sets it in a heavier weight. */
    await expect(chosen.color).not.toBe(subtleColor);
    await expect(Number(chosen.fontWeight)).toBeGreaterThan(Number(regularWeight));
  },
};

/** Controlled — `onChange` hands you the value, nothing else. */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('Design');
    return (
      <div className="flex w-72 flex-col gap-3">
        <Select {...args} aria-label="Domain" value={value} onChange={setValue} />
        <span className="font-sans text-caption-md-regular text-text-tertiary">Chosen: {value}</span>
      </div>
    );
  },
};

/** Inside a Field — the label, hint and error wiring come from there. */
export const InAField: Story = {
  render: (args) => (
    <div className="w-72">
      <Field label="Domain" helper="Where this Added Value is initiated.">
        <Select {...args} fullWidth />
      </Field>
    </div>
  ),
};

/** `error` puts a message under the select in the critical colour, as `SearchSelect` does. */
export const WithError: Story = {
  render: (args) => (
    <div className="w-72">
      <Select {...args} aria-label="Domain" error="Choose a domain before submitting." fullWidth />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox', { name: 'Domain' });
    await expect(within(canvasElement).getByText('Choose a domain before submitting.')).toBeVisible();
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(select).toHaveAccessibleDescription('Choose a domain before submitting.');
  },
};

/** Same treatment as Input: critical border, `aria-invalid`, message from Field. */
export const Invalid: Story = {
  render: (args) => (
    <div className="w-72">
      <Field label="Domain" error="Choose a domain before submitting.">
        <Select {...args} invalid fullWidth />
      </Field>
    </div>
  ),
};

/** Disabled options stay listed — visible but unpickable beats vanishing. */
export const DisabledOptions: Story = {
  args: {
    options: [
      { value: 'dev', label: 'Development' },
      { value: 'design', label: 'Design' },
      { value: 'proc', label: 'Procurement (no capacity)', disabled: true },
    ],
  },
  render: (args) => (
    <div className="w-72">
      <Select {...args} aria-label="Domain" />
    </div>
  ),
};

/** `children` is the optgroup escape hatch. */
export const Grouped: Story = {
  args: { options: undefined },
  render: (args) => (
    <div className="w-72">
      <Select {...args} aria-label="Assignee">
        <optgroup label="Designers">
          <option value="eve">Eve Kestrel</option>
          <option value="marvin">Marvin Ode</option>
        </optgroup>
        <optgroup label="Leads">
          <option value="ali">Ali Reza</option>
        </optgroup>
      </Select>
    </div>
  ),
};

/** 32 for dense toolbars, 40 default; disabled goes quiet, not invisible. */
export const SizesAndDisabled: Story = {
  render: (args) => (
    <div className="flex w-72 flex-col gap-3">
      <Select {...args} aria-label="Domain, small" size="sm" />
      <Select {...args} aria-label="Domain, default" />
      <Select {...args} aria-label="Domain, disabled" disabled />
    </div>
  ),
};

/** Shell and caret are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-3 bg-surface-canvas p-8">
            <Select {...args} aria-label="Domain" />
            <Select {...args} aria-label="Domain, invalid" invalid />
            <Select {...args} aria-label="Domain, disabled" disabled />
          </div>
        </div>
      ))}
    </div>
  ),
};
