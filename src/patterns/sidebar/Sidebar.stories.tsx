import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar, NAV_BY_USER_TYPE, type SidebarUserType } from './Sidebar';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';

const meta = {
  title: 'Patterns/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The app’s primary navigation rail — logo, the nav set for whoever is looking, and ' +
          '"Report a problem" pinned to the bottom. Read off the Figma `SideBar` section: ' +
          '**four user types, each with a minimised twin** at 76 against 256 expanded. It owns ' +
          'the nav vocabulary because the design does — twelve named presets, and which rows ' +
          'each type sees is drawn rather than configured.',
      },
    },
  },
  args: { userType: 'user', active: 'dashboard' },
  argTypes: {
    userType: {
      control: 'inline-radio',
      options: ['user', 'admin', 'admin-dev', 'super-admin'],
    },
    collapsed: { control: 'boolean' },
    showDomainSelector: { control: 'boolean' },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/* The rail is full-height by design — it fills the viewport beside the page
   content, with "Report a problem" pinned to the bottom. The stories stand it
   in a screen-height frame so that reads the way it will in the app. */
const Stage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-surface-canvas">{children}</div>
);

/** The default rail, as a `user` sees it. */
export const Default: Story = {
  render: (args) => {
    const [active, setActive] = React.useState('dashboard');
    return (
      <Stage>
        <Sidebar {...args} active={active} onNavigate={setActive} onToggleCollapse={() => {}} />
      </Stage>
    );
  },
};

/**
 * All four user types. `Admin Dev` is the one the Claude Design export did
 * not have — it is the only rail with `Planning`.
 */
export const EveryUserType: Story = {
  parameters: { controls: { disable: true }, ...SIDE_BY_SIDE },
  render: () => (
    <div className="flex h-screen gap-6 overflow-x-auto bg-surface-canvas p-6">
      {(['user', 'admin', 'admin-dev', 'super-admin'] as SidebarUserType[]).map((t) => (
        /* `min-h-0` + `flex-1` on the rail: without them each column sizes to
           its own content, the four end up different heights, and the footer
           row sits under the last nav item instead of at the bottom. */
        <div key={t} className="flex min-h-0 flex-col gap-2">
          <p className="text-label-md text-text-tertiary">{t}</p>
          <Sidebar userType={t} active="dashboard" className="min-h-0 flex-1 rounded-md border" />
        </div>
      ))}
    </div>
  ),
};

/** The 76-wide rail. Every row keeps its name in a tooltip and in `aria-label`. */
export const Collapsed: Story = {
  args: { collapsed: true },
  render: (args) => (
    <Stage>
      <Sidebar {...args} onToggleCollapse={() => {}} />
    </Stage>
  ),
};

/** Expanded and collapsed side by side — the glyphs hold their axis. */
export const BothWidths: Story = {
  parameters: { controls: { disable: true }, ...SIDE_BY_SIDE },
  render: () => (
    <div className="flex h-screen gap-6 bg-surface-canvas p-6">
      <Sidebar userType="admin-dev" active="planning" className="rounded-md border" />
      <Sidebar userType="admin-dev" active="planning" collapsed className="rounded-md border" />
    </div>
  ),
};

/**
 * `Archive` and `Planning` are the two rows with sub-items. Open, the group
 * lifts onto an elevated card — `SidebarItem` does that, not this.
 */
export const ExpandedSection: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const nav = NAV_BY_USER_TYPE['admin-dev'].map((i) =>
      i.key === 'planning' ? { ...i, items: i.items } : i,
    );
    return (
      <Stage>
        <Sidebar userType="admin-dev" items={nav} active="planning" />
      </Stage>
    );
  },
};

/**
 * The domain switcher. **Off by default**, matching the design, where it sits
 * in the rail as a hidden layer rather than as part of the default variant.
 */
export const WithDomainSelector: Story = {
  args: {
    showDomainSelector: true,
    domain: 'Design',
    domains: ['Design', 'Development'],
  },
  render: (args) => (
    <Stage>
      <Sidebar {...args} onToggleCollapse={() => {}} />
    </Stage>
  ),
};

/** Every fill is a token, so dark comes free. */
export const LightAndDark: Story = {
  parameters: { controls: { disable: true }, ...SIDE_BY_SIDE },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex h-screen bg-surface-canvas">
            <Sidebar userType="admin" active="my-values" onToggleCollapse={() => {}} />
          </div>
        </div>
      ))}
    </div>
  ),
};
