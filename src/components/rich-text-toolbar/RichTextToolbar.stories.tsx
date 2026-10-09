import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  RichTextToolbar,
  DEFAULT_RICH_TEXT_COMMANDS,
  type RichTextCommand,
} from './RichTextToolbar';
import { useSelectionToolbar } from './useSelectionToolbar';

const meta = {
  title: 'Components/Forms/RichTextToolbar',
  component: RichTextToolbar,
  parameters: {
    docs: {
      description: {
        component:
          'The formatting toolbar that **floats over selected text**, as in any text editor: ' +
          'bold, italic, underline, strikethrough · numbered and bulleted lists · link, unlink, ' +
          'block quote, code block, undo, redo. A raised card (`surface.elevated`, `stroke.subtle`, ' +
          'menu shadow), 32 buttons, 16 glyphs. A real APG toolbar: one tab stop, Arrow keys walk ' +
          'the enabled buttons, Home/End jump, and `aria-pressed` only on the commands that have ' +
          'state. Pressing a button never costs the selection. It owns no editor state and does ' +
          'not position itself — the editor does. See the **Floating On Selection** story.',
      },
    },
  },
  args: {},
} satisfies Meta<typeof RichTextToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const STATEFUL: RichTextCommand[] = ['bold', 'italic', 'underline', 'strike', 'ol', 'ul', 'quote', 'code'];

type Active = Partial<Record<RichTextCommand, boolean>>;

/**
 * Live, with a real history: every toggle is a step you can **Undo** and then **Redo**.
 * Undo is disabled at the start of the history and Redo at its end — the toolbar owns
 * no editor state, so the editor says so: `disabledCommands={{ undo: !canUndo, redo:
 * !canRedo }}`. Try the Arrow keys too.
 */
