import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { EmojiReactionPicker, type EmojiReaction } from './EmojiReactionPicker';

const meta = {
  title: 'Components/Display/EmojiReactionPicker',
  component: EmojiReactionPicker,
  parameters: {
    docs: {
      description: {
        component:
          'The reaction row under a comment: a thumbs-up quick-react, an add-reaction button ' +
          'opening the system `Popover` with the palette, then toggleable pills (`aria-pressed` ' +
          'says whether *you* reacted). State lives with the caller — this renders and reports.',
      },
    },
  },
  args: {},
} satisfies Meta<typeof EmojiReactionPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live: toggle pills, add reactions from the palette. */
export const Default: Story = {
  render: (args) => {
    const [reactions, setReactions] = React.useState<EmojiReaction[]>([
      { emoji: '👍', count: 3, mine: true },
      { emoji: '🎉', count: 1 },
    ]);
    const toggle = (emoji: string) =>
      setReactions((rs) =>
        rs
          .map((r) =>
            r.emoji === emoji
              ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) }
              : r,
          )
          .filter((r) => r.count > 0),
      );
    const select = (emoji: string) =>
      setReactions((rs) =>
        rs.some((r) => r.emoji === emoji)
          ? rs.map((r) =>
              r.emoji === emoji && !r.mine ? { ...r, mine: true, count: r.count + 1 } : r,
            )
          : [...rs, { emoji, count: 1, mine: true }],
      );
    return <EmojiReactionPicker {...args} reactions={reactions} onToggle={toggle} onSelect={select} />;
  },
};

/**
 * The design's Hover Tooltip state: pass `people` and the pill names who
 * reacted, on the system `Tooltip` — which opens on keyboard focus too, so
 * the names are not pointer-only. Hover or Tab to a pill to see it.
 */
export const WithReactorNames: Story = {
  args: {
    reactions: [
      { emoji: '👍', count: 3, mine: true, people: ['You', 'Marvin Ode', 'Ali Reza'] },
      { emoji: '🎉', count: 1, people: ['Nora Lindqvist'] },
    ],
    onToggle: () => {},
    onSelect: () => {},
  },
  /* Room above: `Tooltip` sits on top and deliberately does not flip. */
  render: (args) => (
    <div className="pt-12">
      <EmojiReactionPicker {...args} />
    </div>
  ),
};

/**
 * The tooltip reads "<strong>Names</strong> reacted with :emojiname:". "You"
 * is just a name in `people`; long lists collapse to "A, B and N others".
 */
export const TooltipForms: Story = {
  args: {
    reactions: [
      { emoji: '👍', count: 1, mine: true, people: ['You'] },
      { emoji: '🎉', count: 2, people: ['Nora Lindqvist', 'Marvin Ode'] },
      { emoji: '🔥', count: 5, people: ['Ali Reza', 'Nora Lindqvist', 'Marvin Ode', 'Eve', 'Sam'] },
    ],
    onToggle: () => {},
    onSelect: () => {},
  },
  render: (args) => (
    <div className="pt-12">
      <EmojiReactionPicker {...args} />
    </div>
  ),
};

/**
 * The palette, open: three named categories, 36px cells with no gap between
 * them, 20px emoji. Opened by a play function so it is visible to review and
 * to Chromatic. ❤️ and ⚠️ are asserted with their U+FE0F variation selector.
 */
export const PaletteOpen: Story = {
  args: { onSelect: () => {} },
  render: (args) => (
    <div className="h-96">
      <EmojiReactionPicker {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add reaction' }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText('Hand Gestures')).toBeInTheDocument();
    await expect(body.getByText('Smileys & People')).toBeInTheDocument();
    await expect(body.getByText('Symbols')).toBeInTheDocument();
    await expect(body.getByRole('button', { name: 'React with \u2764\uFE0F' })).toBeInTheDocument();
    await expect(body.getByRole('button', { name: 'React with \u26A0\uFE0F' })).toBeInTheDocument();
  },
};

/**
 * **Flow:** the "Add reaction" tooltip belongs to the button and only the button.
 * Moving from the button onto the open palette used to bring it back, because the
 * palette sat inside the tooltip's hover area.
 */
export const TooltipStaysOnTheButton: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  args: { onSelect: () => {} },
  render: (args) => (
    <div className="h-96 p-16">
      <EmojiReactionPicker {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Add reaction' });
    const bubble = () => canvas.getByText('Add reaction', { selector: '[role="tooltip"]' });
    const isOpen = () => bubble().parentElement?.classList.contains('opacity-100');

    /* On the button it opens, after the hover delay. */
    await userEvent.hover(trigger);
    await waitFor(() => expect(isOpen()).toBe(true), { timeout: 1500 });

    /* Open the palette, then move off the button and onto a reaction in it. */
    await userEvent.click(trigger);
    await body.findByText('Hand Gestures');
    await userEvent.unhover(trigger);
    await waitFor(() => expect(isOpen()).toBe(false));
    await userEvent.hover(body.getByRole('button', { name: 'React with \u{1F44E}' }));

    /* Long enough for the hover delay to have fired, had it been going to. */
    await new Promise((resolve) => setTimeout(resolve, 600));
    await expect(isOpen()).toBe(false);
  },
};

/** Nothing yet — just the way in. */
export const NoReactions: Story = {
  args: { onSelect: () => {} },
};

/** A caller-supplied flat `emoji` list replaces the categorised palette. */
export const CustomPalette: Story = {
  args: {
    emoji: ['✅', '❌', '❓', '⏳'],
    reactions: [{ emoji: '✅', count: 2 }],
    onSelect: () => {},
    onToggle: () => {},
  },
};

/** Pills and palette are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <EmojiReactionPicker
              {...args}
              reactions={[
                { emoji: '👍', count: 3, mine: true },
                { emoji: '🎉', count: 1 },
              ]}
              onToggle={() => {}}
              onSelect={() => {}}
            />
          </div>
        </div>
      ))}
    </div>
  ),
};
