import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  SearchSelect,
  type SearchSelectDisplay,
  type SearchSelectOption,
  type SearchSelectProps,
  type SearchSelectSingleProps,
} from './SearchSelect';
import { Field } from '../field';

const PEOPLE: SearchSelectOption[] = [
  { value: 'unassigned', label: 'Unassigned', unassigned: true },
  { value: 'adam', label: 'Adam' },
  { value: 'adrian', label: 'Adrian Cruz' },
  { value: 'amy', label: 'Amy Lee' },
  { value: 'carl', label: 'Carl Baker' },
  { value: 'liam', label: 'Liam Carter' },
  { value: 'maya', label: 'Maya Bennett' },
];

const TAGS: SearchSelectOption[] = [
  { value: 'bug', label: 'Bug', group: 'Global (Cross-Domain)' },
  { value: 'feature', label: 'New Feature', group: 'Global (Cross-Domain)' },
  { value: 'improvement', label: 'Improvement', group: 'Global (Cross-Domain)' },
  { value: 'development', label: 'Development', group: 'Domain-Specific (In-Domain)' },
  { value: 'vcp', label: 'VCP & Besa', group: 'Domain-Specific (In-Domain)' },
  { value: 'ops', label: 'Operations', group: 'Domain-Specific (In-Domain)' },
];

const TYPES: SearchSelectOption[] = [
  { value: 'bug', label: 'Bug', tone: 'danger' },
  { value: 'feature', label: 'New Feature', tone: 'success' },
  { value: 'improvement', label: 'Improvement', tone: 'info' },
  { value: 'chore', label: 'Chore', tone: 'neutral' },
];

const CHANNELS: SearchSelectOption[] = [
  { value: 'chat', label: 'Chat', icon: 'chat-dots' },
  { value: 'announce', label: 'Announcement', icon: 'megaphone' },
  { value: 'notify', label: 'Notification', icon: 'bell' },
];

const STATUSES = ['Pending', 'Accepted', 'In progress', 'Design Review', 'Review', 'Rejected', 'Backlog'];

/* The real props are a single-or-multiple union, which Storybook's `Meta` cannot take
   as args (it reads the union as `never`). The stories use this flat shape. */
type StoryProps = Omit<
  SearchSelectSingleProps,
  'multiple' | 'value' | 'onChange' | 'display' | 'confirm' | 'applyLabel' | 'clearLabel'
> & {
  multiple?: boolean;
  value?: string | readonly string[];
  onChange?: (value: never) => void;
  display?: SearchSelectDisplay;
  confirm?: boolean;
};

const meta = {
  title: 'Components/Forms/SearchSelect',
  component: SearchSelect as unknown as React.ComponentType<StoryProps>,
  parameters: {
    docs: {
      description: {
        component:
          'The dropdown for picking from a list too long or too rich for the native `Select`: ' +
          'people, tags, statuses. One field that shows the value, one panel with an optional ' +
          'search box over the rows. One pick or several (`multiple`); groups, avatars, tags in ' +
          'the field and an Apply footer are options. Search lives in the panel, never in the ' +
          'field — see the Decisions in the docs before changing that.',
      },
    },
  },
  args: { options: PEOPLE, placeholder: 'Select user', searchPlaceholder: 'Search by name', onChange: fn() },
  argTypes: {
    multiple: { control: 'boolean' },
    searchable: { control: 'boolean' },
    rows: { control: 'inline-radio', options: ['text', 'avatar', 'icon', 'tag'] },
    display: { control: 'inline-radio', options: ['summary', 'tags'] },
    confirm: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
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
    <SearchSelect
      {...({
        ...props,
        value,
        onChange: (next: string | string[]) => {
          setValue(next);
          (props.onChange as ((v: string | string[]) => void) | undefined)?.(next);
        },
      } as unknown as SearchSelectProps)}
    />
  );
}

/**
 * `rows` says what a row looks like, from four presets: `text` (the default, plain labels),
 * `avatar` (people, above), `icon` (a glyph and text) and `tag` (each row drawn as a `Tag`).
 * Presets only change the row's content; the checkbox or check, the states and the keyboard
 * are the same in all of them.
 */
export const IconRows: Story = {
  args: { options: CHANNELS, rows: 'icon', searchable: false, placeholder: 'Select channel' },
  render: (args) => <Controlled {...args} aria-label="Channel" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Channel' }));
    /* The icon is decoration: the row is still named by its label alone. */
    await expect(canvas.getByRole('option', { name: 'Announcement' })).toBeVisible();
    await expect(canvas.getAllByRole('option')).toHaveLength(3);
  },
};

