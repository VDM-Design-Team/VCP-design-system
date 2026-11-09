import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { DashboardTemplate } from './DashboardTemplate';
import { Sidebar, type SidebarUserType } from '../../patterns/sidebar';
import { TopBar } from '../../patterns/top-bar';
import { DashboardFilters, type DashboardFilter } from '../../patterns/dashboard-filters';
import { ValueCards, type ValueCardItem } from '../../patterns/value-cards';
import { InCaseYouMissedIt, type InCaseYouMissedItItem } from '../../patterns/in-case-you-missed-it';
import { TeamCapacity } from '../../patterns/team-capacity';
import { UserCapacity } from '../../patterns/user-capacity';
import { CyclePerformance } from '../../patterns/cycle-performance';
import { CycleBurndown } from '../../patterns/cycle-burndown';
import { SuperAdminFilters, SuperAdminMetrics, type SuperAdminMetricsData } from '../../patterns/superadmin-metrics';
import { CycleSummary } from '../../components/cycle-summary';
import { SprintMetrics } from '../../components/sprint-metrics';
import { DomainBudgetSummary } from '../../components/domain-budget-summary';
import { Button } from '../../atoms/button';
import { useToolbarTheme } from '../../lib/story-theme';

/* ---- The shell: a rail and a bar per role -------------------------------------------------------------------------------------- */

const Rail = ({ userType }: { userType: SidebarUserType }) => {
  const [active, setActive] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(false);
  return <Sidebar userType={userType} active={active} onNavigate={setActive} collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />;
};

/* The bar's light/dark switch is linked to Storybook's own theme control, both ways. */
const Bar = ({ name = 'Francis Magallen' }: { name?: string }) => {
  const theme = useToolbarTheme();
  return <TopBar primaryAction={<Button>Create Added Value</Button>} notifications={3} user={{ name }} onUserMenu={() => {}} {...theme} />;
};

/* ---- Sample data: what a page would fetch ------------------------------------------------------------------------------------- */

const VALUE_ITEMS: ValueCardItem[] = [
  { key: 'overdue', label: 'Overdue', value: 3, accent: 'critical' },
  { key: 'in-progress', label: 'In Progress', value: 8, accent: 'brand' },
  { key: 'pending', label: 'Pending', value: 4, accent: 'yellow' },
  { key: 'draft', label: 'Draft', value: 5, accent: 'neutral' },
];
const VALUE_FILTER = { label: 'Show', value: 'Assigned', options: ['Assigned', 'Created', 'All'], onChange: () => {} };

const TITLE = 'Revamp customer onboarding documentation';
const ICYMI: InCaseYouMissedItItem[] = [
  { id: 'av-1', type: 'overdue', title: TITLE, user: { name: 'John Smith' }, created: '6 months ago', days: 12 },
  { id: 'av-2', type: 'due-soon', title: TITLE, user: { name: 'John Smith' }, created: '6 months ago', days: 2 },
  { id: 'av-3', type: 'awaiting-review', title: TITLE, user: { name: 'John Smith' }, created: '6 months ago', days: 9 },
  { id: 'av-4', type: 'pending', title: TITLE, user: { name: 'John Smith' }, created: '6 months ago', days: 7 },
];

const TEAM = [
  { series: 'completed', value: 60 },
  { series: 'committed', value: 30 },
  { series: 'overdue', value: 30 },
  { series: 'available', value: 60 },
] as const;
const person = (name: string) => ({ id: name, name, segments: [{ series: 'completed', value: 15 }, { series: 'committed', value: 15 }] as const });
const MEMBERS = ['John', 'Jiriko Jan Lapa', 'Francis Magallen', 'Winston Fale', 'Earl'].map(person);

const SPRINTS = [
  { key: 1, label: 'Jan 18 - Feb 1', values: { available: 120, committed: 96, completed: 88, overdue: 8 } },
  { key: 2, label: 'Feb 1 - Feb 15', values: { available: 120, committed: 110, completed: 104, overdue: 6 } },
  { key: 3, label: 'Feb 15 - Mar 1', values: { available: 120, committed: 92, completed: 60, overdue: 32 } },
  { key: 4, label: 'Mar 1 - Mar 15', values: { available: 120, committed: 100 } },
];

