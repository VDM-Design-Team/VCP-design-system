import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Chip } from './Chip';
import { Avatar } from '../../atoms/avatar';

const meta = {
  title: 'Components/Display/Chip',
  component: Chip,
  parameters: {
    docs: {
      description: {
        component:
          'An interactive pill: a selected filter, a removable tag, a toggleable option. If it ' +
          'only classifies and is never clicked, use `Badge`; for VCP statuses, `StatusTag` ' +
          'The export nested a button inside a clickable span — ' +
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
          <span className="text-caption-md-regular text-text-subtle">All removed — reload the story.</span>
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

/**
 * **Initiator** — Figma's `_User_Chip_Initiator`: an avatar and a name. View is the tonal pill in brand
 * text; Edit is the outline (a brand border, no fill) with a remove button; Disabled is greyed and inert.
 * Same chip, three options: `size="md"`, `tone="brand"` and `variant="outline"`.
 */
export const Initiator: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Chip size="md" tone="brand" label="Marvin R" avatar={<Avatar name="Marvin R" tone="brand" size="sm" />} />
      <Chip
        size="md"
        tone="brand"
        variant="outline"
        label="Marvin R"
        avatar={<Avatar name="Marvin R" tone="brand" size="sm" />}
      />
      <Chip
        size="md"
        tone="brand"
        variant="outline"
        label="Marvin R"
        avatar={<Avatar name="Marvin R" tone="brand" size="sm" />}
        onRemove={() => {}}
      />
      <Chip size="md" disabled label="Marvin R" avatar={<Avatar name="Marvin R" size="sm" />} />
    </div>
  ),
};

/**
 * **Assignee** — Figma's `_User_Chip_Assignee`: an avatar, a name with an "Assignee" line under it, and a
 * count after a hairline. View is tonal; Edit is the outline, and its edit and remove buttons show on hover
 * or focus (`actions="hover"`, the design's "Edit Hover"). Here the buttons are forced on so they can be
 * seen; the next story shows them appear.
 */
export const Assignee: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Chip
        size="md"
        tone="brand"
        label="John"
        description="Assignee"
        count={5}
        avatar={<Avatar name="John Doe" tone="brand" size="sm" />}
      />
      <Chip
        size="md"
        tone="brand"
        variant="outline"
        label="John"
        description="Assignee"
        count={5}
        avatar={<Avatar name="John Doe" tone="brand" size="sm" />}
      />
      <Chip
        size="md"
        tone="brand"
        variant="outline"
        label="John"
        description="Assignee"
        count={5}
        avatar={<Avatar name="John Doe" tone="brand" size="sm" />}
        onEdit={() => {}}
        onRemove={() => {}}
      />
      <Chip
        size="md"
        disabled
        label="John"
        description="Assignee"
        count={5}
        avatar={<Avatar name="John Doe" size="sm" />}
      />
    </div>
  ),
};

/**
 * `actions="hover"`: the edit and remove buttons are hidden until the pointer is over the chip or focus is
 * inside it — Tab reveals them — and are always shown on a touch screen. They stay in the tab order.
 */
export const ActionsOnHover: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { onEdit: fn(), onRemove: fn() },
  render: (args) => (
    <Chip
      size="md"
      tone="brand"
      variant="outline"
      actions="hover"
      label="John"
      description="Assignee"
      count={5}
      avatar={<Avatar name="John Doe" tone="brand" size="sm" />}
      onEdit={args.onEdit}
      onRemove={args.onRemove}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const edit = canvas.getByRole('button', { name: 'Edit John' });
    const actions = edit.parentElement as HTMLElement;
    /* Hidden at rest... */
    await expect(getComputedStyle(actions).opacity).toBe('0');
    /* ...revealed when focus lands inside (Tab goes to the edit button first). */
    await userEvent.tab();
    await expect(edit).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(actions).opacity).toBe('1'));

    await userEvent.keyboard('{Enter}');
    await expect(args.onEdit).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

/** Disabled is inert: the buttons are not drawn, a click does nothing, and the text reads as disabled. */
export const Disabled: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { onEdit: fn(), onRemove: fn(), onClick: fn() },
  render: (args) => (
    <Chip
      size="md"
      disabled
      label="John"
      count={5}
      avatar={<Avatar name="John Doe" size="sm" />}
      onEdit={args.onEdit}
      onRemove={args.onRemove}
      onClick={args.onClick}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

/** A long label is cut with "…" and the buttons stay. */
export const LongPeopleChip: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div className="w-56">
      <Chip
        size="md"
        tone="brand"
        variant="outline"
        label="Bartholomew Featherstonehaugh-Wetherby"
        description="Assignee"
        avatar={<Avatar name="Bartholomew F" tone="brand" size="sm" />}
        onEdit={() => {}}
        onRemove={() => {}}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole('button', { name: /^Remove / });
    const chip = remove.closest('[class*="rounded-full"]') as HTMLElement;
    await expect(remove.getBoundingClientRect().right).toBeLessThanOrEqual(chip.getBoundingClientRect().right);
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
