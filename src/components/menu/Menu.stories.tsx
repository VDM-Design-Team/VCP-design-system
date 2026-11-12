import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Menu, type MenuItem } from './Menu';
import { Button } from '../../atoms/button';
import { DataTable } from '../data-table';

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
      { key: 'edit', label: 'Edit deliverable', icon: 'note-pencil' },
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
      { key: 'edit', label: 'Edit deliverable', icon: 'note-pencil', shortcut: '⌘E' },
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
      { key: 'edit', label: 'Edit deliverable', icon: 'note-pencil' },
      { key: 'duplicate', label: 'Duplicate', icon: 'plus-circle' },
      { divider: true },
      { key: 'archive', label: 'Archive', icon: 'trash-simple' },
    ],
  },
};

/**
 * Critical items carry the critical tone, a glyph, and a screen-reader qualifier —
 * colour is never the only signal. Keep them last, behind a divider.
 */
export const WithCriticalItem: Story = {
  name: 'With a critical item',
  args: {
    items: [
      { key: 'edit', label: 'Edit deliverable', icon: 'note-pencil' },
      { key: 'duplicate', label: 'Duplicate', icon: 'plus-circle' },
      { divider: true },
      { key: 'delete', label: 'Delete deliverable', icon: 'trash', tone: 'critical' },
    ],
  },
};

/**
 * A list of options instead of actions: `selected` marks the current choice. The
 * items become `menuitemradio` with `aria-checked`, and the chosen one carries a
 * check, so the state is announced and not colour alone.
 */
export const WithSelectedItem: Story = {
  name: 'With a selected item',
  args: {
    trigger: <Button variant="secondary">Domain: Procurement</Button>,
    items: [
      { key: 'finance', label: 'Finance', selected: false },
      { key: 'procurement', label: 'Procurement', selected: true },
      { key: 'logistics', label: 'Logistics', selected: false },
    ],
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Domain: Procurement' }));
    await screen.findByRole('menu');
    const chosen = screen.getByRole('menuitemradio', { name: 'Procurement' });
    await expect(chosen).toHaveAttribute('aria-checked', 'true');
    await expect(screen.getByRole('menuitemradio', { name: 'Finance' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await expect(screen.getAllByRole('menuitemradio')).toHaveLength(3);
  },
};

/** A disabled item stays visible so the action is discoverable, but the keyboard skips it. */
export const WithDisabledItem: Story = {
  name: 'With a disabled item',
  args: {
    items: [
      { key: 'edit', label: 'Edit deliverable', icon: 'note-pencil' },
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
            { key: 'edit', label: 'Edit deliverable', icon: 'note-pencil', shortcut: '⌘E' },
            { key: 'share', label: 'Share with team', icon: 'users' },
            { key: 'publish', label: 'Publish', icon: 'rocket', disabled: true },
            { divider: true },
            { key: 'delete', label: 'Delete deliverable', icon: 'trash', tone: 'critical' },
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
  { key: 'edit', label: 'Edit deliverable', icon: 'note-pencil' },
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
      { key: 'edit', label: 'Edit deliverable', icon: 'note-pencil' },
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

/** A heading over the items, in the library's category style (small bold type in the quiet grey, a rule beneath) without its caret. It names the menu. */
export const WithAHeading: Story = {
  args: { heading: 'Urgency', items: [{ key: 'low', label: 'Low' }, { key: 'normal', label: 'Normal' }, { key: 'high', label: 'High' }] },
  render: (args) => <Menu {...args} trigger={<Button variant="secondary">Urgency</Button>} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Urgency' }));
    const menu = await screen.findByRole('menu', { name: 'Urgency' });
    /* The heading is not an item. */
    await expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);
    await expect(within(menu).getByText('Urgency')).toBeVisible();
  },
};

/**
 * A submenu: an item with `items` shows a right caret and opens its choices beside it — on hover, on click or with ArrowRight. The parent keeps the highlight (brand blue, bold)
 * while it is open, and the submenu has its own heading. Only the submenu's items are choices. ArrowLeft or Escape closes just the submenu and returns focus to its parent.
 */
export const WithASubmenu: Story = {
  args: {
    heading: 'Move to Status',
    items: [
      { key: 'draft', label: 'Save as Draft' },
      {
        key: 'pending',
        label: 'Pending Review',
        items: [
          { key: 'pending-accept', label: 'Accept' },
          { key: 'pending-reject', label: 'Reject' },
        ],
      },
      { key: 'progress', label: 'In Progress' },
    ],
    onSelect: fn(),
  },
  render: (args) => <Menu {...args} trigger={<Button variant="secondary">Status</Button>} />,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Status' }));
    const menu = await screen.findByRole('menu', { name: 'Move to Status' });
    const parent = within(menu).getByRole('menuitem', { name: 'Pending Review' });
    await expect(parent).toHaveAttribute('aria-haspopup', 'menu');
    await expect(parent).toHaveAttribute('aria-expanded', 'false');
    /* Opening it by keyboard: ArrowRight, with focus going into the submenu. */
    parent.focus();
    await userEvent.keyboard('{ArrowRight}');
    const sub = await screen.findByRole('menu', { name: 'Pending Review' });
    await expect(parent).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(within(sub).getByRole('menuitem', { name: 'Accept' })).toHaveFocus());
    /* ArrowLeft closes only the submenu, and focus goes back to its parent. */
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.queryByRole('menu', { name: 'Pending Review' })).toBeNull());
    await expect(parent).toHaveFocus();
    await expect(screen.getByRole('menu', { name: 'Move to Status' })).toBeVisible();
    /* Choosing from it asks with the submenu item's own key, and closes everything. */
    await userEvent.click(parent);
    await userEvent.click(await within(await screen.findByRole('menu', { name: 'Pending Review' })).findByRole('menuitem', { name: 'Reject' }));
    await expect(args.onSelect).toHaveBeenCalledWith('pending-reject');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  },
};