const DAYS = ['June 16', 'June 17', 'June 18', 'June 19', 'June 20', 'June 23', 'June 24', 'June 25', 'June 26'];
const BURNDOWN = DAYS.map((label, i) => ({
  key: label,
  label,
  title: `06.${label.slice(5)}.2025`,
  values: { completed: [175, 150, 162, 158, 100, 70, 45, 30, 20][i], committed: [180, 160, 140, 120, 100, 80, 60, 40, 20][i], overdue: [12, 14, 18, 25, 20, 16, 10, 6, 2][i], available: [150, 135, 120, 105, 90, 75, 60, 45, 30][i] },
}));
const BURNDOWN_STATS = [
  { key: 'completed', label: 'Completed', value: 168, tone: 'success' as const },
  { key: 'remaining', label: 'Remaining', value: 0, tone: 'brand' as const },
  { key: 'off-track', label: 'Off-track', value: 0, tone: 'critical' as const },
];

const CYCLES = [
  { key: 1, label: 'Jan C23', values: { available: 130, completed: 140, overdue: 30 } },
  { key: 2, label: 'Jan C24', values: { available: 115, completed: 125, overdue: 20 } },
  { key: 3, label: 'Feb C25', values: { available: 157, completed: 120, overdue: 46 } },
  { key: 4, label: 'Feb C26', values: { available: 139, completed: 66 } },
  { key: 5, label: 'Mar C27', values: { available: 104, completed: 146, overdue: 15 } },
  { key: 6, label: 'Mar C28', values: { available: 125, completed: 112, overdue: 25 } },
  { key: 7, label: 'Mar C29', values: { available: 125, completed: 112, overdue: 25 } },
];

const METRICS: SuperAdminMetricsData = {
  valuesCreated: 25,
  valuesCompleted: 31,
  overdueRate: 26,
  activeUsers: 12,
  totalUsers: 15,
  avgPendingDays: 9.2,
  avgReviewDays: 6.5,
  acceptanceRate: 95,
  valuesRejected: 3,
};

const globalFilters = (withTeam: boolean): DashboardFilter[] => [
  { key: 'cycle', label: 'Cycle', value: 'C37', searchable: true, options: [
    { value: 'C33', label: 'C33 (May 25, 2026 - Jun 08, 2026)' },
    { value: 'C34', label: 'C34 (Jun 08, 2026 - Jun 22, 2026)' },
    { value: 'C35', label: 'C35 (Jun 22, 2026 - Jul 06, 2026)' },
    { value: 'C36', label: 'C36 (Jul 06, 2026 - Jul 20, 2026)' },
    { value: 'C37', label: 'C37 (Jul 20, 2026 - Aug 03, 2026)' },
    { value: 'C38', label: 'C38 (Aug 03, 2026 - Aug 17, 2026)' },
    { value: 'C39', label: 'C39 (Aug 17, 2026 - Aug 31, 2026)' },
  ], onChange: () => {} },
  { key: 'year', label: 'Year', value: '2026', options: ['2026', '2025'], onChange: () => {} },
  ...(withTeam ? [{ key: 'team', label: 'Team', value: 'All Teams', options: ['All Teams', 'Platform', 'Growth'], onChange: () => {} }] : []),
];
const Filters = ({ withTeam = true, withExport = true }: { withTeam?: boolean; withExport?: boolean }) => (
  <DashboardFilters
    filters={globalFilters(withTeam)}
    onReset={() => {}}
    {...(withExport ? { exportLabel: 'Export Cycle Report', exportOptions: [{ key: 'pdf', label: 'PDF' }, { key: 'csv', label: 'CSV' }], onExport: () => {} } : {})}
  />
);

/* ---- The sections each role sees, as the Figma pages draw them -------------------------------------------------------------- */