export const Default: Story = {
  render: (args) => {
    const [history, setHistory] = React.useState<Active[]>([{ bold: true }]);
    const [at, setAt] = React.useState(0);
    const [last, setLast] = React.useState<RichTextCommand>();
    const active = history[at];
    const canUndo = at > 0;
    const canRedo = at < history.length - 1;
    return (
      <div className="flex flex-col items-start gap-3">
        <RichTextToolbar
          {...args}
          active={active}
          disabledCommands={{ undo: !canUndo, redo: !canRedo }}
          onCommand={(c) => {
            setLast(c);
            if (c === 'undo') return setAt((i) => Math.max(0, i - 1));
            if (c === 'redo') return setAt((i) => Math.min(history.length - 1, i + 1));
            if (STATEFUL.includes(c)) {
              /* A new change drops any redo tail, as every editor does. */
              setHistory((h) => [...h.slice(0, at + 1), { ...active, [c]: !active[c] }]);
              setAt((i) => i + 1);
            }
          }}
        />
        <span className="font-sans text-caption-md-regular text-text-tertiary">
          Last command: {last ?? '—'} · step {at + 1} of {history.length}
        </span>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const undo = canvas.getByRole('button', { name: 'Undo' });
    const redo = canvas.getByRole('button', { name: 'Redo' });
    /* Nothing to undo or redo yet. */
    await expect(undo).toBeDisabled();
    await expect(redo).toBeDisabled();
    /* A change makes Undo available; undoing it makes Redo available instead. */
    await userEvent.click(canvas.getByRole('button', { name: 'Italic' }));
    await expect(undo).toBeEnabled();
    await expect(redo).toBeDisabled();
    await userEvent.click(undo);
    await expect(undo).toBeDisabled();
    await expect(redo).toBeEnabled();
    /* Redoing it brings Undo back and spends Redo. */
    await userEvent.click(redo);
    await expect(undo).toBeEnabled();
    await expect(redo).toBeDisabled();
  },
};

/**
 * The comment editor: every command, plus **Insert image** (the legacy comment design
 * has one; the default set does not). `commands` is how an editor says what it can do.
 */
export const ForComments: Story = {
  args: {
    commands: [...DEFAULT_RICH_TEXT_COMMANDS, 'image'],
    disabledCommands: { unlink: true, undo: true, redo: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(within(canvas.getByRole('toolbar')).getAllByRole('button')).toHaveLength(13);
    const image = canvas.getByRole('button', { name: 'Insert image' });
    await expect(image).toBeInTheDocument();
    /* Image sits left of history: ...Code block, Insert image, Undo, Redo — undo and redo
       stay the rightmost pair. */
    const names = within(canvas.getByRole('toolbar'))
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'));
    await expect(names.slice(-4)).toEqual(['Code block', 'Insert image', 'Undo', 'Redo']);
  },
};

/**
 * An editor that can do less: ask for only what it supports. Order and grouping do not
 * move, a group with nothing left loses its divider, and the arrows walk only what is shown.
 */
export const PickedCommands: Story = {
  args: { commands: ['bold', 'italic', 'link'] },
  play: async ({ canvasElement }) => {
    const toolbar = within(canvasElement).getByRole('toolbar');
    await expect(within(toolbar).getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
      'Bold',
      'Italic',
      'Link',
    ]);
    /* Two groups survive (styles, then link), so exactly one divider. */
    await expect(within(toolbar).getAllByRole('separator')).toHaveLength(1);
  },
};

/**
 * What an editor does when text is selected: show the toolbar just above it, centred
 * on the selection, and put it away when the selection goes. The toolbar does not do
 * this itself — it has no idea where the text is. **Select some words below.**
 *
 * It also goes with the selection, however the selection goes: click anywhere else on the
 * page, press an arrow key, or have code clear it. (The hook listens to the document's
 * `selectionchange`, not just clicks inside the editor.) The test below does the last one,
 * then selects again so the toolbar is showing in the snapshot.
 */
export const FloatingOnSelection: Story = {
  parameters: { layout: 'padded' },
  render: (args) => {
    const { containerRef, open, position } = useSelectionToolbar();
    const [active, setActive] = React.useState<Partial<Record<RichTextCommand, boolean>>>({});
    const [last, setLast] = React.useState<RichTextCommand>();
    return (
      <div className="flex flex-col gap-4">
        <div ref={containerRef} className="relative ml-56 w-128 pt-14">
          <p className="font-sans text-body-sm-regular text-text-secondary">
            Two deliverables are missing evidence. They cannot move to Confirmed prod until a
            source is attached, and the review that was scheduled for Friday has moved to next
            week. Select any of these words to bring the toolbar up.
          </p>
          <p className="mt-3 font-sans text-caption-md-regular text-text-tertiary">
            Last command: {last ?? '—'}
          </p>
          {/* Always rendered, driven by `open`, so it fades out where it stood. */}
          <RichTextToolbar
            {...args}
            open={open}
            active={active}
            disabledCommands={{ unlink: true }}
            onCommand={(c) => {
              setLast(c);
              if (STATEFUL.includes(c)) setActive((a) => ({ ...a, [c]: !a[c] }));
            }}
            className="absolute z-10 -translate-x-1/2 -translate-y-full"
            style={position}
          />
        </div>
        <p className="font-sans text-caption-md-regular text-text-tertiary">
          Click here, outside the editor, to see it go away.
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paragraph = canvasElement.querySelector('p')!;
    const text = [...paragraph.childNodes].find((n) => n.nodeType === Node.TEXT_NODE)!;
    const at = text.textContent!.indexOf('missing evidence');
    const range = document.createRange();
    range.setStart(text, at);
    range.setEnd(text, at + 'missing evidence'.length);
    const sel = window.getSelection()!;
    /* Select and finish the selection — inside the wait, so a slow machine whose hook has
       not attached its listeners yet (they go on in an effect) just tries again, instead
       of losing a one-shot `mouseup` and timing out. */
    const select = () =>
      waitFor(
        () => {
          sel.removeAllRanges();
          sel.addRange(range);
          paragraph.parentElement!.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          expect(canvas.getByRole('toolbar')).toHaveAttribute('data-state', 'open');
        },
        { timeout: 4000, interval: 200 },
      );

    await select();
    /* The selection goes — no click in the editor at all — and the toolbar goes with it. */
    sel.removeAllRanges();
    await waitFor(() => expect(canvas.queryByRole('toolbar')).toBeNull(), { timeout: 3000 });
    /* Select again, so the toolbar is up for the snapshot. */
    await select();
  },
};

/** `disabledCommands` kills what the editor can't do — here no link to remove, and no history. */
export const DisabledCommands: Story = {
  args: { disabledCommands: { unlink: true, undo: true, redo: true }, active: { ul: true } },
};

/** The pressed state: brand tint and bold-brand glyph, plus `aria-pressed` — never colour alone. */
export const ActiveStates: Story = {
  args: { active: { bold: true, italic: true, ol: true, quote: true } },
};

/** One tab stop; arrows skip the disabled buttons; pressing keeps the selection. */
export const Keyboard: Story = {
  args: { disabledCommands: { unlink: true }, onCommand: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole('toolbar', { name: 'Text formatting' });
    const stops = within(toolbar).getAllByRole('button').filter((b) => b.tabIndex === 0);
    await expect(stops).toHaveLength(1);
    await expect(stops[0]).toHaveAccessibleName('Bold');

    stops[0].focus();
    /* End goes to the last enabled button; ArrowRight wraps to the first. */
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('button', { name: 'Redo' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveFocus();
    /* From Link, ArrowRight skips the disabled Unlink and lands on Block quote. */
    canvas.getByRole('button', { name: 'Link' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Block quote' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onCommand).toHaveBeenCalledWith('quote');
  },
};

/**
 * It dissolves in with a tiny drop, and fades out in place when `open` goes false —
 * leaving the DOM only afterwards. Flip the button. (`prefers-reduced-motion` gets none.)
 */
export const FadesInAndOut: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <div className="flex min-h-24 flex-col items-start gap-4">
        <button
          type="button"
          className="rounded-md border border-stroke-default px-3 py-1.5 font-sans text-label-sm-medium text-text-primary"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Hide' : 'Show'} the toolbar
        </button>
        <RichTextToolbar {...args} open={open} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole('toolbar');
    await expect(toolbar).toHaveAttribute('data-state', 'open');
    await userEvent.click(canvas.getByRole('button', { name: /Hide the toolbar/ }));
    /* Closing: it is still there, fading, and cannot be tabbed into. */
    await expect(toolbar).toHaveAttribute('data-state', 'closed');
    await expect(within(toolbar).getAllByRole('button').every((b) => b.tabIndex === -1)).toBe(true);
    /* ...and then it leaves the DOM. */
    await waitFor(() => expect(canvas.queryByRole('toolbar')).toBeNull(), { timeout: 3000 });
    await userEvent.click(canvas.getByRole('button', { name: /Show the toolbar/ }));
    await expect(await canvas.findByRole('toolbar')).toHaveAttribute('data-state', 'open');
  },
};

/** The design's measurements: 32 buttons, 16 glyphs, 6 padding, 4 gaps, 24-high dividers. */
export const Measurements: Story = {
  play: async ({ canvasElement }) => {
    const toolbar = within(canvasElement).getByRole('toolbar');
    const cs = getComputedStyle(toolbar.firstElementChild!);
    await expect(cs.paddingTop).toBe('6px');
    await expect(cs.columnGap).toBe('4px');
    await expect(cs.borderRadius).toBe('8px');
    const buttons = within(toolbar).getAllByRole('button');
    await expect(buttons).toHaveLength(12);
    for (const b of buttons) {
      const r = b.getBoundingClientRect();
      await expect([r.width, r.height]).toEqual([32, 32]);
      const icon = b.querySelector('svg')!.getBoundingClientRect();
      await expect([icon.width, icon.height]).toEqual([16, 16]);
    }
    const seps = within(toolbar).getAllByRole('separator');
    await expect(seps).toHaveLength(2);
    for (const sep of seps) {
      const r = sep.getBoundingClientRect();
      await expect([r.width, r.height]).toEqual([1, 24]);
    }
  },
};

/** Card, glyphs, tints and dividers are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <RichTextToolbar {...args} active={{ bold: true, ul: true }} disabledCommands={{ unlink: true }} />
          </div>
        </div>
      ))}
    </div>
  ),
};
