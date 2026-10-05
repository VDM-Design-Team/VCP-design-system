import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Menu, type MenuItem } from './Menu';
import { Button } from '../../atoms/button';

const basic: MenuItem[] = [
  { key: 'edit', label: 'Edit deliverable' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'share', label: 'Share with team' },
];

const meta = {
  title: 'Components/Overlays/Menu',
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
          <span className="font-sans text-label-sm-medium text-text-subtle">
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

const actions: MenuItem[] = [
  { key: 'edit', label: 'Edit deliverable', icon: 'pencil-simple' },
  { key: 'duplicate', label: 'Duplicate', icon: 'plus-circle' },
  { key: 'share', label: 'Share with team', icon: 'users' },
  { key: 'export', label: 'Export as file', icon: 'file' },
];
const item = (name: string) => screen.getByRole('menuitem', { name });

/**
 * **Flow:** the whole keyboard contract. Down on the trigger opens on the first
 * item, Up on the last; arrows move and wrap; Home and End jump; a letter jumps
 * to the next match; the list is one tab stop (roving tabindex); Escape closes
 * and hands focus back to the trigger.
 */
export const KeyboardFlow: Story = {
  args: { items: actions, trigger: <Button variant="secondary">Deliverable actions</Button> },
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Deliverable actions' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(item('Edit deliverable')).toHaveFocus());

    /* One tab stop: only the item with focus is tabbable. */
    await expect(item('Edit deliverable')).toHaveAttribute('tabindex', '0');
    await expect(item('Duplicate')).toHaveAttribute('tabindex', '-1');

    await userEvent.keyboard('{ArrowDown}');
    await expect(item('Duplicate')).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(item('Export as file')).toHaveFocus();
    /* Past the end wraps to the start, and back. */
    await userEvent.keyboard('{ArrowDown}');
    await expect(item('Edit deliverable')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(item('Export as file')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(item('Edit deliverable')).toHaveFocus();

    /* Type-ahead: "s" lands on the first item starting with it. */
    await userEvent.keyboard('s');
    await expect(item('Share with team')).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    /* Up on the trigger opens on the last item. */
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(item('Export as file')).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  },
};

/**
 * **Flow:** the arrows step over dividers and disabled items rather than
 * landing on them — the disabled item stays visible, so the action is still
 * discoverable.
 */
export const SkipsDisabledAndDividers: Story = {
  args: {
    trigger: <Button variant="secondary">Deliverable actions</Button>,
    items: [
      { key: 'edit', label: 'Edit deliverable', icon: 'pencil-simple' },
      { divider: true },
      { key: 'publish', label: 'Publish', icon: 'rocket', disabled: true },
      { key: 'share', label: 'Share with team', icon: 'users' },
    ],
  },
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Deliverable actions' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(item('Edit deliverable')).toHaveFocus());

    await expect(item('Publish')).toBeDisabled();
    await userEvent.keyboard('{ArrowDown}');
    await expect(item('Share with team')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(item('Edit deliverable')).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  },
};

/**
 * **Flow:** choosing an item — by click or by Enter — reports its `key` through
 * `onSelect`, closes the menu and returns focus to the trigger. Landing on an
 * item never chooses it.
 */
export const SelectCloses: Story = {
  args: {
    items: actions,
    trigger: <Button variant="secondary">Deliverable actions</Button>,
    onSelect: fn(),
  },
  parameters: { controls: { disable: true } },
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Deliverable actions' });

    await userEvent.click(trigger);
    await screen.findByRole('menu');
    await userEvent.click(item('Duplicate'));
    await expect(args.onSelect).toHaveBeenCalledWith('duplicate');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();

    /* By keyboard: moving does nothing, Enter chooses. */
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(item('Edit deliverable')).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelect).toHaveBeenLastCalledWith('share');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
