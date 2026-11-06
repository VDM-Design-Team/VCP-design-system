import * as React from 'react';
import { cn } from '../../lib/cn';
import { PageTitle } from '../../components/page-title';
import { SegmentedControl } from '../../atoms/segmented-control';
import { AppShell, type AppShellProps } from '../app-shell';

/**
 * DashboardTemplate — the dashboard page: the app shell, a title band with an optional **view switch** beside the title (Cycle /
 * Quarter) and the **global filters** on its right, then the sections, stacked 16 apart. Read off the Figma `Main Views: Cycle &
 * Quarter` and `SuperAdmin Dashboard Examples`.
 *
 * - **One layout for every role and domain.** What differs between a dev admin, a dev user, a design user and the super admin is *which
 *   sections* they see, not how the page is arranged, so this template takes the sections as `children` and does not know roles. The
 *   role-by-role compositions are the stories, and `docs/dashboard-template.md` has the matrix.
 * - **The sections are patterns, each a full-width card** (`CycleSummary`, `ValueCards`, `InCaseYouMissedIt`, `TeamCapacity`,
 *   `UserCapacity`, `SprintMetrics`, `CycleBurndown`, `DomainBudgetSummary`, `CyclePerformance`, `SuperAdminMetrics`). Each reflows by
 *   its own width (a container query), so the page needs no breakpoints of its own: in the narrow view the cards simply stack.
 * - **The view switch is yours to wire.** Pass `views`, `view` and `onViewChange`, and render the sections of the chosen view as
 *   `children`. A dashboard with one view (the super admin's) passes none, and there is no switch.
 * - **The filters are a slot** (`filters`, usually a `DashboardFilters`), so a page that has none, or has its own inside a section,
 *   leaves it out.
 * - **The shell is `AppShell`'s**: pass `sidebar` and `topBar`; the rail and bar stay put and the page scrolls.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DashboardView {
  value: string;
  label: string;
}

export interface DashboardTemplateProps extends Omit<AppShellProps, 'header' | 'title'> {
  /** The page's `h1`. */
  title?: string;
  /** The views the dashboard has ("Cycle", "Quarter"). Leave it out for a dashboard with one. */
  views?: readonly DashboardView[];
  /** The chosen view's `value`. */
  view?: string;
  onViewChange?: (view: string) => void;
  /** The group's accessible name. */
  viewsLabel?: string;
  /** The global filters, on the right of the title: a `DashboardFilters`. */
  filters?: React.ReactNode;
}

export const DashboardTemplate = React.forwardRef<HTMLDivElement, DashboardTemplateProps>(
  ({ title = 'Dashboard', views, view, onViewChange, viewsLabel = 'Dashboard view', filters, children, className, ...shell }, ref) => (
    <AppShell
      ref={ref}
      className={className}
      header={
        <PageTitle
          title={title}
          beside={views && views.length > 0 ? <SegmentedControl size="md" aria-label={viewsLabel} options={views.map((v) => ({ value: v.value, label: v.label }))} value={view} onChange={onViewChange} /> : undefined}
          actions={filters}
        />
      }
      {...shell}
    >
      <div className={cn('flex flex-col gap-4')}>{children}</div>
    </AppShell>
  ),
);
DashboardTemplate.displayName = 'DashboardTemplate';
