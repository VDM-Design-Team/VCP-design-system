import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarItem } from './SidebarItem';
import { Tooltip } from '../tooltip';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';

const meta = {
  title: 'Components/Navigation/SidebarItem',
  component: SidebarItem,
  parameters: {
    docs: {
      description: {
        component:
          'One row of the navigation rail — the piece `Sidebar` is built from. Renders a real ' +
          '`<a>` when given `href` and a `<button>` only for programmatic navigation; the ' +
          'export shipped a clickable `div`, which no keyboard could reach. The current row ' +
          'carries `aria-current="page"`, so the tinted fill is never the only signal.',
      },
    },
  },
  args: { label: 'Dashboard', icon: 'graph' },
  argTypes: {
    icon: { control: 'text' },
    selected: { control: 'boolean' },
    collapsed: { control: 'boolean' },
  },
} satisfies Meta<typeof SidebarItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/* A rail to sit the rows in, so states read against the surface they live on. */
const Rail = ({
  children,
  width = 'w-64',
}: {
  children: React.ReactNode;
  width?: string;
}) => (
  <div className={`${width} rounded-md border border-stroke-default bg-surface-elevated p-3`}>
    <nav className="flex flex-col gap-2">{children}</nav>
  </div>
);

/** The three states a row has: rest, hover, and the page you are on. */
export const States: Story = {
  render: () => (
    <Rail>
      <SidebarItem label="Dashboard" icon="graph" href="#" />
      <SidebarItem label="My Values" icon="list-bullets" href="#" selected />
      <SidebarItem label="Assigned" icon="eye" href="#" />
    </Rail>
  ),
};

/**
 * A row with `items` is a disclosure, not a link: it gains the chevron, and
 * opens its children onto an elevated card. `Archive` and `Planning` are the
 * two the design draws this way.
 */
export const Expandable: Story = {
  render: () => (
    <Rail>
      <SidebarItem label="Archive" icon="database" items={[{ label: 'Completed', href: '#' }]} />
      <SidebarItem
        label="Planning"
        icon="list-bullets"
        defaultOpen
        items={[
          { label: 'Planning List', href: '#' },
          { label: 'Gantt Chart', href: '#' },
          { label: 'Holiday Registry', href: '#' },
        ]}
      />
    </Rail>
  ),
};

/** Open with the parent itself current: the parent tints, children stay white. */
export const ExpandableSelected: Story = {
  render: () => (
    <Rail>
      <SidebarItem
        label="Planning"
        icon="list-bullets"
        selected
        defaultOpen
        items={[
          { label: 'Planning List', href: '#', selected: true },
          { label: 'Gantt Chart', href: '#' },
          { label: 'Holiday Registry', href: '#' },
        ]}
      />
    </Rail>
  ),
};

/**
 * The 76px rail. The label is hidden but survives as the accessible name, so
 * a screen reader still reads "Dashboard". Sighted users get it back from a
 * `Tooltip` — which `Sidebar` adds, not this component, because a tooltip on
 * every row of an expanded sidebar would be noise.
 */
export const Collapsed: Story = {
  render: () => (
    <Rail width="w-[76px]">
      {(
        [
          ['Dashboard', 'graph', false],
          ['My Values', 'list-bullets', true],
          ['Assigned', 'eye', false],
        ] as const
      ).map(([label, icon, selected]) => (
        <Tooltip key={label} content={label} placement="right">
          <SidebarItem label={label} icon={icon} href="#" collapsed selected={selected} />
        </Tooltip>
      ))}
    </Rail>
  ),
};

/**
 * A link by default — middle-click and copy-link work, and the browser owns
 * navigation. `onNavigate` renders a `<button>` instead, for the cases where
 * there is genuinely no URL.
 */
export const LinkOrButton: Story = {
  render: () => (
    <Rail>
      <SidebarItem label="Dashboard (link)" icon="graph" href="#dashboard" />
      <SidebarItem label="Dashboard (button)" icon="graph" onNavigate={() => {}} />
    </Rail>
  ),
};

/** A long label truncates rather than wrapping — the rail keeps its width. */
export const LongLabel: Story = {
  render: () => (
    <Rail>
      <SidebarItem label="Task Log Trail" icon="list-numbers" href="#" />
      <SidebarItem label="Assignee Availability and Planning" icon="users" href="#" />
    </Rail>
  ),
};

/** Every fill is a token, so dark comes free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen', ...SIDE_BY_SIDE },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex min-h-64 flex-col gap-4 bg-surface-canvas p-8">
            <Rail>
              <SidebarItem label="Dashboard" icon="graph" href="#" />
              <SidebarItem label="My Values" icon="list-bullets" href="#" selected />
              <SidebarItem label="Assigned" icon="eye" href="#" />
            </Rail>
          </div>
        </div>
      ))}
    </div>
  ),
};
