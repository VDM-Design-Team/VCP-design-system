import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFilters, type DashboardFilter } from '../dashboard-filters';
import { SuperAdminFilters } from '../superadmin-metrics';

const VIEWS = [
  { value: 'cycle', label: 'Cycle' },
  { value: 'quarter', label: 'Quarter' },
];

const CYCLES = [
  { value: 'C36', label: 'C36 (Jul 06, 2026 - Jul 20, 2026)' },
  { value: 'C37', label: 'C37 (Jul 20, 2026 - Aug 03, 2026)' },
  { value: 'C38', label: 'C38 (Aug 03, 2026 - Aug 17, 2026)' },
];

const globalFilters = (withTeam: boolean): DashboardFilter[] => [
  { key: 'cycle', label: 'Cycle', value: 'C37', searchable: true, options: CYCLES, onChange: () => {} },
  { key: 'year', label: 'Year', value: '2026', options: ['2026', '2025'], onChange: () => {} },
  ...(withTeam ? [{ key: 'team', label: 'Team', value: 'All Teams', options: ['All Teams', 'Platform', 'Growth'], onChange: () => {} }] : []),
];

/* The band sits on the page's own background, as it does under the top bar. */
const Page = ({ children }: { children: React.ReactNode }) => <div className="min-h-40 bg-surface-canvas font-sans">{children}</div>;

const mid = (el: Element) => el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2;

const meta = {
  title: 'Patterns/DashboardHeader',
  component: DashboardHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The band at the top of a dashboard: the title, an optional Cycle / Quarter switch beside it, and the role\'s filters on its right. One header for every role: the switch is data (`views`) and the filters are a slot, so the role is what you put in. The stories compose each role as the Figma dashboards draw it.',
      },
    },
  },
  decorators: [(Story) => <Page><Story /></Page>],
} satisfies Meta<typeof DashboardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** **Development admin.** The Cycle / Quarter switch beside the title and the global filters on the right: cycle, year, team, Reset Filters and an Export menu. The Quarter view has no global bar (its chart has its own filters), so the filters leave with it. */
export const DevelopmentAdmin: Story = {
  render: () => {
    const [view, setView] = React.useState('cycle');
    return (
      <DashboardHeader
        views={VIEWS}
        view={view}
        onViewChange={setView}
        filters={view === 'cycle' ? <DashboardFilters filters={globalFilters(true)} onReset={() => {}} exportLabel="Export Cycle Report" exportOptions={[{ key: 'pdf', label: 'PDF' }, { key: 'csv', label: 'CSV' }]} onExport={() => {}} /> : undefined}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    const views = c.getByRole('radiogroup', { name: 'Dashboard view' });
    await expect(within(views).getByRole('radio', { name: 'Cycle' })).toBeChecked();
    /* The switch is 36 high, the same as the filters' selects. */
    await expect(Math.round(views.getBoundingClientRect().height)).toBe(36);
    await expect(Math.round((c.getByRole('combobox', { name: 'Team' }).parentElement as HTMLElement).getBoundingClientRect().height)).toBe(36);
    await expect(c.getByRole('group', { name: 'Dashboard filters' })).toBeInTheDocument();
    /* The Quarter view drops the global filters, and back. */
    await userEvent.click(within(views).getByRole('radio', { name: 'Quarter' }));
    await expect(c.queryByRole('group', { name: 'Dashboard filters' })).toBeNull();
    await userEvent.click(within(views).getByRole('radio', { name: 'Cycle' }));
    await expect(await c.findByRole('group', { name: 'Dashboard filters' })).toBeInTheDocument();
  },
};

/** **Development user.** The same switch; the Cycle view keeps the global filters without the team (they see their own) and without the export. */
export const DevelopmentUser: Story = {
  render: () => {
    const [view, setView] = React.useState('cycle');
    return <DashboardHeader views={VIEWS} view={view} onViewChange={setView} filters={view === 'cycle' ? <DashboardFilters filters={globalFilters(false)} onReset={() => {}} /> : undefined} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('group', { name: 'Dashboard filters' })).toBeInTheDocument();
    await expect(c.queryByRole('combobox', { name: 'Team' })).toBeNull();
    await expect(c.queryByRole('button', { name: /Export/ })).toBeNull();
  },
};

/** **Super admin.** One view, so no switch. Its two filters (the domain and the month) sit in the title row, aligned to the right, 36 high and on the title's centre line. */
export const SuperAdmin: Story = {
  render: () => {
    const [domain, setDomain] = React.useState('Development Domain');
    const [month, setMonth] = React.useState('2026-09-01');
    return <DashboardHeader filters={<SuperAdminFilters size="compact" domains={['Development Domain', 'Design Domain']} domain={domain} onDomainChange={setDomain} month={month} onMonthChange={setMonth} />} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const title = c.getByRole('heading', { level: 1, name: 'Dashboard' });
    await expect(c.queryByRole('radiogroup')).toBeNull();
    const filters = c.getByRole('group', { name: 'Dashboard filters' });
    const band = title.closest('header') as HTMLElement;
    await expect(band).toContainElement(filters);
    /* On one centre line, and aligned to the right (the band's inner edge is 32 in). */
    await expect(Math.abs(mid(filters) - mid(title))).toBeLessThan(2);
    await expect(Math.abs(band.getBoundingClientRect().right - 32 - filters.getBoundingClientRect().right)).toBeLessThan(4);
    await expect(new Set([...filters.children].map((el) => Math.round(el.getBoundingClientRect().height)))).toEqual(new Set([36]));
  },
};

/** **Design user.** The title alone: no switch and no filters. */
export const DesignUser: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    await expect(c.queryByRole('radiogroup')).toBeNull();
    await expect(c.queryByRole('group', { name: 'Dashboard filters' })).toBeNull();
  },
};

/** When the title, the switch and the filters do not fit on one line, the band wraps (the filters drop below, still right-aligned) rather than overflowing. */
export const Narrow: Story = {
  render: () => (
    <div className="w-175">
      <DashboardHeader views={VIEWS} view="cycle" onViewChange={() => {}} filters={<DashboardFilters filters={globalFilters(true)} onReset={() => {}} exportLabel="Export Cycle Report" onExport={() => {}} />} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector('header') as HTMLElement;
    await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' }, render: DevelopmentAdmin.render };
