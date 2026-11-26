import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarItem } from './SidebarItem';
import { Tooltip } from '../../atoms/tooltip';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';
import { expect, userEvent, within } from 'storybook/test';

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
 * A parent holding the current page: its child is selected, the parent itself is not. While the child is out
 * of sight the parent wears the selected fill (and `aria-current="true"`), so you can still tell where you are:
 * with its group closed, and always in the collapsed rail, where the children live in a flyout. Open inline,
 * the child shows itself and the parent goes plain.
 */
export const ParentHoldsSelected: Story = {
  parameters: { ...SIDE_BY_SIDE },
  render: () => (
    <div className="flex items-start gap-6">
      <Rail>
        <SidebarItem
          label="Planning"
          icon="list-bullets"
          items={[
            { label: 'Planning List', href: '#' },
            { label: 'Gantt Chart', href: '#', selected: true },
            { label: 'Holiday Registry', href: '#' },
          ]}
        />
      </Rail>
      <Rail width="w-[76px]">
        <SidebarItem
          label="Archive"
          icon="archive"
          collapsed
          items={[{ label: 'Completed', selected: true }, { label: 'Rejected' }, { label: 'Backlogs' }]}
        />
      </Rail>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /* Expanded rail, group closed: the parent says the page is inside it. */
    const planning = canvas.getByRole('button', { name: 'Planning' });
    await expect(planning).toHaveAttribute('aria-current', 'true');
    await expect(planning).toHaveClass('bg-surface-brand-subtle');
    /* Opened, the child shows itself; the parent goes plain. */
    await userEvent.click(planning);
    await expect(planning).not.toHaveAttribute('aria-current');
    await expect(planning).not.toHaveClass('bg-surface-brand-subtle');
    await expect(canvas.getByRole('link', { name: 'Gantt Chart' })).toHaveAttribute('aria-current', 'page');
    /* …with the same fill a selected top-level row wears. */
    await expect(canvas.getByRole('link', { name: 'Gantt Chart' })).toHaveClass('bg-surface-brand-subtle', 'text-body-sm-regular');
    await userEvent.click(planning);
    await expect(planning).toHaveAttribute('aria-current', 'true');
    /* Collapsed rail: the row is all there is to see, so it stays selected, flyout open or not. */
    const archive = canvas.getByRole('button', { name: 'Archive' });
    await expect(archive).toHaveAttribute('aria-current', 'true');
    await expect(archive).toHaveClass('bg-surface-brand-subtle');
    await userEvent.click(archive);
    await expect(archive).toHaveAttribute('aria-current', 'true');
    await userEvent.keyboard('{Escape}');
  },
};

/**
 * The 76px rail. The label is hidden but survives as the accessible name, so
 * a screen reader still reads "Dashboard". Sighted users get it back from a
 * `Tooltip` — which `Sidebar` adds, not this component, because a tooltip on
 * every row of an expanded sidebar would be noise. Every row fills the same 52
 * column, glyph left-aligned. `Archive` has sub-items: its caret is a filled 12
 * triangle right after the glyph, and opening it shows a flyout to the right —
 * held open here — rather than growing the row.
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
        <Tooltip key={label} content={label} placement="right" describe={false}>
          <SidebarItem label={label} icon={icon} href="#" collapsed selected={selected} />
        </Tooltip>
      ))}
      <Tooltip content="Archive" placement="right" describe={false}>
        <SidebarItem
          label="Archive"
          icon="archive"
          collapsed
          defaultOpen
          items={[
            { label: 'Completed', selected: true },
            { label: 'Rejected' },
            { label: 'Backlogs' },
          ]}
        />
      </Tooltip>
    </Rail>
  ),
};

/**
 * The collapsed disclosure, driven: a press opens the flyout beside the row,
 * Escape closes it and hands focus back to the row. A press outside closes it
 * too, and so does choosing an item.
 */
export const CollapsedFlyout: Story = {
  render: () => (
    <Rail width="w-[76px]">
      <SidebarItem
        label="Archive"
        icon="archive"
        collapsed
        items={[{ label: 'Completed' }, { label: 'Rejected' }, { label: 'Backlogs' }]}
      />
    </Rail>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Archive' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Completed')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByText('Rejected'));
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
  },
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
