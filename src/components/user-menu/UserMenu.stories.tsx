import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { UserMenu } from './UserMenu';

const ITEMS = [
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
          '`Menu` of account links. The items are the page’s — it decides what Logout does and ' +
          'which links an admin sees that a regular user does not.',
      },
    },
  },
  args: { user: { name: 'Francis M.' }, items: ITEMS, onSelect: fn() },
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

/** Closed: the avatar (initials until there is a photo), the name and a caret. */
export const Default: Story = {};

/** Open, pick a row: `onSelect` hears the row's `key`, and the menu closes. */
export const Open: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Francis M., account menu' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getAllByRole('menuitem').map((i) => i.textContent)).toEqual([
      'My Added Values',
      'Settings',
      'Cycle Settings',
      'Logout',
    ]);

    await userEvent.click(canvas.getByRole('menuitem', { name: 'Logout' }));
    await expect(args.onSelect).toHaveBeenCalledWith('logout');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
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
    await expect(canvas.getByRole('menuitem', { name: 'My Added Values' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await expect(args.onSelect).toHaveBeenCalledWith('cycles');

    await userEvent.keyboard('{Enter}{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await expect(trigger).toHaveFocus();
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
