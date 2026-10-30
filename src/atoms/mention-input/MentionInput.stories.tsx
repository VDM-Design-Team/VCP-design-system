import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Field } from '../../components/field';
import { MentionInput, mentionedIds, plainText, type MentionSegment } from './MentionInput';

const MEMBERS = [
  { id: '182', name: 'Anna Berg' },
  { id: '204', name: 'Jane Doe' },
  { id: '231', name: 'John Smith' },
  { id: '240', name: 'Jana Novak' },
];

const meta = {
  title: 'Atoms/MentionInput',
  component: MentionInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A text field where typing `@` opens a list of members, more letters filter it, and choosing ' +
          'one turns the text into a tag inside the field, as in comments. Plain text and tags only; ' +
          'a paste is always plain text. The value is segments (text, or a mention with its `id` and ' +
          '`label`): `mentionedIds(value)` is who to notify. The list is a listbox popup on a textbox: focus ' +
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

/* The field is `contenteditable="plaintext-only"`, which user-event does not recognise as editable,
   so its `type` and Backspace would do nothing. These put the characters in the way the browser's
   own typing does: through `execCommand`, which fires the same `beforeinput` and `input`. */
async function typeText(field: HTMLElement, text: string) {
  await userEvent.click(field);
  for (const char of text) {
    document.execCommand('insertText', false, char);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}
const deleteBack = () => document.execCommand('delete');

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
    await typeText(field, 'Hi @ja');
    /* "ja" matches Jane Doe and Jana Novak, not Anna or John. */
    const list = await screen.findByRole('listbox', { name: 'Members' });
    await expect(within(list).getAllByRole('option')).toHaveLength(2);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
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
    await typeText(field, '@jo');
    await screen.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
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
    await typeText(field, 'write to jane@jo');
    await expect(screen.queryByRole('listbox')).toBeNull();
  },
};

/** Backspace removes a whole tag at once. */
export const BackspaceRemovesATag: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Reply' });
    await userEvent.click(field);
    await typeText(field, '@anna');
    await userEvent.keyboard('{Enter}');
    await expect(field.querySelector('[data-type="mention"]')).not.toBeNull();
    /* The caret is after the tag and its space: one Backspace for the space, one for the tag. */
    deleteBack();
    deleteBack();
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

/** The box of the `@` in a field: where the list is meant to sit. */
const boxOfAt = (field: HTMLElement) => {
  const walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const index = (node as Text).data.indexOf('@');
    if (index !== -1) {
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      return range.getBoundingClientRect();
    }
  }
  throw new Error('no @ in the field');
};

/**
 * **Flow:** the list sits just under the `@` it belongs to, and above it when the
 * screen cuts the bottom off. (It used to hang under the whole field.)
 */
export const ListFollowsTheAt: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  render: (args) => (
    <div className="flex h-dvh flex-col justify-between">
      <MentionInput {...args} aria-label="Top" />
      <MentionInput {...args} aria-label="Bottom" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    /* Room below: the list is just under the `@`, level with it. */
    const top = canvas.getByRole('textbox', { name: 'Top' });
    await typeText(top, 'Hi @ja');
    const list = await screen.findByRole('listbox');
    const at = boxOfAt(top);
    const below = list.getBoundingClientRect();
    await expect(Math.abs(below.top - at.bottom)).toBeLessThanOrEqual(8);
    await expect(Math.abs(below.left - at.left)).toBeLessThanOrEqual(1);

    /* No room below (the field is at the foot of the screen): it opens above the `@`. */
    const bottom = canvas.getByRole('textbox', { name: 'Bottom' });
    await typeText(bottom, '@ja');
    const above = (await screen.findByRole('listbox')).getBoundingClientRect();
    await expect(above.bottom).toBeLessThanOrEqual(boxOfAt(bottom).top);
  },
};

const undo = (field: HTMLElement) =>
  field.dispatchEvent(new InputEvent('beforeinput', { inputType: 'historyUndo', bubbles: true, cancelable: true }));
const redo = (field: HTMLElement) =>
  field.dispatchEvent(new InputEvent('beforeinput', { inputType: 'historyRedo', bubbles: true, cancelable: true }));

