import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
/* Storybook's own hooks, not React's: a story function can't mix the two,
   and `useArgs` is a Storybook hook. */
import { useArgs, useEffect, useState } from 'storybook/preview-api';
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

/* The floating double-chevron really collapses and expands the rail. The
   story keeps its own state, because on a Docs page Storybook re-renders only
   the primary story when an arg changes — a toggle that only wrote the arg
   did nothing on every other story there. It still writes the arg back, and
   follows it, so the Controls panel and the button stay in step on a story's
   own page. */
const useCollapseToggle = (fromArgs?: boolean) => {
  const [, updateArgs] = useArgs<{ collapsed?: boolean }>();
  const [collapsed, setCollapsed] = useState(!!fromArgs);
  useEffect(() => setCollapsed(!!fromArgs), [fromArgs]);
  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    updateArgs({ collapsed: next });
  };
  return [collapsed, toggle] as const;
};

/** The default rail, as a `user` sees it. */
export const Default: Story = {
  render: (args) => {
    const [active, setActive] = useState('dashboard');
    const [collapsed, toggle] = useCollapseToggle(args.collapsed);
    return (
      <Stage>
        <Sidebar
          {...args}
          collapsed={collapsed}
          active={active}
          onNavigate={setActive}
          onToggleCollapse={toggle}
        />
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
          <p className="text-label-sm-medium text-text-tertiary">{t}</p>
          <Sidebar userType={t} active="dashboard" className="min-h-0 flex-1 rounded-md border" />
        </div>
      ))}
    </div>
  ),
};

/** The 76-wide rail. Every row keeps its name in a tooltip and in `aria-label`. */
export const Collapsed: Story = {
  args: { collapsed: true },
  render: function Render(args) {
    const [collapsed, toggle] = useCollapseToggle(args.collapsed);
    return (
      <Stage>
        <Sidebar {...args} collapsed={collapsed} onToggleCollapse={toggle} />
      </Stage>
    );
  },
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
 * Every rail fully expanded — each section with sub-items open — for the
 * user type picked in the controls. `Archive` is in every rail but Super
 * Admin's, `Planning` only in Admin Dev's. Open, a group lifts onto an
 * elevated card — `SidebarItem` does that, not this.
 */
export const FullyExpanded: Story = {
  args: { userType: 'admin-dev' },
  argTypes: { showDomainSelector: { control: false } },
  render: function Render(args) {
    const [collapsed, toggle] = useCollapseToggle(args.collapsed);
    const userType = args.userType ?? 'user';
    const open = NAV_BY_USER_TYPE[userType].filter((i) => i.items?.length).map((i) => i.key);
    return (
      <Stage>
        {/* Keyed by user type: `defaultOpen` is a starting state, so switching
            rails in the controls remounts with that rail's sections open. */}
        <Sidebar
          key={userType}
          {...args}
          collapsed={collapsed}
          defaultOpen={open}
          onToggleCollapse={toggle}
        />
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
  render: function Render(args) {
    const [collapsed, toggle] = useCollapseToggle(args.collapsed);
    return (
      <Stage>
        <Sidebar {...args} collapsed={collapsed} onToggleCollapse={toggle} />
      </Stage>
    );
  },
};

/* Controls are off in the side-by-side story, so each rail keeps its own
   collapsed state and the two toggle independently. */
const ToggleableRail = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <Sidebar
      userType="admin"
      active="my-values"
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((c) => !c)}
    />
  );
};

/** Every fill is a token, so dark comes free. */
export const LightAndDark: Story = {
  parameters: { controls: { disable: true }, ...SIDE_BY_SIDE },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex h-screen bg-surface-canvas">
            <ToggleableRail />
          </div>
        </div>
      ))}
    </div>
  ),
};
