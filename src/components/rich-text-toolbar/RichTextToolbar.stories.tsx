import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RichTextToolbar, type RichTextCommand } from './RichTextToolbar';
import { Textarea } from '../textarea';

const meta = {
  title: 'Forms/RichTextToolbar',
  component: RichTextToolbar,
  parameters: {
    docs: {
      description: {
        component:
          'The formatting strip above a rich editor. A real APG toolbar: one tab stop, Arrow ' +
          'keys walk the buttons (wrapping), Home/End jump. Only stateful commands carry ' +
          '`aria-pressed` — the export pressed undo. It owns no editor state: it reports ' +
          'commands and paints `active`.',
      },
    },
  },
  args: {},
} satisfies Meta<typeof RichTextToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live: toggles latch, inserts and history just fire. Try the Arrow keys. */
export const Default: Story = {
  render: (args) => {
    const [active, setActive] = React.useState<Partial<Record<RichTextCommand, boolean>>>({
      bold: true,
    });
    const [last, setLast] = React.useState<RichTextCommand>();
    return (
      <div className="flex w-128 flex-col gap-3">
        <RichTextToolbar
          {...args}
          active={active}
          onCommand={(c) => {
            setLast(c);
            if (['bold', 'italic', 'underline', 'strike', 'ul', 'ol'].includes(c))
              setActive((a) => ({ ...a, [c]: !a[c] }));
          }}
        />
        <span className="font-sans text-body-sm text-text-tertiary">
          Last command: {last ?? '—'}
        </span>
      </div>
    );
  },
};

/** `disabledCommands` kills what the editor can't do — history at its start. */
export const HistoryDisabled: Story = {
  args: { disabledCommands: { undo: true, redo: true } },
  render: (args) => (
    <div className="w-128">
      <RichTextToolbar {...args} />
    </div>
  ),
};

/** Above a Textarea — the composition CommentComposer (pattern) will make real. */
export const AboveAnEditor: Story = {
  render: (args) => (
    <div className="w-128 overflow-hidden rounded-md border border-stroke-field bg-surface-elevated focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused">
      <RichTextToolbar {...args} />
      <Textarea
        aria-label="Comment"
        placeholder="Write a comment…"
        className="border-0 focus-within:outline-0"
        fullWidth
      />
    </div>
  ),
};

/** Narrow: the strip wraps rather than clipping commands. */
export const Wrapped: Story = {
  render: (args) => (
    <div className="w-56">
      <RichTextToolbar {...args} />
    </div>
  ),
};

/** Buttons, tints and dividers are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <RichTextToolbar {...args} active={{ bold: true, ul: true }} />
          </div>
        </div>
      ))}
    </div>
  ),
};
