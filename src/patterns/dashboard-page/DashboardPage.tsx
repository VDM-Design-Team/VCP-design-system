import * as React from 'react';
import { cn } from '../../lib/cn';
import { CycleBurndown, type CycleBurndownProps } from '../cycle-burndown';
import { CyclePerformance, type CyclePerformanceProps } from '../cycle-performance';
import { CycleSummary, type CycleSummaryProps } from '../../components/cycle-summary';
import { DashboardFilters, type DashboardFiltersProps } from '../dashboard-filters';
import { DashboardHeader } from '../dashboard-header';
import { DomainBudgetSummary, type DomainBudgetSummaryProps } from '../../components/domain-budget-summary';
import { InCaseYouMissedIt, type InCaseYouMissedItProps } from '../in-case-you-missed-it';
import { SprintMetrics, type SprintMetricsProps } from '../../components/sprint-metrics';
import { TeamCapacity, type TeamCapacityProps } from '../team-capacity';
import { UserCapacity, type UserCapacityProps } from '../user-capacity';
import { ValueCards, type ValueCardsProps } from '../value-cards';

/**
 * DashboardPage — the main content of a dashboard: the title band (with the Cycle / Quarter switch and the filters) and the chosen view's cards in the
 * order Figma draws them. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's `Main Views: Cycle & Quarter`
 * (the Development admin's dashboard).
 *
 * - **Cycle view**, top to bottom: **Cycle Summary**, **Value Cards**, **In Case You Missed It**, **Team Capacity**, **User Capacity**, **Sprint Metrics**,
 *   **Cycle Burndown**. The global filters (`filters`) sit on the right of the title.
 * - **Quarter view**: **Domain Budget**, **Value Cards**, **Cycle Performance**. It has no global filters: the budget and the chart carry their own.
 *
 * **Typed sections.** The page passes each card's own props (`cycle.summary` is `CycleSummary`'s, `quarter.budget` is `DomainBudgetSummary`'s…), and this
 * puts them in order, 16 apart, 32 in from the sides. **A section shows only when the page gives it**, so a role is what the page passes: no `teamCapacity`
 * and no `filters.exportLabel` is a dashboard without team and export. The same goes for the views: pass only `cycle` and there is **no switch**, pass both and
 * the switch shows.
 *
 * **It is controlled and slot-free.** It fetches nothing and holds no data: every number, every filter value and every callback is the page's. It owns only
 * which view shows (controlled with `view`, or uncontrolled from `defaultView`). Changing the view moves no focus: it stays on the switch.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export type DashboardView = 'cycle' | 'quarter';

/** The cards of the Cycle view, in the order they are drawn. Each is that card's own props; leave one out and it is not drawn. */
export interface DashboardCycleSections {
  summary?: CycleSummaryProps;
  valueCards?: ValueCardsProps;
  missed?: InCaseYouMissedItProps;
  teamCapacity?: TeamCapacityProps;
  userCapacity?: UserCapacityProps;
  sprintMetrics?: SprintMetricsProps;
  burndown?: CycleBurndownProps;
}

/** The cards of the Quarter view, in the order they are drawn. */
export interface DashboardQuarterSections {
  budget?: DomainBudgetSummaryProps;
  valueCards?: ValueCardsProps;
  performance?: CyclePerformanceProps;
}

export interface DashboardPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The page's `h1`. Default "Dashboard". */
  title?: string;
  /** The Cycle view's cards. Leave it out and the dashboard has no Cycle view. */
  cycle?: DashboardCycleSections;
  /** The Quarter view's cards. Leave it out and the dashboard has no Quarter view. */
  quarter?: DashboardQuarterSections;
  /** The global filters (cycle, year, team, Reset, Export), on the right of the title, **in the Cycle view only**. */
  filters?: DashboardFiltersProps;
  /** Controlled: the view that is showing. If the dashboard has no such view, the first it has shows. */
  view?: DashboardView;
  /** Uncontrolled: the view to start on. */
  defaultView?: DashboardView;
  onViewChange?: (view: DashboardView) => void;
  /** The switch's accessible name. Default "Dashboard view". */
  viewsLabel?: string;
}

const LABEL: Record<DashboardView, string> = { cycle: 'Cycle', quarter: 'Quarter' };

export function DashboardPage({
  className,
  title = 'Dashboard',
  cycle,
  quarter,
  filters,
  view,
  defaultView,
  onViewChange,
  viewsLabel,
  ...props
}: DashboardPageProps) {
  const available = (['cycle', 'quarter'] as const).filter((v) => (v === 'cycle' ? cycle : quarter));
  const [own, setOwn] = React.useState<DashboardView | undefined>(defaultView);
  const wanted = view !== undefined ? view : own;
  /* A view the dashboard does not have (Quarter, on a Cycle-only dashboard) falls back to the first it does have. */
  const active = wanted !== undefined && available.includes(wanted) ? wanted : available[0];

  const select = (next: string) => {
    const picked = next as DashboardView;
    if (view === undefined) setOwn(picked);
    onViewChange?.(picked);
  };

  return (
    <div className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <DashboardHeader
        title={title}
        views={available.length > 1 ? available.map((v) => ({ value: v, label: LABEL[v] })) : undefined}
        view={active}
        onViewChange={select}
        viewsLabel={viewsLabel}
        filters={active === 'cycle' && filters ? <DashboardFilters {...filters} /> : undefined}
      />
      <div className="flex min-w-0 flex-col gap-4 px-8 pb-8">
        {active === 'cycle' && cycle && (
          <>
            {cycle.summary && <CycleSummary {...cycle.summary} />}
            {cycle.valueCards && <ValueCards {...cycle.valueCards} />}
            {cycle.missed && <InCaseYouMissedIt {...cycle.missed} />}
            {cycle.teamCapacity && <TeamCapacity {...cycle.teamCapacity} />}
            {cycle.userCapacity && <UserCapacity {...cycle.userCapacity} />}
            {cycle.sprintMetrics && <SprintMetrics {...cycle.sprintMetrics} />}
            {cycle.burndown && <CycleBurndown {...cycle.burndown} />}
          </>
        )}
        {active === 'quarter' && quarter && (
          <>
            {quarter.budget && <DomainBudgetSummary {...quarter.budget} />}
            {quarter.valueCards && <ValueCards {...quarter.valueCards} />}
            {quarter.performance && <CyclePerformance {...quarter.performance} />}
          </>
        )}
      </div>
    </div>
  );
}
DashboardPage.displayName = 'DashboardPage';
