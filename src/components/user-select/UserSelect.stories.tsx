import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { UserSelect, type UserSelectOption } from './UserSelect';
import { Field } from '../field';

const PEOPLE: UserSelectOption[] = [
  { value: 'unassigned', label: 'Unassigned', unassigned: true },
  { value: 'adam', label: 'Adam' },
  { value: 'adrian', label: 'Adrian Cruz' },
  { value: 'amy', label: 'Amy Lee' },
  { value: 'carl', label: 'Carl Baker' },
  { value: 'liam', label: 'Liam Carter' },
  { value: 'maya', label: 'Maya Bennett' },
];

const meta = {
  title: 'Components/Forms/UserSelect',
  component: UserSelect,
  parameters: {
    docs: {
      description: {
        component:
          'One person from a list you can search: an assignee, an initiator, a filter by user. ' +
          'The field shows who is picked; the panel opens with a search field over avatar rows. ' +
          'For several people use `MultiSelect`; for a choice that is not a person, `Select`.',
      },
    },
  },
  args: { options: PEOPLE, placeholder: 'Select user', onChange: fn() },
  argTypes: { disabled: { control: 'boolean' }, invalid: { control: 'boolean' } },
  decorators: [
    (Story) => (
      <div className="h-96 w-60">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page owns the value; the story stands in for it. */
function Controlled(props: React.ComponentProps<typeof UserSelect>) {
  const [value, setValue] = React.useState(props.value ?? '');
  return (
    <UserSelect
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

/** Open, search, pick: the field then says who. */
export const Default: Story = {
  render: (args) => <Controlled {...args} aria-label="Assignee" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Assignee' });
    await expect(trigger).toHaveTextContent('Select user');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    /* Focus is in the search, ready to type. */
    const search = canvas.getByRole('combobox', { name: 'Search…' });
    await expect(search).toHaveFocus();
    await expect(canvas.getAllByRole('option')).toHaveLength(7);

    await userEvent.type(search, 'ca');
    await expect(canvas.getAllByRole('option')).toHaveLength(2);
    await expect(canvas.getByRole('option', { name: 'Carl Baker' })).toBeVisible();
    await expect(canvas.getByRole('option', { name: 'Liam Carter' })).toBeVisible();

    await userEvent.click(canvas.getByRole('option', { name: 'Liam Carter' }));
    await expect(args.onChange).toHaveBeenLastCalledWith('liam');
    await expect(trigger).toHaveTextContent('Liam Carter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
  },
};

/** Keyboard: the search is the combobox. Arrows move, Enter picks, Escape closes and returns focus. */
export const Keyboard: Story = {
  render: (args) => <Controlled {...args} aria-label="Assignee" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Assignee' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const search = canvas.getByRole('combobox', { name: 'Search…' });
    await expect(search).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(search).toHaveAttribute('aria-activedescendant', expect.stringMatching(/opt-2$/));
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('adrian');

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveTextContent('Adrian Cruz');
  },
};

/** The Unassigned row is a person glyph, not an avatar, and is a choice like any other. */
export const Unassigned: Story = {
  args: { value: 'unassigned' },
  render: (args) => <Controlled {...args} aria-label="Assignee" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Assignee' })).toHaveTextContent('Unassigned');
    await userEvent.click(canvas.getByRole('button', { name: 'Assignee' }));
    await expect(canvas.getByRole('option', { name: 'Unassigned' })).toHaveAttribute('aria-selected', 'true');
  },
};

/** No matches says so. */
export const NoMatches: Story = {
  render: (args) => <Controlled {...args} aria-label="Assignee" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Assignee' }));
    await userEvent.type(canvas.getByRole('combobox', { name: 'Search…' }), 'zzz');
    await expect(canvas.queryByRole('option')).toBeNull();
    await expect(canvas.getByText('No matches')).toBeVisible();
  },
};

/** Named by a `Field` label: the trigger is a button, so `htmlFor` reaches it. */
export const InAField: Story = {
  render: (args) => (
    <Field label="Assignee" helper="Who is doing the work." htmlFor="assignee">
      <Controlled {...args} id="assignee" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: /Assignee/ })).toBeVisible();
  },
};

export const Invalid: Story = {
  args: { invalid: true },
  render: (args) => <Controlled {...args} aria-label="Assignee" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Assignee' })).toHaveAttribute('aria-invalid', 'true');
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'amy' },
  render: (args) => <Controlled {...args} aria-label="Assignee" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Assignee' })).toBeDisabled();
  },
};

/** A click away closes the panel. */
export const ClosesOnBlur: Story = {
  render: (args) => (
    <div>
      <Controlled {...args} aria-label="Assignee" />
      <button type="button">Elsewhere</button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Assignee' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Elsewhere' }));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  },
};

/** Light and dark: the avatars, the search rule and the selected row hold in both. */
export const LightAndDark: Story = {
  args: { value: 'amy' },
  decorators: [],
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="h-72 w-60 p-4">
        <Controlled {...args} aria-label="Assignee (light)" />
      </div>
      <div className="dark h-72 w-60 bg-surface-base p-4">
        <Controlled {...args} aria-label="Assignee (dark)" />
      </div>
    </div>
  ),
};
