import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  UserSelect,
  type UserSelectDisplay,
  type UserSelectOption,
  type UserSelectProps,
  type UserSelectSingleProps,
} from './UserSelect';
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

/* The real props are a single-or-multiple union, which Storybook's `Meta` cannot
   take as args (it reads the union as `never`). The stories use this flat shape. */
type StoryProps = Omit<UserSelectSingleProps, 'multiple' | 'value' | 'onChange' | 'display'> & {
  multiple?: boolean;
  value?: string | readonly string[];
  onChange?: (value: never) => void;
  display?: UserSelectDisplay;
};

const meta = {
  title: 'Components/Forms/UserSelect',
  component: UserSelect as unknown as React.ComponentType<StoryProps>,
  parameters: {
    docs: {
      description: {
        component:
          'People from a list you can search: an assignee, an initiator, a filter by user. One ' +
          'person by default, or several with `multiple`. The field shows who is picked; the panel ' +
          'opens with a boxed search field over avatar rows, the system\'s dropdown-with-search ' +
          'look (from Figma\'s Edit Viewers dropdown). For plain values ticked from a list use ' +
          '`MultiSelect`; for a choice that is not a person, `Select`.',
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
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page owns the value; the story stands in for it. */
function Controlled(props: StoryProps) {
  const [value, setValue] = React.useState<string | readonly string[]>(
    props.value ?? (props.multiple ? [] : ''),
  );
  return (
    <UserSelect
      {...({
        ...props,
        value,
        onChange: (next: string | string[]) => {
          setValue(next);
          (props.onChange as ((v: string | string[]) => void) | undefined)?.(next);
        },
      } as unknown as UserSelectProps)}
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
    const search = canvas.getByRole('combobox', { name: 'Search by name' });
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

/**
 * `multiple`: a pick toggles and the panel stays open. The field says who, or how many; picked
 * rows carry a check.
 */
export const Multiple: Story = {
  args: { multiple: true },
  render: (args) => <Controlled {...args} aria-label="Watchers" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Watchers' });
    await userEvent.click(trigger);
    await expect(canvas.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');

    await userEvent.click(canvas.getByRole('option', { name: 'Amy Lee' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['amy']);
    /* Still open, and the field names the one pick. */
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveTextContent('Amy Lee');
    await expect(canvas.getByRole('option', { name: 'Amy Lee' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(canvas.getByRole('option', { name: 'Liam Carter' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['amy', 'liam']);
    await expect(trigger).toHaveTextContent('2 selected');

    /* A second click takes a pick back out. */
    await userEvent.click(canvas.getByRole('option', { name: 'Amy Lee' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['liam']);
    await expect(trigger).toHaveTextContent('Liam Carter');
  },
};

/** `display="tags"`: a removable tag per person in the field, as `MultiSelect`'s. */
export const MultipleAsTags: Story = {
  args: { multiple: true, display: 'tags', value: ['adrian', 'amy'] },
  render: (args) => <Controlled {...args} aria-label="Watchers" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Remove Adrian Cruz' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Adrian Cruz' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['amy']);
    await expect(canvas.queryByRole('button', { name: 'Remove Adrian Cruz' })).toBeNull();
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
    const search = canvas.getByRole('combobox', { name: 'Search by name' });
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
    await userEvent.type(canvas.getByRole('combobox', { name: 'Search by name' }), 'zzz');
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
  args: { multiple: true, value: ['amy', 'liam'] },
  decorators: [],
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="h-96 w-60 p-4">
        <Controlled {...args} aria-label="Watchers (light)" />
      </div>
      <div className="dark h-96 w-60 bg-surface-base p-4">
        <Controlled {...args} aria-label="Watchers (dark)" />
      </div>
    </div>
  ),
};
