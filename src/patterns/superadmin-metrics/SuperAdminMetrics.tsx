import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Select } from '../../atoms/select';
import { Skeleton } from '../../atoms/skeleton';
import { DateField } from '../../components/date-field';
import { StatCard, StatCardGroup } from '../../components/stat-card';

/**
 * SuperAdminMetrics — the super admin dashboard's numbers for one domain and one month: who is doing what, how the
 * work is going, how reviews end. Built to Figma's `SuperAdmin_Dashboard_Metrics` (the `SuperAdmin Dashboard` page of
 * `VCP Pages & Flows`).
 *
 * - **The filters,** top right: a domain `Select` and a month `DateField`, both 40 high and 14rem wide.
 * - **Four cards** of single figures — Values Created, Values Completed, Overdue Value Rate, Active / Total Users — as
 *   `StatCard`s in their `superadmin` look, each with its accent stripe, icon and tooltip.
 * - **Two grouped cards** — Avg. Time (In Pending, In Review) and Review (Acceptance Rate, Values Rejected) — as
 *   `StatCardGroup`s.
 * - **The users card is the quiet one.** It is the least important figure, so it is a fixed 16.5rem where the other
 *   three share the rest of the row, and never wider than the row.
 * - **It reflows with its own width** (a container query): the cards wrap as they run out of room; the grouped cards
 *   sit side by side, then stack.
 *
 * **It owns no numbers.** Every figure arrives in `metrics`; what "overdue" or "active" means, and the arithmetic, are
 * the product's (the tooltips say so). A figure that cannot be worked out yet is `null` and reads "--": the Overdue
 * Value Rate with no Active Values, an average with nothing to average. A count with nothing to count is a real `0`.
 *
 * It is controlled: `domain` and `month` come in and `onDomainChange` / `onMonthChange` report a pick, so the page
 * fetches the new figures. While they load, pass `loading`: each figure becomes a placeholder and the section is
 * `aria-busy`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add
 * the token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface SuperAdminMetricsData {
  valuesCreated: number;
  valuesCompleted: number;
  /** Percent, or `null` when there are no Active Values to rate. */
  overdueRate: number | null;
  activeUsers: number;
  totalUsers: number;
  /** Days, or `null` when there is nothing to average. */
  avgPendingDays: number | null;
  avgReviewDays: number | null;
  /** Percent, or `null` when no Values have been reviewed. */
  acceptanceRate: number | null;
  valuesRejected: number;
}

export interface SuperAdminMetricsHints {
  valuesCreated: string;
  valuesCompleted: string;
  overdueRate: string;
  users: string;
  avgPending: string;
  avgReview: string;
  acceptanceRate: string;
  valuesRejected: string;
}

/** What each figure's ⓘ says, from Figma. Override any with `hints`. */
export const SUPERADMIN_METRIC_HINTS = {
  valuesCreated: 'Count of Values created in Domain during selected month',
  valuesCompleted: 'Count of Values marked Completed in selected month',
  overdueRate:
    'Percentage of Active(In Progress) Values past their planned completion date: (Overdue Values ÷ Active Values) x 100',
  users:
    'Count of unique users from total users in the Domain who created, updated, or completed a Value in the selected period',
  avgPending: 'Average of: (Accepted date OR Rejected date) – Submitted date',
  avgReview: 'Average of: Review decision date – Completion date',
  acceptanceRate: '(Accepted reviews ÷ Total reviewed Values) × 100',
  valuesRejected: 'Count of Rejected Values in Domain during selected Month',
} as const satisfies SuperAdminMetricsHints;

export interface SuperAdminMetricsProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'onChange'> {
  metrics: SuperAdminMetricsData;
  /** The domains the filter offers, named as they should read ("Development Domain"). */
  domains: readonly string[];
  domain: string;
  onDomainChange?: (domain: string) => void;
  /** The month shown, as any ISO date inside it. */
  month: string;
  /** The first of the chosen month, ISO. */
  onMonthChange?: (month: string) => void;
  /** The figures are on their way: placeholders instead of numbers. */
  loading?: boolean;
  hints?: Partial<SuperAdminMetricsHints>;
}

/* A figure, or the "--" of one that cannot be worked out yet. */
const figure = (n: number | null) => (n === null ? '--' : String(n));

export const SuperAdminMetrics = React.forwardRef<HTMLElement, SuperAdminMetricsProps>(
  (
    { className, metrics, domains, domain, onDomainChange, month, onMonthChange, loading, hints, ...props },
    ref,
  ) => {
    const tip = { ...SUPERADMIN_METRIC_HINTS, ...hints };
    /* Placeholder for a figure while it loads: as tall as the figure's line, and quiet. */
    const value = (n: number | null) => (loading ? <Skeleton width={56} height={32} /> : figure(n));
    const icon = (name: React.ComponentProps<typeof Icon>['name']) => <Icon name={name} size="lg" />;

    return (
      <section
        ref={ref}
        aria-label="Domain metrics"
        aria-busy={loading || undefined}
        className={cn('@container flex flex-col gap-4 font-sans', className)}
        {...props}
      >
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Select
            size="md"
            aria-label="Domain"
            className="w-56"
            value={domain}
            options={domains}
            onChange={onDomainChange}
          />
          <DateField mode="month" aria-label="Month" className="w-56" value={month} onChange={onMonthChange} />
        </div>

        <div className="flex flex-wrap gap-4">
          <StatCard
            className="min-w-60 flex-1"
            variant="superadmin"
            accent="info"
            label="Values Created"
            hint={tip.valuesCreated}
            icon={icon('note-pencil-fill')}
            value={value(metrics.valuesCreated)}
          />
          <StatCard
            className="min-w-60 flex-1"
            variant="superadmin"
            accent="success"
            label="Values Completed"
            hint={tip.valuesCompleted}
            icon={icon('check-square-fill')}
            value={value(metrics.valuesCompleted)}
          />
          <StatCard
            className="min-w-60 flex-1"
            variant="superadmin"
            accent="critical"
            label="Overdue Value Rate"
            hint={tip.overdueRate}
            icon={icon('calendar-x-fill')}
            value={value(metrics.overdueRate)}
            unit="%"
          />
          <StatCard
            className="w-66 max-w-full flex-none"
            variant="superadmin"
            accent="neutral"
            label="Active / Total Users"
            hint={tip.users}
            icon={icon('users-fill')}
            value={value(metrics.activeUsers)}
            unit={`/ ${loading ? '--' : metrics.totalUsers}`}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-2">
          <StatCardGroup
            title="Avg. Time"
            items={[
              {
                label: 'In Pending',
                accent: 'yellow',
                hint: tip.avgPending,
                icon: icon('clock-fill'),
                value: value(metrics.avgPendingDays),
                unit: 'days',
              },
              {
                label: 'In Review',
                accent: 'info',
                hint: tip.avgReview,
                icon: icon('chat-dots-fill'),
                value: value(metrics.avgReviewDays),
                unit: 'days',
              },
            ]}
          />
          <StatCardGroup
            title="Review"
            items={[
              {
                label: 'Acceptance Rate',
                accent: 'info',
                hint: tip.acceptanceRate,
                icon: icon('thumbs-up-fill'),
                value: value(metrics.acceptanceRate),
                unit: '%',
              },
              {
                label: 'Values Rejected',
                accent: 'critical',
                hint: tip.valuesRejected,
                icon: icon('x-circle-fill'),
                value: value(metrics.valuesRejected),
              },
            ]}
          />
        </div>
      </section>
    );
  },
);
SuperAdminMetrics.displayName = 'SuperAdminMetrics';
