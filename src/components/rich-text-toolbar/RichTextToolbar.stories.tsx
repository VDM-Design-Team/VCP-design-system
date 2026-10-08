import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RichTextToolbar, type RichTextCommand } from './RichTextToolbar';

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

/** Live: toggles latch, link and history just fire. Try the Arrow keys. */
export const Default: Story = {
  render: (args) => {
    const [active, setActive] = React.useState<Partial<Record<RichTextCommand, boolean>>>({
      bold: true,
    });
    const [last, setLast] = React.useState<RichTextCommand>();
    return (
      <div className="flex flex-col items-start gap-3">
        <RichTextToolbar
          {...args}
          active={active}
          onCommand={(c) => {
            setLast(c);
            if (STATEFUL.includes(c)) setActive((a) => ({ ...a, [c]: !a[c] }));
          }}
        />
        <span className="font-sans text-caption-md-regular text-text-tertiary">
          Last command: {last ?? '—'}
        </span>
      </div>
    );
  },
};

/**
 * What an editor does when text is selected: show the toolbar just above it, centred
 * on the selection, and put it away when the selection goes. The toolbar does not do
 * this itself — it has no idea where the text is. **Select some words below.**
 */
export const FloatingOnSelection: Story = {
  parameters: { layout: 'padded' },
  render: (args) => {
    const box = React.useRef<HTMLDivElement>(null);
    const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);
    const [active, setActive] = React.useState<Partial<Record<RichTextCommand, boolean>>>({});
    const [last, setLast] = React.useState<RichTextCommand>();

    const place = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !box.current?.contains(sel.anchorNode)) return setPos(null);
      const r = sel.getRangeAt(0).getBoundingClientRect();
      const b = box.current.getBoundingClientRect();
      /* Centred over the selection, 8 above it. */
      setPos({ left: r.left + r.width / 2 - b.left, top: r.top - b.top - 8 });
    };

    return (
      <div
        ref={box}
        className="relative w-128 pt-14"
        onMouseUp={place}
        onKeyUp={place}
      >
        <p className="font-sans text-body-sm-regular text-text-secondary">
          Two deliverables are missing evidence. They cannot move to Confirmed prod until a
          source is attached, and the review that was scheduled for Friday has moved to next
          week. Select any of these words to bring the toolbar up.
        </p>
        <p className="mt-3 font-sans text-caption-md-regular text-text-tertiary">
          Last command: {last ?? '—'}
        </p>
        {pos && (
          <RichTextToolbar
            {...args}
            active={active}
            disabledCommands={{ unlink: true }}
            onCommand={(c) => {
              setLast(c);
              if (STATEFUL.includes(c)) setActive((a) => ({ ...a, [c]: !a[c] }));
            }}
            className="absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{ left: pos.left, top: pos.top }}
          />
        )}
      </div>
    );
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

/** The design's measurements: 32 buttons, 16 glyphs, 6 padding, 4 gaps, 24-high dividers. */
export const Measurements: Story = {
  play: async ({ canvasElement }) => {
    const toolbar = within(canvasElement).getByRole('toolbar');
    const cs = getComputedStyle(toolbar);
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
