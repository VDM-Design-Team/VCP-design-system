import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ConnectionCard } from './ConnectionCard';
import { Icon } from '../../atoms/icon';

/* A stand-in mark: a service brings its own logo. */
const LOGO = <Icon name="link" size="lg" />;

const meta = {
  title: 'Components/Display/ConnectionCard',
  component: ConnectionCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'An outside service you can link your account to: its logo, its name, where the link stands, and the button that ' +
          'connects it. Generic on purpose — the words, and what the button does, are the caller’s.',
      },
    },
  },
  args: { name: 'Jira', logo: LOGO, status: 'Not connected', onAction: fn() },
} satisfies Meta<typeof ConnectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's card: a logo tile, "Jira", "Not connected", and Connect. */
export const NotConnected: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('group', { name: 'Jira' })).toBeVisible();
    await expect(c.getByText('Not connected')).toBeVisible();
    /* The button is named for the service, and contains its visible word. */
    await userEvent.click(c.getByRole('button', { name: 'Connect Jira' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

/** The same card with other words: connected, and the button now disconnects. */
export const Connected: Story = {
  args: { status: 'Connected as ada@company.com', actionLabel: 'Disconnect' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Connected as ada@company.com')).toBeVisible();
    await expect(c.getByRole('button', { name: 'Disconnect Jira' })).toBeVisible();
  },
};

/** While the connection is in flight, the button spins. */
export const Connecting: Story = {
  args: { status: 'Connecting…', loading: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Connect Jira' })).toHaveAttribute('aria-busy', 'true');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Connect Jira' })).toBeDisabled();
  },
};

/** A long status is cut with "…" rather than pushing the button out of the card. */
export const LongStatus: Story = {
  render: (args) => (
    <div className="w-80">
      <ConnectionCard {...args} status="Connected as a-very-long-email-address@a-very-long-company-name.example.com" />
    </div>
  ),
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