/** `rows="tag"`: each row is a `Tag` in its option's `tone`, and the tags in the field wear it too. */
export const TagRows: Story = {
  args: { options: TYPES, rows: 'tag', multiple: true, display: 'tags', searchable: false, placeholder: 'Select types' },
  render: (args) => <Controlled {...args} aria-label="Types" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Types' }));
    await userEvent.click(canvas.getByRole('option', { name: 'Bug' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['bug']);
    await expect(canvas.getByRole('button', { name: 'Remove Bug' })).toBeVisible();
  },
};

/**
 * `renderOption` draws a row's content when no preset fits — here a name with a second line.
 * The checkbox, the states, the keyboard and the ARIA stay the component's, so keep it to
 * content: no buttons or links in there.
 */
export const CustomRows: Story = {
  args: {
    options: [
      { value: 'eve', label: 'Eve Kestrel' },
      { value: 'marvin', label: 'Marvin Ode' },
    ],
    searchable: false,
    placeholder: 'Select owner',
    renderOption: (option: SearchSelectOption, state: { selected: boolean }) => (
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate">{option.label}</span>
        <span className="truncate text-caption-md-regular text-text-tertiary">
          {state.selected ? 'Current owner' : `${option.label.split(' ')[0]?.toLowerCase()}@example.com`}
        </span>
      </span>
    ),
  },
  render: (args) => <Controlled {...args} aria-label="Owner" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Owner' }));
    await userEvent.click(canvas.getByRole('option', { name: /Eve Kestrel/ }));
    await expect(canvas.getByRole('combobox', { name: 'Owner' })).toHaveTextContent('Eve Kestrel');
  },
};

/** One person: open, search, pick. The field then says who, and the picked row carries a check. */
export const Single: Story = {
  args: { rows: 'avatar' },
  render: (args) => <Controlled {...args} aria-label="Assignee" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Assignee' });
    await expect(trigger).toHaveTextContent('Select user');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    /* With search, focus moves into the search box, ready to type. */
    const search = canvas.getByRole('combobox', { name: 'Search by name' });
    await expect(search).toHaveFocus();
    await expect(canvas.getAllByRole('option')).toHaveLength(7);

    /* `fireEvent.change`, not typed keys: it reaches React's onChange the same way in every runner. */
    fireEvent.change(search, { target: { value: 'ca' } });
    /* The list re-renders a beat after the keystrokes. */
    await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(2));
    await expect(canvas.getByRole('option', { name: 'Carl Baker' })).toBeVisible();

    await userEvent.click(canvas.getByRole('option', { name: 'Liam Carter' }));
    await expect(args.onChange).toHaveBeenLastCalledWith('liam');
    await expect(trigger).toHaveTextContent('Liam Carter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
  },
};

/** The search box is the combobox: arrows move, Enter picks, Escape closes and returns focus. */
export const Keyboard: Story = {
  args: { rows: 'avatar' },
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
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveTextContent('Adrian Cruz');
  },
};

/** The Unassigned row is a person glyph, not an avatar, and is a choice like any other. */
export const Unassigned: Story = {
  args: { rows: 'avatar', value: 'unassigned' },
  render: (args) => <Controlled {...args} aria-label="Assignee" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Assignee' })).toHaveTextContent('Unassigned');
    await userEvent.click(canvas.getByRole('button', { name: 'Assignee' }));
    await expect(canvas.getByRole('option', { name: 'Unassigned' })).toHaveAttribute('aria-selected', 'true');
  },
};

/**
 * `multiple`: a pick toggles and the panel stays open; each row leads with a checkbox. The field
 * says who, or how many.
 */