const DevAdminCycle = () => (
  <>
    <CycleSummary committed={180} completed={142} carriedOver={38} completion={90} />
    <ValueCards items={VALUE_ITEMS} filter={VALUE_FILTER} />
    <InCaseYouMissedIt items={ICYMI} hint="Added Values that have been waiting on you." onOpen={() => {}} />
    <TeamCapacity segments={TEAM} remaining={60} hint="How the team's capacity for this cycle is spent." />
    <UserCapacity members={MEMBERS} hint="How each person's capacity is spent." />
    <SprintMetrics data={SPRINTS} description="Current: Mar 1 - Mar 15" />
    <CycleBurndown data={BURNDOWN} stats={BURNDOWN_STATS} hint="How the cycle's points burned down day by day." />
  </>
);

const DevAdminQuarter = () => (
  <>
    <DomainBudgetSummary allocated={120} consumed={70} quarter={1} year={2026} years={[2026, 2025]} period={{ kind: 'current', endsOn: 'Mar 31', daysLeft: 48, daysTotal: 90 }} onQuarterChange={() => {}} onYearChange={() => {}} />
    <ValueCards items={[{ key: 'overdue', label: 'Overdue', value: 4, accent: 'critical' }, { key: 'in-progress', label: 'In Progress', value: 34, accent: 'brand' }, { key: 'pending', label: 'Pending', value: 12, accent: 'yellow' }, { key: 'draft', label: 'Draft', value: 5, accent: 'neutral' }]} filter={VALUE_FILTER} />
    <CyclePerformance
      data={CYCLES}
      filters={[
        { key: 'who', label: 'Show', value: 'All', options: ['All', 'Mine', 'Earl', 'Winston Fale'], onChange: () => {} },
        { key: 'quarter', label: 'Quarter', value: 'Q1', options: ['Q1', 'Q2', 'Q3', 'Q4'], onChange: () => {}, className: 'w-24' },
        { key: 'year', label: 'Year', value: '2026', options: ['2026', '2025'], onChange: () => {} },
      ]}
    />
  </>
);

const DevUserCycle = () => (
  <>
    <ValueCards items={VALUE_ITEMS} />
    <TeamCapacity title="My Capacity" segments={[{ series: 'completed', value: 15 }, { series: 'committed', value: 10 }, { series: 'available', value: 5 }]} remaining={5} />
    <CycleBurndown title="My Cycle Burndown" data={BURNDOWN} stats={BURNDOWN_STATS} series={['completed', 'committed']} />
  </>
);

const DevUserQuarter = () => (
  <>
    <ValueCards items={VALUE_ITEMS} />
    {/* The Quarter view has no global bar, so the chart keeps its own quarter and year; no "whose": it is already theirs. */}
    <CyclePerformance
      title="My Cycle Performance"
      data={CYCLES}
      filters={[
        { key: 'quarter', label: 'Quarter', value: 'Q1', options: ['Q1', 'Q2', 'Q3', 'Q4'], onChange: () => {}, className: 'w-24' },
        { key: 'year', label: 'Year', value: '2026', options: ['2026', '2025'], onChange: () => {}, className: 'w-28' },
      ]}
    />
  </>
);

const DesignUser = () => (
  <>
    <ValueCards items={VALUE_ITEMS} />
    <InCaseYouMissedIt items={ICYMI} hint="Added Values that have been waiting on you." onOpen={() => {}} />
  </>
);

const VIEWS = [
  { value: 'cycle', label: 'Cycle' },
  { value: 'quarter', label: 'Quarter' },
];

/* A page with its view switch wired, as a real one would be. */
const Switching = ({ cycle, quarter, filters }: { cycle: React.ReactNode; quarter: React.ReactNode; filters: boolean }) => {
  const [view, setView] = React.useState('cycle');
  return (
    <DashboardTemplate sidebar={<Rail userType="admin-dev" />} topBar={<Bar />} views={VIEWS} view={view} onViewChange={setView} filters={filters && view === 'cycle' ? <Filters /> : undefined}>
      {view === 'cycle' ? cycle : quarter}
    </DashboardTemplate>
  );
};