/**
 * Undo and Redo are the field's own, because a tag is put in by hand and the browser's undo cannot
 * track that. Choosing a member is one step: Undo gives back "Hi @ja" (the typing before it intact),
 * Redo the tag, and a further Undo the words alone.
 */
export const UndoAndRedo: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Reply' });
    const readout = canvas.getByTestId('readout');
    await userEvent.click(field);
    await typeText(field, 'Hi @jane');
    await userEvent.keyboard('{Enter}');
    await expect(field.querySelector('[data-type="mention"]')).not.toBeNull();
    await typeText(field, 'thanks');
    await expect(readout).toHaveTextContent('Hi @Jane Doe thanks');
    undo(field);
    await waitFor(() => expect(readout).toHaveTextContent(/^Hi @Jane Doe · ids: 204/));
    undo(field);
    await waitFor(() => expect(readout).toHaveTextContent('Hi @jane · ids: none'));
    await expect(field.querySelector('[data-type="mention"]')).toBeNull();
    redo(field);
    await waitFor(() => expect(field.querySelector('[data-type="mention"]')).not.toBeNull());
    redo(field);
    await waitFor(() => expect(readout).toHaveTextContent('Hi @Jane Doe thanks'));
    /* Nothing further to redo: unchanged. */
    redo(field);
    await expect(readout).toHaveTextContent('Hi @Jane Doe thanks');
  },
};

/** The field takes plain text only: no formatting can get in that the value would not carry. */
export const PlainTextOnly: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Reply' });
    await expect(field).toHaveAttribute('contenteditable', 'plaintext-only');
  },
};

/** An `@` followed by a space is ordinary text: no list, and Enter is a line break. */
export const AtThenSpaceIsText: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Reply' });
    await userEvent.click(field);
    await typeText(field, 'meet @');
    await screen.findByRole('listbox');
    await typeText(field, ' ');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await userEvent.keyboard('{Enter}');
    await expect(field.querySelector('[data-type="mention"]')).toBeNull();
    await expect(canvas.getByTestId('readout')).toHaveTextContent('meet @');
  },
};

/** While an IME is composing, Enter belongs to it: it does not choose a member. */
export const ComposingEnterIsNotAChoice: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Reply' });
    await userEvent.click(field);
    await typeText(field, '@jo');
    await screen.findByRole('listbox');
    field.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true }),
    );
    await expect(screen.queryByRole('listbox')).not.toBeNull();
    await expect(field.querySelector('[data-type="mention"]')).toBeNull();
  },
};

const MANY = Array.from({ length: 8 }, (_, i) => ({ id: String(i), name: `Member ${i + 1}` }));

/**
 * The list is drawn in a portal, so a scrolling parent cannot cut it off, and the highlighted
 * option scrolls into view as the arrows move past the list's edge.
 */
export const ListInAScrollingParent: Story = {
  args: { members: MANY },
  /* axe asks a scrolling region to be focusable. This list is reached through the field's
     `aria-activedescendant` (focus never leaves the field), which is the pattern for a list beside a field; making
     the list tabbable would break it. */
  parameters: {
    a11y: { config: { rules: [{ id: 'scrollable-region-focusable', enabled: false }] } },
  },
  decorators: [
    (Story) => (
      <div className="h-24 w-96 overflow-y-auto border border-stroke-default">
        <Story />
        <div className="h-96" />
      </div>
    ),
  ],
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Reply' });
    await userEvent.click(field);
    await typeText(field, '@member');
    const list = await screen.findByRole('listbox', { name: 'Members' });
    /* In the page, not inside the clipped parent. */
    await expect(canvasElement.contains(list)).toBe(false);
    await userEvent.keyboard('{ArrowUp}');
    const last = within(list).getAllByRole('option').at(-1)!;
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => {
      const box = list.getBoundingClientRect();
      const row = last.getBoundingClientRect();
      expect(row.top).toBeGreaterThanOrEqual(box.top);
      expect(row.bottom).toBeLessThanOrEqual(box.bottom);
    });
  },
};

/** In a `Field`: the label names the field (`aria-labelledby`), and clicking it focuses the field. */
export const InAField: Story = {
  args: { 'aria-label': undefined },
  render: (args) => (
    <Field label="Reply">
      <MentionInput {...args} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Reply' });
    await userEvent.click(canvas.getByText('Reply'));
    await expect(field).toHaveFocus();
  },
};