/**
 * A submenu item with `caret: false` leaves out the right caret, where the design draws it without. It is still `aria-haspopup="menu"` and opens the same way, so it is announced as a submenu;
 * only the glyph goes. Leave the caret unless the design says otherwise: it is how a sighted person knows the item opens something.
 */
export const SubmenuWithoutACaret: Story = {
  args: {
    items: [
      { key: 'open', label: 'Open' },
      { key: 'move', label: 'Move to', caret: false, items: [{ key: 'a', label: 'Cycle 27' }, { key: 'b', label: 'Cycle 28' }] },
    ],
    onSelect: fn(),
  },
  render: (args) => <Menu {...args} trigger={<Button variant="secondary">Actions</Button>} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Actions' }));
    const menu = await screen.findByRole('menu');
    const parent = within(menu).getByRole('menuitem', { name: 'Move to' });
    /* No caret, but still a submenu. */
    await expect(parent.querySelector('svg')).toBeNull();
    await expect(parent).toHaveAttribute('aria-haspopup', 'menu');
    await userEvent.click(parent);
    await expect(await screen.findByRole('menuitem', { name: 'Cycle 28' })).toBeVisible();
  },
};

const SUB_ITEMS = [
  { key: 'draft', label: 'Save as Draft' },
  {
    key: 'pending',
    label: 'Pending Review',
    items: [
      { key: 'pending-accept', label: 'Accept' },
      { key: 'pending-reject', label: 'Reject' },
    ],
  },
  { key: 'progress', label: 'In Progress' },
];

/** The submenu's first choice lines up with its parent item, and it sits beside it. How far above the item the panel starts is measured, not a constant. */
export const SubmenuAlignsWithItsParent: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { heading: 'Move to Status', items: SUB_ITEMS },
  render: (args) => <Menu {...args} trigger={<Button variant="secondary">Status</Button>} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Status' }));
    const parent = within(await screen.findByRole('menu', { name: 'Move to Status' })).getByRole('menuitem', { name: 'Pending Review' });
    await userEvent.click(parent);
    const sub = await screen.findByRole('menu', { name: 'Pending Review' });
    const first = within(sub).getByRole('menuitem', { name: 'Accept' });
    await waitFor(() => expect(Math.abs(first.getBoundingClientRect().top - parent.getBoundingClientRect().top)).toBeLessThanOrEqual(1));
    await expect(Math.abs(sub.getBoundingClientRect().left - parent.getBoundingClientRect().right)).toBeLessThanOrEqual(1);
  },
};

/** The open submenu's parent keeps its highlight in the dark theme too, at a contrast that clears 4.5:1 (it was the medium blue on the faint fill, 3.5:1). The accessibility check runs on the open state. */
export const SubmenuOpenInDark: Story = {
  globals: { theme: 'dark' },
  args: { heading: 'Move to Status', items: SUB_ITEMS },
  render: (args) => <Menu {...args} trigger={<Button variant="secondary">Status</Button>} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Status' }));
    const parent = within(await screen.findByRole('menu', { name: 'Move to Status' })).getByRole('menuitem', { name: 'Pending Review' });
    await userEvent.click(parent);
    await screen.findByRole('menu', { name: 'Pending Review' });
    await expect(parent).toHaveAttribute('aria-expanded', 'true');
  },
};

