import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmojiReactionPicker, type EmojiReaction } from './EmojiReactionPicker';

const meta = {
  title: 'Display/EmojiReactionPicker',
  component: EmojiReactionPicker,
  parameters: {
    docs: {
      description: {
        component:
          'The reaction row under a comment: toggleable pills (`aria-pressed` says whether ' +
          '*you* reacted) and a "+" opening the system `Popover` with the palette. State ' +
          'lives with the caller — this renders and reports.',
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

/** Nothing yet — just the way in. */
export const NoReactions: Story = {
  args: { onSelect: () => {} },
};

/** A caller-supplied palette replaces the neutral eight. */
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
