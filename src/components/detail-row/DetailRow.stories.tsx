import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DetailRow } from './DetailRow';
import { Badge } from '../badge';
import { AvatarGroup } from '../avatar-group';
import { Input } from '../input';

const meta = {
  title: 'Display/DetailRow',
  component: DetailRow,
  parameters: {
    docs: {
      description: {
        component:
          'One label/value line in a details panel: a fixed 132 label column, the value taking ' +
          'the rest, an optional edit affordance. Stack rows and the labels align into a ' +
          'scannable column. `label` is a string on purpose — it also names the edit button.',
      },
    },
  },
  args: { label: 'Status' },
  argTypes: {
    label: { control: 'text' },
    icon: { control: 'text' },
    editing: { control: 'boolean' },
    align: { control: 'radio', options: ['center', 'top'] },
  },
} satisfies Meta<typeof DetailRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A stack is the natural unit — one row alone rarely earns the fixed column. */
export const Default: Story = {
  render: () => (
    <div className="flex w-160 flex-col gap-1">
      <DetailRow label="Reference">AV-2041</DetailRow>
      <DetailRow label="Supplier">Nordfjord Components</DetailRow>
      <DetailRow label="Created">12 Aug 2026</DetailRow>
      <DetailRow label="Capacity points">34 of 40</DetailRow>
    </div>
  ),
};

/** A glyph before the label, in `text.subtle` — quieter than the label itself. */
export const WithIcons: Story = {
  render: () => (
    <div className="flex w-160 flex-col gap-1">
      <DetailRow label="Owner" icon="user">
        Eve Kestrel
      </DetailRow>
      <DetailRow label="Start date" icon="calendar-blank">
        1 Oct 2026
      </DetailRow>
      <DetailRow label="Repository" icon="git-branch">
        vcp/claims-portal
      </DetailRow>
    </div>
  ),
};

/** Values are nodes — a Badge, an AvatarGroup, whatever the field holds. */
export const ComponentValues: Story = {
  render: () => (
    <div className="flex w-160 flex-col gap-1">
      <DetailRow label="State">
        <Badge tone="success">Active</Badge>
      </DetailRow>
      <DetailRow label="Watchers">
        <AvatarGroup
          size="sm"
          people={[{ name: 'Eve Kestrel' }, { name: 'Marvin Ode' }, { name: 'Ali Reza' }]}
        />
      </DetailRow>
    </div>
  ),
};

/**
 * `onEdit` renders the system's own `IconButton` (`tertiary`/`sm` — the
 * pointer-dense exemption). While `editing`, the pencil becomes a confirm tick
 * and the accessible name follows: "Edit Start date" → "Confirm Start date".
 */
export const Editable: Story = {
  render: () => {
    const [editing, setEditing] = React.useState(false);
    const [value, setValue] = React.useState('1 Oct 2026');
    return (
      <div className="flex w-160 flex-col gap-1">
        <DetailRow label="Start date" icon="calendar-blank" editing={editing} onEdit={() => setEditing((e) => !e)}>
          {editing ? (
            <Input
              aria-label="Start date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            value
          )}
        </DetailRow>
        <DetailRow label="Supplier">Nordfjord Components</DetailRow>
      </div>
    );
  },
};

/** `align="top"` keeps the label with the first line of a multi-line value. */
export const TopAligned: Story = {
  render: () => (
    <div className="flex w-160 flex-col gap-1">
      <DetailRow label="Description" align="top">
        Reduce inbound packaging volume by consolidating supplier shipments into weekly
        pallet deliveries, cutting handling time at the receiving dock.
      </DetailRow>
      <DetailRow label="Reference">AV-2041</DetailRow>
    </div>
  ),
};

/** Long label and long value: the label truncates, the value wraps or truncates per its own styling. */
export const Overflow: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-1">
      <DetailRow label="A label far too long for its column">Truncates with an ellipsis</DetailRow>
      <DetailRow label="Value">
        <span className="block truncate">
          A very long single-line value that the caller chose to truncate rather than wrap
        </span>
      </DetailRow>
    </div>
  ),
};

/** All text and glyphs are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-1 bg-surface-canvas p-8">
            <DetailRow label="Owner" icon="user">
              Eve Kestrel
            </DetailRow>
            <DetailRow label="State">
              <Badge tone="success">Active</Badge>
            </DetailRow>
            <DetailRow label="Start date" icon="calendar-blank" onEdit={() => {}}>
              1 Oct 2026
            </DetailRow>
          </div>
        </div>
      ))}
    </div>
  ),
};