/** With no room on the right the submenu flips to the left of its parent, and stays on screen. */
export const SubmenuFlipsLeft: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { heading: 'Move to Status', items: SUB_ITEMS },
  render: (args) => (
    <div className="fixed right-2 top-24">
      <Menu {...args} align="right" trigger={<Button variant="secondary">Status</Button>} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Status' }));
    const parent = within(await screen.findByRole('menu', { name: 'Move to Status' })).getByRole('menuitem', { name: 'Pending Review' });
    await userEvent.click(parent);
    const sub = await screen.findByRole('menu', { name: 'Pending Review' });
    await waitFor(() => expect(sub.getBoundingClientRect().right).toBeLessThanOrEqual(parent.getBoundingClientRect().left + 1));
    await expect(sub.getBoundingClientRect().left).toBeGreaterThanOrEqual(0);
    await expect(sub.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** The submenu follows its parent item when something scrolls under it, as `Popover` does for the menu itself. */
export const SubmenuFollowsScroll: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { heading: 'Move to Status', items: SUB_ITEMS },
  render: (args) => (
    <div data-testid="scroller" className="h-64 overflow-auto">
      <div className="h-24" />
      <Menu {...args} trigger={<Button variant="secondary">Status</Button>} />
      <div className="h-96" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Status' }));
    const parent = within(await screen.findByRole('menu', { name: 'Move to Status' })).getByRole('menuitem', { name: 'Pending Review' });
    await userEvent.click(parent);
    const sub = await screen.findByRole('menu', { name: 'Pending Review' });
    const first = within(sub).getByRole('menuitem', { name: 'Accept' });
    const before = parent.getBoundingClientRect().top;
    const scroller = within(canvasElement).getByTestId('scroller');
    scroller.scrollTop = 16;
    scroller.dispatchEvent(new Event('scroll'));
    await waitFor(() => expect(parent.getBoundingClientRect().top).not.toBe(before));
    await waitFor(() => expect(Math.abs(first.getBoundingClientRect().top - parent.getBoundingClientRect().top)).toBeLessThanOrEqual(1));
  },
};

/**
 * `searchable` puts Figma's search item at the top (the Cycle menu): focus starts in the box, typing narrows the list, ArrowDown goes into it, ArrowUp from the first item comes back,
 * and Enter chooses the first match.
 */
export const Searchable: Story = {
  args: {
    items: ['C33', 'C34', 'C35', 'C36', 'C37', 'C38', 'C39'].map((code) => ({ key: code, label: `${code} (May 25, 2026 - Jun 08, 2026)` })),
    onSelect: fn(),
  },
  render: (args) => <Menu {...args} searchable trigger={<Button variant="secondary">Cycle</Button>} />,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cycle' }));
    const search = await screen.findByRole('searchbox', { name: 'Search...' });
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.type(search, 'c3');
    await userEvent.clear(search);
    await userEvent.type(search, '37');
    const menu = screen.getByRole('menu');
    await expect(within(menu).getAllByRole('menuitem')).toHaveLength(1);
    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    await expect(within(menu).getByText('No results')).toBeVisible();
    await userEvent.clear(search);
    await userEvent.type(search, '38');
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelect).toHaveBeenCalledWith('C38');
  },
};

/**
 * **Flow:** the menu on a table's last row. `DataTable` scrolls sideways, so it clips whatever runs past
 * its edges; the menu floats above the page instead, and every item shows and can be clicked. (The table
 * cut it off until November 2026.)
 */
export const FloatsOutOfATable: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  render: (args) => (
    <div className="w-112">
      <DataTable
        caption="Added Values"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title' },
          { key: 'actions', label: 'Actions', render: () => <Menu {...args} /> },
        ]}
        rows={[
          { id: 'AV-2041', title: 'Supplier onboarding portal' },
          { id: 'AV-2037', title: 'Freight cost renegotiation' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const triggers = within(canvasElement).getAllByRole('button', { name: 'More actions' });
    await userEvent.click(triggers[triggers.length - 1]!);
    const menu = await screen.findByRole('menu');
    /* Each item is what the pointer finds at its own centre: the table does not cut it off. */
    for (const item of within(menu).getAllByRole('menuitem')) {
      const r = item.getBoundingClientRect();
      await expect(item.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2))).toBe(true);
    }
  },
};
