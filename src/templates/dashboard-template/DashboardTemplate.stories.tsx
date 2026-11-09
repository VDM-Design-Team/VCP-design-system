import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DashboardTemplate } from './DashboardTemplate';
import { Sidebar } from '../../patterns/sidebar';
import { TopBar } from '../../patterns/top-bar';
import { DashboardFilters } from '../../patterns/dashboard-filters';
import { Button } from '../../atoms/button';
import { useToolbarTheme } from '../../lib/story-theme';

/* These stories show what the template itself guarantees: where the title, the view switch, the filters and the sections go, and how they reflow. They use plain placeholder sections on purpose. Each role's
   real dashboard is an example, in `Templates / Dashboard / Examples`. */

const Rail = () => {
  const [active, setActive] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(false);
  return <Sidebar userType="admin-dev" active={active} onNavigate={setActive} collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />;
};

/* The bar's light/dark switch is linked to Storybook's own theme control, both ways. */
const Bar = () => {
  const theme = useToolbarTheme();
  return <TopBar primaryAction={<Button>Create Added Value</Button>} notifications={3} user={{ name: 'Francis Magallen' }} onUserMenu={() => {}} {...theme} />;
};

/* A stand-in for a section: a card the width of the page, which is all the template asks of one. */
const Section = ({ name, height = 'h-40' }: { name: string; height?: string }) => (
  <section aria-label={name} className={`flex ${height} items-center justify-center rounded-md bg-surface-elevated font-sans text-label-sm-medium text-text-secondary`}>
    {name}
  </section>
);

const Sections = () => (
  <>
    <Section name="Section one" />
    <Section name="Section two" height="h-56" />
    <Section name="Section three" />
  </>
);

const VIEWS = [
  { value: 'cycle', label: 'Cycle' },
  { value: 'quarter', label: 'Quarter' },
];

const SampleFilters = () => (
  <DashboardFilters
    filters={[
      { key: 'cycle', label: 'Cycle', value: 'C37', searchable: true, options: [{ value: 'C36', label: 'C36' }, { value: 'C37', label: 'C37' }], onChange: () => {} },
      { key: 'year', label: 'Year', value: '2026', options: ['2026', '2025'], onChange: () => {} },
    ]}
    onReset={() => {}}
    exportLabel="Export Report"
    onExport={() => {}}
  />
);

const meta = {
  title: 'Templates/Dashboard/Template',
  component: DashboardTemplate,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The dashboard page: the app shell, a title band with an optional view switch beside the title and the filters on its right, then the sections stacked 16 apart. It arranges and nothing more: it does not know roles, and it takes the sections as `children`. The stories here use placeholder sections; each role\'s dashboard, composed from the real patterns, is an example under Templates / Dashboard / Examples.',
      },
    },
  },
  args: { sidebar: <Rail />, topBar: <Bar />, children: <Sections /> },
  argTypes: { sidebar: { control: false }, topBar: { control: false }, children: { control: false }, filters: { control: false } },
} satisfies Meta<typeof DashboardTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The title and the sections, stacked 16 apart. No switch and no filters when none are given. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    await expect(c.queryByRole('radiogroup')).toBeNull();
    await expect(c.queryByRole('group', { name: 'Dashboard filters' })).toBeNull();
    for (const name of ['Section one', 'Section two', 'Section three']) await expect(c.getByRole('region', { name })).toBeInTheDocument();
  },
};

/** `views` puts a switch beside the title (36 high, as the filters are); the page decides what each view shows. */
export const WithViewSwitch: Story = {
  render: (args) => {
    const [view, setView] = React.useState('cycle');
    return (
      <DashboardTemplate {...args} views={VIEWS} view={view} onViewChange={setView}>
        {view === 'cycle' ? <Sections /> : <Section name="Quarter view" height="h-72" />}
      </DashboardTemplate>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const views = c.getByRole('radiogroup', { name: 'Dashboard view' });
    await expect(within(views).getByRole('radio', { name: 'Cycle' })).toBeChecked();
    await expect(Math.round(views.getBoundingClientRect().height)).toBe(36);
    await userEvent.click(within(views).getByRole('radio', { name: 'Quarter' }));
    await expect(await c.findByRole('region', { name: 'Quarter view' })).toBeInTheDocument();
    /* And back, so the story opens on (and rests at) the first view. */
    await userEvent.click(within(views).getByRole('radio', { name: 'Cycle' }));
    await expect(await c.findByRole('region', { name: 'Section one' })).toBeInTheDocument();
  },
};

/** `filters` sit in the title row, on the right, level with the title and 36 high, as the view switch is. They appear once. (With a switch beside the title the band wraps when there is not room for both, and the filters drop below.) */
export const WithFilters: Story = {
  render: (args) => (
    <DashboardTemplate {...args} filters={<SampleFilters />}>
      <Sections />
    </DashboardTemplate>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const title = c.getByRole('heading', { level: 1, name: 'Dashboard' });
    const filters = c.getByRole('group', { name: 'Dashboard filters' });
    const band = title.closest('header') as HTMLElement;
    await expect(band).toContainElement(filters);
    await expect(Math.abs(filters.getBoundingClientRect().top - title.getBoundingClientRect().top)).toBeLessThan(24);
    /* Aligned to the right: the band's inner edge is 32 in. */
    await expect(Math.abs(band.getBoundingClientRect().right - 32 - filters.getBoundingClientRect().right)).toBeLessThan(4);
    await expect(new Set([...filters.children].map((el) => Math.round(el.getBoundingClientRect().height)))).toEqual(new Set([36]));
    await expect(c.getAllByRole('group', { name: 'Dashboard filters' })).toHaveLength(1);
  },
};

/** The sections reflow by their own width, so the page needs no breakpoints: in a 700 wide window (the rail still 256) nothing overflows. */
export const NarrowContent: Story = {
  render: (args) => (
    <div className="h-screen w-175">
      <DashboardTemplate {...args} views={VIEWS} view="cycle" onViewChange={() => {}} filters={<SampleFilters />}>
        <Sections />
      </DashboardTemplate>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const main = canvasElement.querySelector('main') as HTMLElement;
    await expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };
