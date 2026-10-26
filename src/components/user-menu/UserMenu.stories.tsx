import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { UserMenu } from './UserMenu';

/* What an app passes when it wants more than the default Settings and Logout: Figma's full list. */
const FIGMA_ITEMS = [
  { key: 'values', label: 'My Added Values' },
  { key: 'settings', label: 'Settings' },
  { key: 'cycles', label: 'Cycle Settings' },
  { key: 'logout', label: 'Logout' },
];

const meta = {
  title: 'Components/Overlays/UserMenu',
  component: UserMenu,
  parameters: {
    docs: {
      description: {
        component:
          'The signed-in person and the menu behind them: avatar, name and a caret, opening a ' +
          '`Menu` of account links. By default the menu holds Settings and Logout; pass `items` for ' +
          'anything else. The page decides what Logout does and which links an admin sees that a ' +
          'regular user does not.',
      },
    },
  },
  args: { user: { name: 'Francis M.' }, onSelect: fn() },
  decorators: [
    (Story) => (
      <div className="flex h-64 w-72 justify-end">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Closed: the avatar (initials until there is a photo), the name and a caret. It hugs its content: the
 * decorator here is a tall flex row, and the trigger is still only as tall as its avatar and name.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Francis M., account menu' });
    await expect(trigger.getBoundingClientRect().height).toBeLessThan(64);
  },
};

/** Open: the default menu is Settings and Logout. Pick a row and `onSelect` hears its `key`, and the menu closes. */
export const Open: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Francis M., account menu' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    /* Tailwind turns it with the CSS `rotate` property, not `transform`. */
    const caret = trigger.querySelector('svg') as SVGElement;
    await expect(getComputedStyle(caret).rotate).toBe('none');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    /* The caret turns up while the menu is open. */
    await waitFor(() => expect(getComputedStyle(caret).rotate).not.toBe('none'));
    await expect(canvas.getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Settings', 'Logout']);

    await userEvent.click(canvas.getByRole('menuitem', { name: 'Logout' }));
    await expect(args.onSelect).toHaveBeenCalledWith('logout');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    /* ...and turns back when it closes. */
    await waitFor(() => expect(getComputedStyle(caret).rotate).toBe('none'));
  },
};

/** Keyboard: Enter opens with focus on the first row, arrows move, Escape closes and returns focus. */
export const Keyboard: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Francis M., account menu' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('menuitem', { name: 'Settings' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onSelect).toHaveBeenCalledWith('logout');

    await userEvent.keyboard('{Enter}{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await expect(trigger).toHaveFocus();
  },
};

/** More than the default: pass `items`. Here Figma's full list, as an app might for an admin. */
export const CustomItems: Story = {
  args: { items: FIGMA_ITEMS },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Francis M., account menu' }));
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(4);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Cycle Settings' }));
    await expect(args.onSelect).toHaveBeenCalledWith('cycles');
  },
};

/** A long name is cut with "…" and the caret stays. */
export const LongName: Story = {
  args: { user: { name: 'Bartholomew Featherstonehaugh-Wetherby' } },
};

/** Admin and regular views differ only by the `items` the page passes. */
export const WithDividerAndDanger: Story = {
  args: {
    items: [
      { key: 'values', label: 'My Added Values' },
      { key: 'settings', label: 'Settings' },
      { divider: true },
      { key: 'logout', label: 'Logout', tone: 'danger' },
    ],
  },
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Francis M., account menu' }));
    await expect(canvas.getByRole('separator')).toBeVisible();
    /* A danger row carries a screen-reader qualifier in its name, so match the label loosely. */
    await expect(canvas.getByRole('menuitem', { name: /Logout/ })).toBeVisible();
  },
};

/** Light and dark, closed and open. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [],
  render: (args) => (
    <div className="flex flex-col">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex justify-end bg-surface-canvas p-6">
            <UserMenu {...args} defaultOpen />
          </div>
          <div className="h-48 bg-surface-canvas" />
        </div>
      ))}
    </div>
  ),
};
