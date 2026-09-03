import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPill, AV_STATUSES } from './StatusPill';

const meta = {
  title: 'Components/Display/StatusPill',
  component: StatusPill,
  parameters: {
    docs: {
      description: {
        component:
          'An Added Value’s status as a pill — a component composing `Badge`, and the owner ' +
          'of VCP’s status vocabulary and its status → tone mapping (docs/badge.md promised ' +
          'it would live in exactly one place: this one). Not clickable by design: changing ' +
          'status is the options dropdown’s job.',
      },
    },
  },
  args: { status: 'In progress' },
  argTypes: {
    status: { control: 'select', options: AV_STATUSES },
    size: { control: 'radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The whole vocabulary, in lifecycle order. The mapping lives in ONE place. */
export const AllStatuses: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {AV_STATUSES.map((status) => (
        <StatusPill {...args} key={status} status={status} />
      ))}
    </div>
  ),
};

/** Badge's `sm` for dense tables — the AV table's cells. */
export const Small: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {AV_STATUSES.map((status) => (
        <StatusPill {...args} key={status} status={status} size="sm" />
      ))}
    </div>
  ),
};

/** In its habitat: a DataTable status column (the AV table pattern will own this). */
export const InATableCell: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col divide-y divide-stroke-subtle rounded-md border border-stroke-subtle bg-surface-elevated font-sans">
      {(['In progress', 'Ready for review', 'Blocked'] as const).map((status, i) => (
        <div key={status} className="flex h-14 items-center justify-between px-4">
          <span className="text-body-md text-text-secondary">AV-20{41 - i}</span>
          <StatusPill {...args} status={status} size="sm" />
        </div>
      ))}
    </div>
  ),
};

/** Badge's tokens, so dark is free — including the borrowed info blue for hand-off. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex max-w-80 flex-wrap gap-2 bg-surface-canvas p-8">
            {AV_STATUSES.map((status) => (
              <StatusPill {...args} key={status} status={status} />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
