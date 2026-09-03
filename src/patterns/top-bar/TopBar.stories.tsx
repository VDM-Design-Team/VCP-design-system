import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TopBar } from './TopBar';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/TopBar',
  component: TopBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The app bar, matching the Figma `Top_NavBar` and its two versions: with the ' +
          '“Create Added Value” Button in `primaryAction`, or with the linked Logo when ' +
          'there is none. Right side: bell (unread = the design’s red dot, count in the ' +
          'accessible name), the light/dark mode Toggle, and the user chip. The page-level ' +
          'header (back, title, status actions) is `AVHeader` — a separate pattern, to port.',
      },
    },
  },
  args: {
    notifications: 3,
    user: { name: 'Eve Kestrel' },
  },
  argTypes: {
    notifications: { control: 'number' },
    theme: { control: 'radio', options: ['light', 'dark'] },
  },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Version 1: the primary action leads — the Figma variant with the button. */
export const WithPrimaryAction: Story = {
  args: {
    primaryAction: <Button>Create Added Value</Button>,
    theme: 'light',
    onUserMenu: () => {},
    onNotifications: () => {},
  },
};

/** Version 2: no primary action — the linked Logo takes the left. */
export const WithLogo: Story = {
  args: {
    homeHref: '#home',
    theme: 'light',
    onUserMenu: () => {},
    onNotifications: () => {},
  },
};

/**
 * The mode Toggle reports the wish; the app owns the theme. This story wires
 * it for real — flick it and the bar (and everything in it) re-themes.
 */
export const LiveThemeToggle: Story = {
  render: (args) => {
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
    return (
      <div className={theme === 'dark' ? 'dark' : undefined}>
        <div className="bg-surface-canvas pb-24">
          <TopBar
            {...args}
            primaryAction={<Button>Create Added Value</Button>}
            theme={theme}
            onThemeChange={setTheme}
            onUserMenu={() => {}}
          />
        </div>
      </div>
    );
  },
};

/** No unread: the bell stays, the dot goes, the name says just "Notifications". */
export const NoUnread: Story = {
  args: { homeHref: '#home', notifications: 0, theme: 'light', onNotifications: () => {} },
};

/** Without `onUserMenu`, the chip is a plain group — no dead button. */
export const ReadOnlyUser: Story = {
  args: { homeHref: '#home', theme: 'light', onUserMenu: undefined },
};

/** Both versions, both themes. */
export const LightAndDark: Story = {
  render: (args) => (
    <div className="flex flex-col">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-4 bg-surface-canvas pb-6">
            <TopBar
              {...args}
              primaryAction={<Button>Create Added Value</Button>}
              theme={isDark ? 'dark' : 'light'}
              onUserMenu={() => {}}
            />
            <TopBar {...args} homeHref="#home" theme={isDark ? 'dark' : 'light'} onUserMenu={() => {}} />
          </div>
        </div>
      ))}
    </div>
  ),
};
