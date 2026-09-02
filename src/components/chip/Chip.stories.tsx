import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';
import { Avatar } from '../avatar';

const meta = {
  title: 'Display/Chip',
  component: Chip,
  parameters: {
    docs: {
      description: {
        component:
          'An interactive pill: a selected filter, a removable tag, a toggleable option. If it ' +
          'only classifies and is never clicked, use `Badge`; for VCP statuses, `StatusPill` ' +
          '(pattern, not yet built). The export nested a button inside a clickable span — ' +
          'rebuilt here as real buttons that are never nested, so every control is a tab stop.',
      },
    },
  },
  args: { label: 'Packaging' },
  argTypes: {
    label: { control: 'text' },
    count: { control: 'number' },
    selected: { control: 'boolean' },
    removeLabel: { control: 'text' },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No handlers — a plain pill. At this point consider whether it should be a Badge. */
export const Default: Story = {};

/** `onClick` makes the whole pill one button; `selected` paints the fill and sets `aria-pressed`. */
export const Toggleable: Story = {
  render: (args) => {
    const [on, setOn] = React.useState<Record<string, boolean>>({ Packaging: true });
    return (
      <div className="flex flex-wrap gap-2">
        {['Packaging', 'Logistics', 'Raw materials', 'Tooling'].map((f) => (
          <Chip
            key={f}
            {...args}
            label={f}
            selected={!!on[f]}
            onClick={() => setOn((s) => ({ ...s, [f]: !s[f] }))}
          />
        ))}
      </div>
    );
  },
};

/** The ✕ is its own button and its own tab stop, named `Remove ${label}`. */
export const Removable: Story = {
  render: (args) => {
    const [tags, setTags] = React.useState(['Q3 review', 'Supplier audit', 'Draft']);
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Chip key={t} {...args} label={t} onRemove={() => setTags((x) => x.filter((y) => y !== t))} />
        ))}
        {tags.length === 0 && (
          <span className="text-body-sm text-text-subtle">All removed — reload the story.</span>
        )}
      </div>
    );
  },
};

/** An `Avatar size="sm"` sits 2 off the curve so its circle follows the pill's. */
export const WithAvatar: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Chip {...args} label="Eve Kestrel" avatar={<Avatar size="sm" name="Eve Kestrel" />} />
      <Chip
        {...args}
        label="Marvin Ode"
        avatar={<Avatar size="sm" name="Marvin Ode" />}
        onRemove={() => {}}
      />
    </div>
  ),
};

/** The count is separated by a hairline and set in the numeric face. */
export const WithCount: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Chip {...args} label="Open claims" count={128} />
      <Chip {...args} label="Escalations" count={6} selected onClick={() => {}} />
    </div>
  ),
};

/**
 * Both handlers: the pill is a passive wrapper, the main region and the ✕ are
 * sibling buttons — two tab stops, no nesting. The main region's ring sits
 * inside the pill so it never collides with the remove button.
 */
export const ClickableAndRemovable: Story = {
  render: (args) => {
    const [selected, setSelected] = React.useState(true);
    return (
      <Chip
        {...args}
        label="Assigned to me"
        selected={selected}
        onClick={() => setSelected((s) => !s)}
        onRemove={() => {}}
      />
    );
  },
};

/** Brand-tinted fills come from `surface.brand.*`, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-wrap gap-2 bg-surface-canvas p-8">
            <Chip label="Packaging" />
            <Chip label="Selected" selected onClick={() => {}} />
            <Chip label="Removable" onRemove={() => {}} />
            <Chip label="Open claims" count={128} />
            <Chip label="Eve Kestrel" avatar={<Avatar size="sm" name="Eve Kestrel" />} />
          </div>
        </div>
      ))}
    </div>
  ),
};
