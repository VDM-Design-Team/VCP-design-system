import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MultiSelect, type MultiSelectOption } from './MultiSelect';
import { Field } from '../field';

const TAGS: MultiSelectOption[] = [
  { value: 'bug', label: 'Bug', group: 'Global (Cross-Domain)' },
  { value: 'feature', label: 'New Feature', group: 'Global (Cross-Domain)' },
  { value: 'improvement', label: 'Improvement', group: 'Global (Cross-Domain)' },
  { value: 'development', label: 'Development', group: 'Domain-Specific (In-Domain)' },
  { value: 'vcp', label: 'VCP & Besa', group: 'Domain-Specific (In-Domain)' },
  { value: 'ops', label: 'Operations', group: 'Domain-Specific (In-Domain)' },
];

const STATUSES = [
  'Pending',
  'Accepted',
  'In progress',
  'Design Review',
  'Review',
  'Rejected',
  'Backlog',
];

const meta = {
  title: 'Components/Forms/MultiSelect',
  component: MultiSelect,
  parameters: {
    docs: {
      description: {
        component:
          'Several choices from a fixed list. The field shows them as removable chips or a short ' +
          'summary; the panel is checkbox rows, optionally grouped. `confirm` drafts the ticks ' +
          'behind a Clear all / Apply footer. For one choice use `Select`; to find one by typing, ' +
          '`SearchSelect`.',
      },
    },
  },
  args: { options: TAGS, placeholder: 'Select tags', onChange: fn() },
  argTypes: {
    display: { control: 'inline-radio', options: ['chips', 'summary'] },
    confirm: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="h-96 w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controlled wrapper: the story owns the value, as a page does. */
function Controlled(props: React.ComponentProps<typeof MultiSelect>) {
  const [value, setValue] = React.useState<string[]>(props.value ? [...props.value] : []);
  return (
    <MultiSelect
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

/** Figma's Tags filter: grey chips in the field, grouped checkbox rows in the panel. */
export const Tags: Story = {
  render: (args) => <Controlled {...args} aria-label="Tags" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Tags' });
    await expect(field).toHaveAttribute('aria-expanded', 'false');

    /* Keyboard: ArrowDown opens, Enter ticks the active row, ArrowDown moves on. */
    field.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Enter}{ArrowDown}{ArrowDown}{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(['bug', 'improvement']);
    await expect(canvas.getByRole('option', { name: 'Bug' })).toHaveAttribute('aria-selected', 'true');

    /* Escape closes without moving focus. */
    await userEvent.keyboard('{Escape}');
    await expect(field).toHaveAttribute('aria-expanded', 'false');
    await expect(field).toHaveFocus();

    /* The picks are chips, each with its own ✕. */
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Bug' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['improvement']);
    await expect(canvas.queryByRole('button', { name: 'Remove Bug' })).toBeNull();
  },
};

/** Rows under a heading are a `group`, named by it. */
export const Grouped: Story = {
  render: (args) => <Controlled {...args} aria-label="Tags" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Tags' }));
    await expect(canvas.getByRole('group', { name: 'Global (Cross-Domain)' })).toBeVisible();
    await expect(canvas.getByRole('group', { name: 'Domain-Specific (In-Domain)' })).toBeVisible();
    await userEvent.click(canvas.getByRole('option', { name: 'Development' }));
    /* The list stays open for the next pick. */
    await expect(canvas.getByRole('combobox', { name: 'Tags' })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: 'Remove Development' })).toBeVisible();
  },
};

/**
 * Figma's status menu: ticks are a draft until Apply. Clear all empties the
 * draft, and Escape throws it away.
 */
export const StatusWithApply: Story = {
  args: { options: STATUSES, placeholder: 'Select status', display: 'summary', confirm: true },
  render: (args) => <Controlled {...args} aria-label="Status" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Status' });

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

/** One pick reads as its label; more read as a count. */
export const Summary: Story = {
  args: { options: STATUSES, placeholder: 'Select status', display: 'summary', value: ['Pending'] },
  render: (args) => <Controlled {...args} aria-label="Status" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Status' });
    await expect(field).toHaveTextContent('Pending');
    await userEvent.click(field);
    await userEvent.click(canvas.getByRole('option', { name: 'Backlog' }));
    await expect(field).toHaveTextContent('2 selected');
  },
};

/** A long pick list wraps onto more lines; the caret stays at the end of the first. */
export const ManyChips: Story = {
  args: {
    value: ['bug', 'feature', 'improvement', 'development', 'vcp', 'ops'],
  },
  render: (args) => <Controlled {...args} aria-label="Tags" />,
};

/** Named by a `Field` label: the combobox is a button, so `htmlFor` reaches it. */
export const InAField: Story = {
  render: (args) => (
    <Field label="Tags" helper="Filter by one or more tags." htmlFor="tags-field">
      <Controlled {...args} id="tags-field" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox', { name: /Tags/ })).toBeVisible();
  },
};

export const Invalid: Story = {
  args: { invalid: true },
  render: (args) => <Controlled {...args} aria-label="Tags" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox', { name: 'Tags' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};

/** Disabled: no opening, and the chips lose their ✕. */
export const Disabled: Story = {
  args: { disabled: true, value: ['bug', 'vcp'] },
  render: (args) => <Controlled {...args} aria-label="Tags" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: 'Tags' })).toBeDisabled();
    await expect(canvas.queryByRole('button', { name: 'Remove Bug' })).toBeNull();
  },
};

/** A click away closes the panel. */
export const ClosesOnBlur: Story = {
  render: (args) => (
    <div>
      <Controlled {...args} aria-label="Tags" />
      <button type="button">Elsewhere</button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Tags' });
    await userEvent.click(field);
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Elsewhere' }));
    await waitFor(() => expect(field).toHaveAttribute('aria-expanded', 'false'));
  },
};

/** Light and dark: the grey chips and checkbox rows hold in both. */
export const LightAndDark: Story = {
  args: { value: ['bug', 'vcp'] },
  decorators: [],
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="w-96 p-4">
        <Controlled {...args} aria-label="Tags (light)" />
      </div>
      <div className="dark w-96 bg-surface-base p-4">
        <Controlled {...args} aria-label="Tags (dark)" />
      </div>
    </div>
  ),
};
