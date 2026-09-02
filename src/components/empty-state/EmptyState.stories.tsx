import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { Button } from '../button';
import { Icon } from '../icon';

const meta = {
  title: 'Display/EmptyState',
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component:
          'What a panel says when it has nothing to show. The copy is the component: say what ' +
          'is empty, why, and what to do about it. An empty state with an `action` is an ' +
          'invitation; without one it is a dead end — only omit the action when there ' +
          'genuinely is nothing the viewer can do.',
      },
    },
  },
  args: {
    title: 'No deliverables yet',
    description: 'When a supplier submits their first deliverable it will appear here.',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    headingLevel: { control: 'radio', options: [2, 3, 4] },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full anatomy: tile, title, explanation, way forward. */
export const Default: Story = {
  args: {
    icon: <Icon name="file" size="lg" />,
    action: <Button variant="secondary">Add a deliverable</Button>,
  },
};

/**
 * The no-results flavour: the emptiness is the viewer's own filters, so the
 * action undoes them. Note the copy names the cause.
 */
export const NoResults: Story = {
  args: {
    icon: <Icon name="magnifying-glass" size="lg" />,
    title: 'No suppliers match these filters',
    description: 'Try widening the date range or clearing the domain filter.',
    action: <Button variant="tertiary">Clear filters</Button>,
  },
};

/**
 * A true dead end — nothing the viewer can do from here. Rare on purpose: if
 * you find yourself omitting the action, first ask whether that is really true.
 */
export const NoAction: Story = {
  args: {
    icon: <Icon name="clock" size="lg" />,
    title: 'No activity in this period',
    description: 'Nothing was recorded between the selected dates.',
    action: undefined,
  },
};

/** Title only — the minimum that still reads as deliberate rather than broken. */
export const TitleOnly: Story = {
  args: { icon: undefined, description: undefined, action: undefined },
};

/** Centred inside the panel that has nothing to show. */
export const InAPanel: Story = {
  args: {
    icon: <Icon name="users" size="lg" />,
    title: 'Nobody is watching this claim',
    description: 'Watchers get a notification when the status changes.',
    action: <Button variant="secondary">Add watchers</Button>,
  },
  render: (args) => (
    <div className="w-160 rounded-md border border-stroke-subtle bg-surface-elevated">
      <EmptyState {...args} />
    </div>
  ),
};

/** Tile and text are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <EmptyState
              icon={<Icon name="file" size="lg" />}
              title="No deliverables yet"
              description="When a supplier submits their first deliverable it will appear here."
              action={<Button variant="secondary">Add a deliverable</Button>}
            />
          </div>
        </div>
      ))}
    </div>
  ),
};
