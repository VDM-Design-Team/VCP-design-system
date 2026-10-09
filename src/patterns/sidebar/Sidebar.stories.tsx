import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
/* Storybook's own hooks, not React's: a story function can't mix the two,
   and `useArgs` is a Storybook hook. */
import { useArgs, useEffect, useState, useStoryContext } from 'storybook/preview-api';
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

/* The floating double-chevron really collapses and expands the rail. Each
   story keeps its own state. On a story's own page it also writes the
   `collapsed` arg and follows it, so the Controls panel and the button stay
   in step. On a Docs page it doesn't write the arg: there Storybook
   re-renders only the primary story on an arg change, and Default appears
   twice sharing one set of args, so writing it made the toggles fight. */
const useCollapseToggle = (fromArgs?: boolean) => {
  const [, updateArgs] = useArgs<{ collapsed?: boolean }>();
  const { viewMode } = useStoryContext();
  const [collapsed, setCollapsed] = useState(!!fromArgs);
  useEffect(() => setCollapsed(!!fromArgs), [fromArgs]);
  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (viewMode !== 'docs') updateArgs({ collapsed: next });
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
    /* The row is as tall as its tallest rail, not the window: a fixed
       `h-screen` let the longer rails spill past their border whenever the
       preview was shorter than them. The columns stretch to that one height
       and each rail fills its column (`flex-1`), so every rail is the same
       height and "Report a problem" sits at the bottom of each — the gap
       above it, at least the rail's own 32, shows it is pinned there. */
    <div className="flex gap-6 overflow-x-auto bg-surface-canvas p-6">
      {(['user', 'admin', 'admin-dev', 'super-admin'] as SidebarUserType[]).map((t) => (
        <div key={t} className="flex flex-col gap-2">
          <p className="text-label-sm-medium text-text-tertiary">{t}</p>
          <Sidebar userType={t} active="dashboard" className="flex-1 rounded-md border" />
        </div>
      ))}
    </div>
  ),
};

/**
 * The 76-wide rail. Every row hugs its glyph, keeps its name in a tooltip
 * and in `aria-label`, and a row with sub-items shows a small chevron — opening it
 * shows a flyout beside the row (`Archive`, held open here) rather than growing it.
 */
export const Collapsed: Story = {
  args: { collapsed: true, defaultOpen: ['archive'] },
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
    /* As tall as the rails' content, not the window, so nothing spills out of
       a short preview — see Every User Type. */
    <div className="flex gap-6 bg-surface-canvas p-6">
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
