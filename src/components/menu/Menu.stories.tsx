import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menu, type MenuItem } from './Menu';
import { Button } from '../button';

const basic: MenuItem[] = [
  { key: 'edit', label: 'Edit deliverable' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'share', label: 'Share with team' },
];

const meta = {
  title: 'Overlays/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A dropdown list of actions. Built on `Popover`, with the keyboard contract a menu ' +
          'needs on top: focus moves into the list on open, Up/Down move between items, ' +
          'Home/End jump to the ends, a letter jumps to a matching item, Enter/Space activate, ' +
          'and Escape closes and returns focus to the trigger. Disabled items and dividers are ' +
          'stepped over. See docs/menu.md.' +
          '\n\n**From Figma:** Menus display a list of choices on a temporary surface. They ' +
          'appear when users interact with a button, action, or other control.',
      },
    },
  },
  args: { items: basic },
  argTypes: {
    align: { control: 'radio', options: ['left', 'right'] },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-96 items-start justify-center p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No `trigger` given, so the default ghost ellipsis `IconButton` is used. */
export const Default: Story = {};

/** Glyphs are typed `IconName`, so a name the system does not ship will not compile. */
export const WithIcons: Story = {
  name: 'With icons',
  args: {
    items: [
      { key: 'edit', label: 'Edit deliverable', icon: 'pencil-simple' },
      { key: 'duplicate', label: 'Duplicate', icon: 'plus-circle' },
      { key: 'share', label: 'Share with team', icon: 'users' },
      { key: 'export', label: 'Export as file', icon: 'file' },
    ],
  },
};

/** Shortcuts are display only — Menu binds no key handlers for them. */
export const WithShortcuts: Story = {
  name: 'With shortcuts',
  args: {
    items: [
      { key: 'edit', label: 'Edit deliverable', icon: 'pencil-simple', shortcut: '⌘E' },
      { key: 'duplicate', label: 'Duplicate', icon: 'plus-circle', shortcut: '⌘D' },
      { key: 'share', label: 'Share with team', icon: 'users', shortcut: '⇧⌘S' },
    ],
  },
};

/** A `divider: true` entry is a `role="separator"` rule. It is not focusable, and the arrows step over it. */
export const WithDivider: Story = {
  name: 'With a divider',
  args: {
    items: [
      { key: 'edit', label: 'Edit deliverable', icon: 'pencil-simple' },
      { key: 'duplicate', label: 'Duplicate', icon: 'plus-circle' },
      { divider: true },
      { key: 'archive', label: 'Archive', icon: 'trash-simple' },
    ],
  },
};

/**
 * Danger items carry the critical tone, a glyph, and a screen-reader qualifier —
 * colour is never the only signal. Keep them last, behind a divider.
 */
export const WithDangerItem: Story = {
  name: 'With a danger item',
  args: {
    items: [
      { key: 'edit', label: 'Edit deliverable', icon: 'pencil-simple' },
      { key: 'duplicate', label: 'Duplicate', icon: 'plus-circle' },
      { divider: true },
      { key: 'delete', label: 'Delete deliverable', icon: 'trash', tone: 'danger' },
    ],
  },
};

/** A disabled item stays visible so the action is discoverable, but the keyboard skips it. */
export const WithDisabledItem: Story = {
  name: 'With a disabled item',
  args: {
    items: [
      { key: 'edit', label: 'Edit deliverable', icon: 'pencil-simple' },
      { key: 'publish', label: 'Publish', icon: 'rocket', disabled: true },
      { key: 'share', label: 'Share with team', icon: 'users' },
    ],
  },
};

/**
 * `align` picks which edge the menu is flush with. Use `right` (the default) for
 * a trigger near the right edge of its container, `left` for one near the left —
 * there is no collision detection to do it for you.
 */
export const Alignment: Story = {
  render: (args) => (
    <div className="flex w-96 items-start justify-between rounded-md border border-stroke-subtle bg-surface-elevated p-3">
      <Menu {...args} align="left" trigger={<Button variant="secondary">Aligned left</Button>} />
      <Menu {...args} align="right" trigger={<Button variant="secondary">Aligned right</Button>} />
    </div>
  ),
};

/** The caller owns the state. `onOpenChange` reports every close, including Escape and outside clicks. */
export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    const [last, setLast] = React.useState<string | undefined>();
    return (
      <div className="flex flex-col items-center gap-4">
        <Menu {...args} open={open} onOpenChange={setOpen} onSelect={setLast} />
        <div className="flex items-center gap-3">
          <Button size="sm" variant="tertiary" onClick={() => setOpen((o) => !o)}>
            Toggle from outside
          </Button>
          <span className="font-sans text-label-md text-text-subtle">
            open: {String(open)} · last: {last ?? '—'}
          </span>
        </div>
      </div>
    );
  },
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: (args) => {
    const set = (
      <div className="flex min-h-72 items-start justify-center bg-surface-canvas p-8">
        <Menu
          {...args}
          defaultOpen
          align="left"
          items={[
            { key: 'edit', label: 'Edit deliverable', icon: 'pencil-simple', shortcut: '⌘E' },
            { key: 'share', label: 'Share with team', icon: 'users' },
            { key: 'publish', label: 'Publish', icon: 'rocket', disabled: true },
            { divider: true },
            { key: 'delete', label: 'Delete deliverable', icon: 'trash', tone: 'danger' },
          ]}
        />
      </div>
    );
    return (
      <div className="grid grid-cols-1 gap-4">
        <div>{set}</div>
        <div className="dark">{set}</div>
      </div>
    );
  },
};
