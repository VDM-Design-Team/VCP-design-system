import type { Meta, StoryObj } from '@storybook/react-vite';
import { TopBar } from './TopBar';
import { Button } from '../../atoms/button';
import { IconButton } from '../../atoms/icon-button';
import { Breadcrumb } from '../../components/breadcrumb';
import { StatusPill } from '../../components/status-pill';

const meta = {
  title: 'Patterns/TopBar',
  component: TopBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The page header on every VCP screen — the first pattern: an organism composed ' +
          'entirely from existing pieces (IconButton, Icon, Avatar, Badge) plus layout. ' +
          'A `<header>` carrying the page’s single `<h1>`; the bell folds its unread count ' +
          'into its accessible name; the user chip is a real button when `onUserMenu` is set.',
      },
    },
  },
  args: {
    title: 'Added Values',
    notifications: 3,
    user: { name: 'Eve Kestrel' },
  },
  argTypes: {
    notifications: { control: 'number' },
  },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The list-page shape: title, bell, user. */
export const Default: Story = {
  args: { onUserMenu: () => {}, onNotifications: () => {} },
};

/**
 * The detail-page shape: back, a real `Breadcrumb` as the kicker, subtitle,
 * page actions — the composition the tier exists for.
 */
export const DetailPage: Story = {
  args: {
    onBack: () => {},
    breadcrumb: (
      <Breadcrumb
        items={[{ label: 'Added Values', href: '#avs' }, { label: 'Development', href: '#dev' }, { label: 'AV-2041' }]}
      />
    ),
    title: 'Pallet consolidation for inbound packaging',
    subtitle: 'Nordfjord Components · Development domain',
    actions: (
      <>
        <StatusPill status="In progress" />
        <Button variant="secondary" size="sm">
          Hand off
        </Button>
        <IconButton variant="tertiary" icon="dots-three" label="More actions" />
      </>
    ),
    onUserMenu: () => {},
  },
};

/** Long titles truncate; the right side never collapses. */
export const LongTitle: Story = {
  args: {
    onBack: () => {},
    title:
      'A very long Added Value title about consolidating supplier shipments into weekly pallet deliveries across three regions',
    subtitle: 'Nordfjord Components',
    onUserMenu: () => {},
  },
};

/** No unread: the bell stays, the pill goes, the name says just "Notifications". */
export const NoUnread: Story = {
  args: { notifications: 0, onNotifications: () => {} },
};

/** Without `onUserMenu`, the chip is a plain group — no dead button. */
export const ReadOnlyUser: Story = {
  args: { onUserMenu: undefined },
};

/** Every piece is a themed component, so dark is free. */
export const LightAndDark: Story = {
  render: (args) => (
    <div className="flex flex-col">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas pb-8">
            <TopBar {...args} onBack={() => {}} onUserMenu={() => {}} />
          </div>
        </div>
      ))}
    </div>
  ),
};
