import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline, type TimelineItem } from './Timeline';

const HISTORY: TimelineItem[] = [
  {
    id: '1',
    title: 'Proposal created',
    timestamp: '12 Aug, 09:14',
    actor: 'Eve Kestrel',
    tone: 'brand',
    icon: 'plus-circle',
  },
  {
    id: '2',
    title: 'Moved to review',
    timestamp: '13 Aug, 16:02',
    actor: 'Marvin Ode',
    tone: 'info',
    icon: 'arrows-split',
    detail: 'Technical review requested for the Development domain.',
  },
  {
    id: '3',
    title: 'Comment added',
    timestamp: '14 Aug, 10:31',
    actor: 'Ali Reza',
    tone: 'neutral',
    icon: 'chat-dots',
    detail: '"Can the pallet consolidation start before Q4?"',
  },
  {
    id: '4',
    title: 'Estimate accepted',
    timestamp: '15 Aug, 08:47',
    actor: 'Ali Reza',
    tone: 'success',
    icon: 'check-circle',
  },
];

const meta = {
  title: 'Display/Timeline',
  component: Timeline,
  parameters: {
    docs: {
      description: {
        component:
          'A vertical run of events on a real `<ol>` — the order is the meaning. Tones are ' +
          'generic (the export took VCP lifecycle names; that mapping belongs to a pattern, ' +
          'as with Badge), and colour is reinforcement: the icon and the words carry the event.',
      },
    },
  },
  args: { items: HISTORY },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full anatomy: node, title, timestamp, actor, detail. */
export const Default: Story = {
  render: (args) => (
    <div className="w-112">
      <Timeline {...args} />
    </div>
  ),
};

/** All six tones. The glyph, not the hue, is what distinguishes events. */
export const Tones: Story = {
  args: {
    items: (['neutral', 'brand', 'info', 'success', 'warning', 'danger'] as const).map(
      (tone, i) => ({
        id: String(i),
        title: tone,
        timestamp: 'today',
        tone,
        icon: tone === 'danger' ? 'x-circle' : tone === 'warning' ? 'warning' : 'circle',
      }),
    ),
  },
  render: (args) => (
    <div className="w-96">
      <Timeline {...args} />
    </div>
  ),
};

/** Titles and timestamps alone — a compact audit trail. */
export const Compact: Story = {
  args: {
    items: HISTORY.map(({ actor, detail, ...rest }) => rest),
  },
  render: (args) => (
    <div className="w-96">
      <Timeline {...args} />
    </div>
  ),
};

/** One event is still a list — of one. */
export const SingleEvent: Story = {
  args: { items: HISTORY.slice(0, 1) },
};

/** Rings, glyphs, connector and text are all tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <Timeline {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
};
