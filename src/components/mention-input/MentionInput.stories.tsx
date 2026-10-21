import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MentionInput, mentionedIds, plainText, type MentionSegment } from './MentionInput';

const MEMBERS = [
  { id: '182', name: 'Anna Berg' },
  { id: '204', name: 'Jane Doe' },
  { id: '231', name: 'John Smith' },
  { id: '240', name: 'Jana Novak' },
];

const meta = {
  title: 'Components/Forms/MentionInput',
  component: MentionInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A text field where typing `@` opens a list of members, more letters filter it, and choosing ' +
          'one turns the text into a tag inside the field, as in comments. Plain text and tags only; ' +
          'a paste is always plain text. The value is segments (text, or a mention with its `id` and ' +
          '`label`): `mentionedIds(value)` is who to notify. The list is a combobox listbox: focus ' +
          'stays in the field, ↑ ↓ move, Enter or Tab choose, Escape closes.',
      },
    },
  },
  args: { members: MEMBERS, 'aria-label': 'Reply' },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MentionInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(props: React.ComponentProps<typeof MentionInput>) {
  const [value, setValue] = React.useState<MentionSegment[]>([]);
  return (
    <div className="flex flex-col gap-3">
      <MentionInput
        {...props}
        value={value}
        onChange={(next) => {
          setValue(next);
          props.onChange?.(next);
        }}
      />
      <p className="text-caption-md-regular text-text-tertiary" data-testid="readout">
        {plainText(value) || 'empty'} · ids: {mentionedIds(value).join(', ') || 'none'}
      </p>
    </div>
  );
}

/** Empty: the placeholder from the design. */
export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Reply' });
    await expect(field).toHaveAttribute('data-placeholder', 'Type @ to mention and notify a member');
    await expect(field.childNodes).toHaveLength(0);
  },
};

/** Type `@`, filter, choose: the text becomes a tag that carries the member's id. */
export const MentionsAMember: Story = {
  args: { onChange: fn() },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Reply' });
    await userEvent.click(field);
    await userEvent.type(field, 'Hi @ja');
    /* "ja" matches Jane Doe and Jana Novak, not Anna or John. */
    const list = await canvas.findByRole('listbox', { name: 'Members' });
    await expect(within(list).getAllByRole('option')).toHaveLength(2);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByRole('listbox')).toBeNull());
    const tag = field.querySelector('[data-type="mention"]') as HTMLElement;
    await expect(tag).toHaveAttribute('data-id', '240');
    await expect(tag).toHaveAttribute('data-label', 'Jana Novak');
    await expect(tag).toHaveAttribute('contenteditable', 'false');
    await expect(canvas.getByTestId('readout')).toHaveTextContent('Hi @Jana Novak · ids: 240');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

/** Escape closes the list and keeps what was typed. */
export const EscapeClosesTheList: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Reply' });
    await userEvent.click(field);
    await userEvent.type(field, '@jo');
    await canvas.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('listbox')).toBeNull());
    await expect(canvas.getByTestId('readout')).toHaveTextContent('@jo');
  },
};

/** An `@` inside a word, like an email address, opens nothing. */
export const EmailIsNotAMention: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Reply' });
    await userEvent.click(field);
    await userEvent.type(field, 'write to jane@jo');
    await expect(canvas.queryByRole('listbox')).toBeNull();
  },
};

/** Backspace removes a whole tag at once. */
export const BackspaceRemovesATag: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Reply' });
    await userEvent.click(field);
    await userEvent.type(field, '@anna');
    await userEvent.keyboard('{Enter}');
    await expect(field.querySelector('[data-type="mention"]')).not.toBeNull();
    /* The caret is after the tag and its space: one Backspace for the space, one for the tag. */
    await userEvent.keyboard('{Backspace}{Backspace}');
    await waitFor(() => expect(field.querySelector('[data-type="mention"]')).toBeNull());
  },
};

/** Content in, as a saved comment comes back: the tags are tags again. */
export const WithContent: Story = {
  args: {
    defaultValue: [
      { type: 'text', text: 'Thanks ' },
      { type: 'mention', id: '204', label: 'Jane Doe' },
      { type: 'text', text: ', can you review?' },
    ],
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Reply' });
    const tag = field.querySelector('[data-type="mention"]') as HTMLElement;
    await expect(tag).toHaveTextContent('@Jane Doe');
    await expect(field).toHaveTextContent('Thanks @Jane Doe, can you review?');
  },
};

/** Disabled: not editable and not in the tab order. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Reply' });
    await expect(field).toHaveAttribute('contenteditable', 'false');
    await expect(field).toHaveAttribute('aria-disabled', 'true');
  },
};

/** Both themes. Every colour is a semantic token, so dark comes for free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [],
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-4 bg-surface-canvas p-8">
            <MentionInput {...args} />
            <MentionInput
              {...args}
              defaultValue={[
                { type: 'text', text: 'Thanks ' },
                { type: 'mention', id: '204', label: 'Jane Doe' },
              ]}
            />
          </div>
        </div>
      ))}
    </div>
  ),
};