const meta = {
  title: 'Templates/Dashboard/Examples',
  component: DashboardTemplate,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Examples, not the library: each role\'s dashboard composed from the real patterns around `DashboardTemplate`, as the Figma pages draw them. The template only arranges (the shell, the title band with a view switch and filters, the sections); which sections a role sees is the product\'s decision and lives in these compositions, with example data. Treat them as illustrations of how to use the template, not as a spec: when the product changes what a role sees, these follow, and `DashboardTemplate` does not change. The template\'s own stories are under Templates / Dashboard / Template.',
      },
    },
  },
  args: { sidebar: null, topBar: null, children: null },
  argTypes: { sidebar: { control: false }, topBar: { control: false }, children: { control: false }, filters: { control: false } },
} satisfies Meta<typeof DashboardTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

/** **Development admin.** Cycle view: the cycle's summary, the value cards, in case you missed it, then team and user capacity, sprint metrics and the burndown. The global filters are on the right; the Cycle / Quarter switch beside the title swaps the sections (Quarter: the budget, the value cards, cycle performance). */
export const DevelopmentAdmin: Story = {
  render: () => <Switching cycle={<DevAdminCycle />} quarter={<DevAdminQuarter />} filters />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    await expect(c.getByRole('region', { name: 'Team Capacity' })).toBeInTheDocument();
  },
};

/** **Development admin, Quarter view** on its own: the budget, the value cards and cycle performance, with that chart's own filters (there is no global bar on this view). */
export const DevelopmentAdminQuarter: Story = {
  render: () => (
    <DashboardTemplate sidebar={<Rail userType="admin-dev" />} topBar={<Bar />} views={VIEWS} view="quarter" onViewChange={fn()}>
      <DevAdminQuarter />
    </DashboardTemplate>
  ),
};

/** **Super admin.** One view, so no switch and no global bar. Its two filters (the domain and the month) sit **in the title row, aligned to the right**, 36 high, level with the development admin's, and the metrics draw only the cards. */
export const SuperAdmin: Story = {
  render: () => {
    const [domain, setDomain] = React.useState('Development Domain');
    const [month, setMonth] = React.useState('2026-09-01');
    const domains = ['Development Domain', 'Design Domain'];
    return (
      <DashboardTemplate
        sidebar={<Rail userType="super-admin" />}
        topBar={<Bar name="Super Admin" />}
        filters={<SuperAdminFilters size="compact" domains={domains} domain={domain} onDomainChange={setDomain} month={month} onMonthChange={setMonth} />}
      >
        <SuperAdminMetrics filters={false} metrics={METRICS} domains={domains} domain={domain} month={month} />
      </DashboardTemplate>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  },
};

/** **Development user.** Cycle view: the value cards, *My* Capacity and *My* Cycle Burndown (the same patterns, titled for the person, and with the lines that matter to one person). Quarter view: the value cards and *My* Cycle Performance. */
export const DevelopmentUser: Story = {
  render: () => {
    const [view, setView] = React.useState('cycle');
    return (
      <DashboardTemplate sidebar={<Rail userType="user" />} topBar={<Bar />} views={VIEWS} view={view} onViewChange={setView} filters={view === 'cycle' ? <Filters withTeam={false} withExport={false} /> : undefined}>
        {view === 'cycle' ? <DevUserCycle /> : <DevUserQuarter />}
      </DashboardTemplate>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('region', { name: 'My Capacity' })).toBeInTheDocument();
  },
};

/** **Design user.** The value cards and in case you missed it, with no switch and no filters. */
export const DesignUserView: Story = {
  name: 'Design user',
  render: () => (
    <DashboardTemplate sidebar={<Rail userType="user" />} topBar={<Bar name="Dana Design" />}>
      <DesignUser />
    </DashboardTemplate>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Value Cards' })).toBeInTheDocument();
    await expect(c.getByRole('region', { name: 'In Case You Missed it' })).toBeInTheDocument();
    await expect(c.queryByRole('radiogroup')).toBeNull();
  },
};
