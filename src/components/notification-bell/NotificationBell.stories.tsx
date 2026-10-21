import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NotificationBell } from './NotificationBell';

const meta = {
  title: 'Components/Feedback/NotificationBell',
  component: NotificationBell,
  parameters: {
    docs: {
      description: {
        component:
          'The bell that opens notifications, with the red dot that says something is unread. ' +
          'A real `IconButton` underneath, so the focus ring, the 40 target and the name are the ' +
          "system's. The count is in the button's **name** (\"Notifications, 3 unread\"); the dot " +
          'and its slow pulse are decoration. Reduced motion keeps the dot and drops the pulse.',
      },
    },
  },
  args: { count: 3, onClick: fn() },
  argTypes: {
    count: { control: 'number' },
    onClick: { control: false },
  },
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unread: the dot, and the count in the name. */
export const Unread: Story = {
  play: async ({ canvasElement, args }) => {
    const bell = within(canvasElement).getByRole('button', { name: 'Notifications, 3 unread' });
    await userEvent.click(bell);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    /* The dot is decoration: it carries no name of its own. */
    await expect(canvasElement.querySelector('[aria-hidden="true"].absolute')).not.toBeNull();
  },
};

/** Nothing unread: no dot, and the name says just "Notifications". */
export const NoUnread: Story = {
  args: { count: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Notifications' })).toBeVisible();
    await expect(canvasElement.querySelector('[aria-hidden="true"].absolute')).toBeNull();
  },
};

/** A custom name, for a localised app: used as given, so say the count yourself. */
export const CustomLabel: Story = {
  args: { label: '3 notifications non lues' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: '3 notifications non lues' }),
    ).toBeVisible();
  },
};

/**
 * Menu and Popover clone their trigger and wire `aria-expanded` and the click
 * onto it, so the bell must hand every prop to its button. This one is told it
 * is expanded, as an open popover would.
 */
export const AsATrigger: Story = {
  args: { 'aria-expanded': true, 'aria-haspopup': 'dialog' },
  play: async ({ canvasElement }) => {
    const bell = within(canvasElement).getByRole('button', { name: /Notifications/ });
    await expect(bell).toHaveAttribute('aria-expanded', 'true');
    await expect(bell).toHaveAttribute('aria-haspopup', 'dialog');
  },
};

/** Both themes. Every colour is a semantic token, so dark comes for free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex items-center gap-6 bg-surface-elevated p-8">
            <NotificationBell {...args} count={3} />
            <NotificationBell {...args} count={0} />
          </div>
        </div>
      ))}
    </div>
  ),
};