export const Multiple: Story = {
  args: { multiple: true, rows: 'avatar' },
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

/**
 * Figma's Tags filter: grouped rows, search in the panel, and the picks as removable tags in the
 * field.
 */
export const Tags: Story = {
  args: { options: TAGS, multiple: true, display: 'tags', placeholder: 'Select tags', searchPlaceholder: 'Search tags' },
  render: (args) => <Controlled {...args} aria-label="Tags" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Tags' }));
    await expect(canvas.getByRole('group', { name: 'Global (Cross-Domain)' })).toBeVisible();
    await expect(canvas.getByRole('group', { name: 'Domain-Specific (In-Domain)' })).toBeVisible();

    /* Search narrows across the groups and drops headings with no rows left. */
    await expect(canvas.getByRole('combobox', { name: 'Search tags' })).toHaveFocus();
    fireEvent.change(canvas.getByRole('combobox', { name: 'Search tags' }), { target: { value: 'dev' } });
    await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(1));
    await expect(canvas.queryByRole('group', { name: 'Global (Cross-Domain)' })).toBeNull();
    await userEvent.click(canvas.getByRole('option', { name: 'Development' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['development']);

    /* The pick is a tag with its own ✕, beside the trigger. */
    await expect(canvas.getByRole('button', { name: 'Remove Development' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Development' }));
    await expect(args.onChange).toHaveBeenLastCalledWith([]);
    await expect(canvas.queryByRole('button', { name: 'Remove Development' })).toBeNull();
  },
};

/**
 * Figma's status menu: no search for seven rows, a summary in the field, and ticks that are a
 * draft until Apply. Clear all empties the draft; Escape throws it away.
 */
export const StatusWithApply: Story = {
  args: { options: STATUSES, multiple: true, searchable: false, confirm: true, placeholder: 'Select status' },
  render: (args) => <Controlled {...args} aria-label="Status" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    /* No search box, so the trigger is the combobox and keeps focus. */
    const field = canvas.getByRole('combobox', { name: 'Status' });
    await expect(canvas.queryByRole('combobox', { name: 'Search' })).toBeNull();

    await userEvent.click(field);
    await userEvent.click(canvas.getByRole('option', { name: 'Accepted' }));
    await userEvent.click(canvas.getByRole('option', { name: 'Review' }));
    /* Still a draft: nothing reported, field unchanged. */
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(field).toHaveTextContent('Select status');

    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['Accepted', 'Review']);
    await expect(field).toHaveTextContent('2 selected');
    await expect(field).toHaveAttribute('aria-expanded', 'false');

    /* Reopen, tick one more, then Escape: the draft is discarded. */
    await userEvent.click(field);
    await userEvent.click(canvas.getByRole('option', { name: 'Backlog' }));
    await userEvent.keyboard('{Escape}');
    await expect(field).toHaveTextContent('2 selected');
    await userEvent.click(field);
    await expect(canvas.getByRole('option', { name: 'Backlog' })).toHaveAttribute('aria-selected', 'false');

    /* Clear all empties the draft; Apply commits the empty list. */
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await expect(canvas.getByRole('option', { name: 'Accepted' })).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenLastCalledWith([]);
    await expect(field).toHaveTextContent('Select status');
  },
};

/** `searchable={false}`: a short single list, keyboard on the trigger itself. */
export const SingleWithoutSearch: Story = {
  args: { options: ['Low', 'Normal', 'High', 'Urgent'], searchable: false, placeholder: 'Select priority' },
  render: (args) => <Controlled {...args} aria-label="Priority" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Priority' });
    field.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('Normal');
    await expect(field).toHaveAttribute('aria-expanded', 'false');
    await expect(field).toHaveTextContent('Normal');
    await expect(field).toHaveFocus();
  },
};

/** No `group` on any option: a plain list, no headings. Group headings are optional. */
export const FlatList: Story = {
  args: { options: ['Design', 'Frontend', 'Backend', 'QA', 'Operations'], multiple: true, searchable: false },
  render: (args) => <Controlled {...args} aria-label="Teams" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Teams' }));
    await expect(canvas.queryByRole('group')).toBeNull();
    await expect(canvas.getAllByRole('option')).toHaveLength(5);
  },
};

/** No match, or no options at all: the panel says so, and an empty list is not exposed as a listbox. */
export const NoMatches: Story = {
  render: (args) => <Controlled {...args} aria-label="Assignee" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Assignee' }));
    await expect(canvas.getByRole('combobox', { name: 'Search by name' })).toHaveFocus();
    fireEvent.change(canvas.getByRole('combobox', { name: 'Search by name' }), { target: { value: 'zzz' } });
    await waitFor(() => expect(canvas.queryByRole('option')).toBeNull());
    await expect(canvas.getByText('No matches')).toBeVisible();
  },
};

export const NoOptions: Story = {
  args: { options: [], searchable: false, emptyText: 'No tags yet' },
  render: (args) => <Controlled {...args} aria-label="Tags" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Tags' }));
    await expect(canvas.getByText('No tags yet')).toBeVisible();
    await expect(canvas.queryByRole('option')).toBeNull();
  },
};

/** Named by a `Field` label: the trigger is a button, so `htmlFor` reaches it. */
export const InAField: Story = {
  args: { rows: 'avatar' },
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

/** Disabled: no opening, and the tags lose their ✕. */
export const Disabled: Story = {
  args: { disabled: true, multiple: true, display: 'tags', value: ['adam', 'amy'] },
  render: (args) => <Controlled {...args} aria-label="Watchers" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Watchers' })).toBeDisabled();
    await expect(canvas.queryByRole('button', { name: 'Remove Adam' })).toBeNull();
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

/** Light and dark: the search box, avatars, checkboxes and tags hold in both. */
export const LightAndDark: Story = {
  args: { multiple: true, rows: 'avatar', value: ['amy', 'liam'] },
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
