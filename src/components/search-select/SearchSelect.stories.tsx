import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchSelect } from './SearchSelect';

const PEOPLE = [
  'Eve Kestrel',
  'Marvin Ode',
  'Ali Reza',
  'Nora Lindqvist',
  'Tomas Berg',
  'Priya Nair',
  'Jonas Weber',
  'Lucia Ferrari',
];

const SUPPLIERS = [
  'Nordfjord Components',
  'Baltika Fasteners',
  'Helix Tooling',
  'Verde Logistics',
  'Osted Plastics',
  'Kranz Metallwerk',
];

const meta = {
  title: 'Forms/SearchSelect',
  component: SearchSelect,
  parameters: {
    docs: {
      description: {
        component:
          'A choice found by typing — the combobox `Select`’s docs promised, for lists past ' +
          'the few dozen where the native popup stops scaling. Real combobox wiring: ' +
          '`aria-activedescendant`, arrows move the active option, Enter picks, Escape ' +
          'closes, focus never leaves the input. Filtering is internal, on the label.',
      },
    },
  },
  args: { options: PEOPLE, placeholder: 'Search people…' },
} satisfies Meta<typeof SearchSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single select: picking closes and clears the query. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string>();
    return (
      <div className="flex h-80 w-72 flex-col gap-3">
        <SearchSelect {...args} value={value} onChange={setValue} aria-label="Assignee" />
        <span className="font-sans text-body-sm text-text-tertiary">
          Chosen: {value ?? '—'}
        </span>
      </div>
    );
  },
};

/**
 * `multiple`: picks toggle, the list stays open, and the count sits at the
 * field's end while the input keeps showing the query.
 */
export const Multiple: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(['Eve Kestrel']);
    return (
      <div className="flex h-96 w-72 flex-col gap-3">
        <SearchSelect
          {...args}
          multiple
          value={value}
          onChange={setValue}
          placeholder="Add watchers…"
          aria-label="Watchers"
        />
        <span className="font-sans text-body-sm text-text-tertiary">
          {value.length ? value.join(', ') : 'Nobody yet'}
        </span>
      </div>
    );
  },
};

/** `avatars={false}` for option sets that are not people. */
export const NotPeople: Story = {
  args: { options: SUPPLIERS, avatars: false, placeholder: 'Search suppliers…' },
  render: (args) => {
    const [value, setValue] = React.useState<string>();
    return (
      <div className="h-80 w-72">
        <SearchSelect {...args} value={value} onChange={setValue} aria-label="Supplier" />
      </div>
    );
  },
};

/** A query with no hits says so — the honest state, in words. */
export const Empty: Story = {
  args: { emptyText: 'No people match' },
  render: (args) => (
    <div className="h-64 w-72">
      <SearchSelect {...args} aria-label="Assignee" />
    </div>
  ),
};

/** Field, list, selection tint and avatars are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="h-64 bg-surface-canvas p-8">
            <SearchSelect {...args} aria-label="Assignee" value="Eve Kestrel" />
          </div>
        </div>
      ))}
    </div>
  ),
};
