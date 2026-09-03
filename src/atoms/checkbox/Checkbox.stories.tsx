import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          'A real `<input type="checkbox">` with a token-styled box. Use it for independent ' +
          'on/off choices inside a form that is explicitly submitted. The `indeterminate` ' +
          'state is for the parent row of a partially selected group — it is never something ' +
          'a user can select directly.' +
          '\n\n**From Figma:** Checkboxes are a selection control which allow users to select ' +
          'one or more options from a set; present a list containing sub-selections; and turn ' +
          'an item on or off in a desktop environment.',
      },
    },
  },
  args: { label: 'Email me about product updates' },
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Select all regions' },
};

/** Every state side by side, so a regression in one is obvious. */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-col items-start">
      <Checkbox {...args} label="Unchecked" />
      <Checkbox {...args} label="Checked" defaultChecked />
      <Checkbox {...args} label="Mixed" indeterminate />
    </div>
  ),
};

/** Disabled in each of the three states. Colour alone never carries the meaning. */
export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-col items-start">
      <Checkbox {...args} label="Disabled, unchecked" disabled />
      <Checkbox {...args} label="Disabled, checked" disabled defaultChecked />
      <Checkbox {...args} label="Disabled, mixed" disabled indeterminate />
    </div>
  ),
};

/**
 * Without a `label` the control still needs an accessible name — pass `aria-label`.
 * This is the shape you want inside a table's select-row column.
 */
export const WithoutLabel: Story = {
  args: { label: undefined },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Checkbox {...args} aria-label="Select row" />
      <Checkbox {...args} aria-label="Select row" defaultChecked />
      <Checkbox {...args} aria-label="Select all rows" indeterminate />
      <Checkbox {...args} aria-label="Select row" disabled />
    </div>
  ),
};

/** The label wraps; the box stays pinned to the first line and the whole block is clickable. */
export const LongLabel: Story = {
  args: {
    label:
      'Send me the weekly VCP digest, including product changes, scheduled maintenance ' +
      'windows, and occasional research invitations. You can unsubscribe at any time.',
  },
  render: (args) => (
    <div className="max-w-sm">
      <Checkbox {...args} />
    </div>
  ),
};

/** `fullWidth` makes the whole row a target — use it for list and settings rows. */
export const FullWidth: Story = {
  args: { fullWidth: true, label: 'Make this workspace public' },
  render: (args) => (
    <div className="w-96 rounded-md border border-stroke-subtle bg-surface-elevated">
      <Checkbox {...args} />
    </div>
  ),
};

const REGIONS = ['North', 'South', 'East', 'West'];

function RegionGroup() {
  const [selected, setSelected] = React.useState<string[]>(['North']);
  const allChecked = selected.length === REGIONS.length;
  const someChecked = selected.length > 0 && !allChecked;

  return (
    <fieldset className="border-0 p-0">
      <legend className="px-3 font-sans text-label-md text-text-primary">Regions</legend>
      <Checkbox
        label="All regions"
        checked={allChecked}
        indeterminate={someChecked}
        onChange={(checked) => setSelected(checked ? [...REGIONS] : [])}
      />
      <div className="flex flex-col items-start ps-6">
        {REGIONS.map((region) => (
          <Checkbox
            key={region}
            label={region}
            checked={selected.includes(region)}
            onChange={(checked) =>
              setSelected((current) =>
                checked ? [...current, region] : current.filter((r) => r !== region),
              )
            }
          />
        ))}
      </div>
    </fieldset>
  );
}

/**
 * The reason `indeterminate` exists: the parent row of a partially selected group.
 * Tick one or two children and the parent goes mixed; tick all four and it goes checked.
 */
export const ParentChildGroup: Story = {
  args: { label: undefined },
  render: () => <RegionGroup />,
};

/** Light and dark, from the same semantic tokens — no per-theme classes in the component. */
export const Themes: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <div className="rounded-md bg-surface-canvas p-4">
        <div className="flex flex-col items-start">
          <Checkbox {...args} label="Unchecked" />
          <Checkbox {...args} label="Checked" defaultChecked />
          <Checkbox {...args} label="Mixed" indeterminate />
          <Checkbox {...args} label="Disabled" disabled defaultChecked />
        </div>
      </div>
      <div className="dark rounded-md bg-surface-canvas p-4">
        <div className="flex flex-col items-start">
          <Checkbox {...args} label="Unchecked" />
          <Checkbox {...args} label="Checked" defaultChecked />
          <Checkbox {...args} label="Mixed" indeterminate />
          <Checkbox {...args} label="Disabled" disabled defaultChecked />
        </div>
      </div>
    </div>
  ),
};
