import * as React from 'react';
import { PageTitle, type PageTitleProps } from '../../components/page-title';
import { SegmentedControl } from '../../atoms/segmented-control';

/**
 * DashboardHeader — the band at the top of a dashboard: the page's title, an optional **view switch** beside it (Cycle / Quarter), and the role's **filters** on its right. Read off the Figma
 * `Main Views: Cycle & Quarter` and `SuperAdmin Dashboard Examples`.
 *
 * - **One header for every role; the role is what you put in it.** A development admin has the Cycle / Quarter switch and the global filters with an export; a development user the same without the team and
 *   the export; the super admin has no switch and its own domain and month filters; a design user has the title alone. So the header takes the switch as data (`views`) and the filters as a slot (`filters`),
 *   and does not know roles. The stories compose each one.
 * - **The view switch is yours to wire.** Pass `views`, `view` and `onViewChange` and render the sections of the chosen view yourself. A dashboard with one view passes none, and there is no switch.
 * - **The filters are a slot**, usually a `DashboardFilters` or the super admin's `SuperAdminFilters`: they sit in the title row, aligned to the right and on the title's centre line. A page that has none, or
 *   keeps its own inside a section, leaves it out.
 * - **Every control is 36 high** (the switch is `md`, the selects `compact`, the buttons `sm`), as Figma draws the row, and the band wraps rather than overflowing when there is not room for both.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DashboardHeaderView {
  value: string;
  label: string;
}

export interface DashboardHeaderProps extends Omit<PageTitleProps, 'title' | 'beside' | 'actions'> {
  /** The page's `h1`. */
  title?: string;
  /** The views the dashboard has ("Cycle", "Quarter"). Leave it out for a dashboard with one. */
  views?: readonly DashboardHeaderView[];
  /** The chosen view's `value`. */
  view?: string;
  onViewChange?: (view: string) => void;
  /** The view switch's accessible name. */
  viewsLabel?: string;
  /** The filters, on the right of the title: a `DashboardFilters`, or the super admin's `SuperAdminFilters`. */
  filters?: React.ReactNode;
}

export const DashboardHeader = React.forwardRef<HTMLElement, DashboardHeaderProps>(
  ({ title = 'Dashboard', views, view, onViewChange, viewsLabel = 'Dashboard view', filters, ...props }, ref) => (
    <PageTitle
      ref={ref}
      title={title}
      beside={
        views && views.length > 0 ? (
          <SegmentedControl size="md" aria-label={viewsLabel} options={views.map((v) => ({ value: v.value, label: v.label }))} value={view} onChange={onViewChange} />
        ) : undefined
      }
      actions={filters}
      {...props}
    />
  ),
);
DashboardHeader.displayName = 'DashboardHeader';
