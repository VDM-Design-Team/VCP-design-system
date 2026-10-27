import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { LegendItem, type LegendItemProps } from '../../atoms/legend-item';
import { Select } from '../../atoms/select';
import { SearchSelect, type SearchSelectOption } from '../../components/search-select';
import { GanttTooltip, type GanttTooltipDetail } from '../../components/gantt-tooltip';
import { Tooltip } from '../../components/tooltip';
import {
  buildPeriod,
  columnIndex,
  place,
  toDay,
  type GanttCycle,
  type GanttPeriod,
  type GanttView,
} from './timeline';

export type { GanttCycle, GanttView } from './timeline';

/**
 * GanttChart — who is working on what, and when: people (or projects) down the
 * side, time across the top, and each Added Value drawn as a bar from its start
 * to its due date. Three views of the same data — one cycle by the day, a month
 * by the day, a year by the cycle — a Today column, a legend, and a tooltip on
 * every bar.
 *
 * **The caller owns the data and the filters.** `rows` is drawn as given: the
 * chart never fetches, sorts or filters, so what "Select Users" means is the
 * page's business. The filters are controlled props (`projectIds`, `userIds`,
 * `view`, `date`) and the chart only says when one changes. Likewise the cycles:
 * a cycle is the company's delivery period, not something a calendar can give,
 * so they are passed in.
 *
 * **Statuses are this pattern's vocabulary and live here once.** `planned`,
 * `in-progress`, `pre-delivered`, `completed`, `overdue` each map to one colour,
 * for the bar and for its legend entry, so they cannot drift apart. The colours
 * are the accessible `filled` tones the rest of the charts use (`ProgressBar`,
 * `DonutChart`) with their own content token, not the bright fills Figma
 * draws, whose white text would fail contrast.
 *
 * Geometry is measured, not stepped: a column is `CELL` wide and a bar is
 * placed by column, the same way `DonutChart`'s ring is sized in numbers rather
 * than on the spacing scale. Everything else is tokens.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export type GanttStatus = 'planned' | 'in-progress' | 'pre-delivered' | 'completed' | 'overdue';

/**
 * Status → bar colour and legend colour, and nowhere else. `pre-delivered` is the
 * one status with no tone: Figma draws it cyan, which no token covers, so it is
 * the light blue until one exists.
 */
const STATUS: Record<
  GanttStatus,
  { label: string; bar: string; legend: Pick<LegendItemProps, 'tone' | 'swatchClassName'> }
> = {
  planned: {
    label: 'Planned',
    bar: 'bg-surface-brand-strong text-text-inverted-primary hover:bg-action-primary-surface-hover',
    legend: { tone: 'brand' },
  },
  'in-progress': {
    label: 'Work In Progress',
    bar: 'bg-accent-warning-filled-surface-default text-accent-warning-filled-content-default hover:bg-accent-warning-filled-surface-hover',
    legend: { tone: 'warning' },
  },
  'pre-delivered': {
    label: 'Pre-Delivered',
    bar: 'bg-accent-blue-medium text-text-primary',
    legend: { swatchClassName: 'bg-accent-blue-medium' },
  },
  completed: {
    label: 'Completed',
    bar: 'bg-accent-success-filled-surface-default text-accent-success-filled-content-default hover:bg-accent-success-filled-surface-hover',
    legend: { tone: 'success' },
  },
  overdue: {
    label: 'Overdue',
    bar: 'bg-accent-critical-filled-surface-default text-accent-critical-filled-content-default hover:bg-accent-critical-filled-surface-hover',
    legend: { tone: 'critical' },
  },
};

const LEGEND_ORDER: GanttStatus[] = ['planned', 'in-progress', 'pre-delivered', 'completed', 'overdue'];

/** A column is this wide, and the name column beside them is `LABEL` wide. Chart geometry, not tokens. */
const CELL = 90;
const LABEL = 164;

export interface GanttBar {
  id: string;
  /** The work item's name — drawn in the bar and the tooltip's title. */
  title: string;
  status: GanttStatus;
  /** First and last day, `YYYY-MM-DD`, inclusive. */
  start: string;
  end: string;
  /** Points, drawn as a pill at the bar's end. */
  points?: number;
  /** The project's name, as a small pill before the title. */
  project?: string;
  /** The tooltip's lines. Defaults to the status, the project and the due date. */
  details?: GanttTooltipDetail[];
  /** Makes the bar a link. Without it the bar is a button that calls `onBarSelect`. */
  href?: string;
}

export interface GanttStat {
  label: string;
  value: React.ReactNode;
  /** Colours the number — "WIP" in the warning colour, "Planned" in brand. */
  tone?: 'brand' | 'success' | 'warning' | 'critical';
}

export interface GanttRow {
  id: string;
  /** A person or a project. */
  name: string;
  /** `project` rows sit on the quiet surface and carry a count badge. */
  kind?: 'user' | 'project';
  /** The pill after a project's name. Defaults to "N AVs | M pts" from the bars. */
  badge?: string;
  /** The panel shown under the name while the row is open. */
  stats?: GanttStat[];
  bars: GanttBar[];
}

export interface GanttChartProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'onChange'> {
  title?: string;
  /** Adds the (i) beside the title, with this as its tooltip. */
  infoText?: string;
  view: GanttView;
  onViewChange: (view: GanttView) => void;
  /** Any day inside the period on screen. */
  date: string;
  /** Called with the day to move to when the navigator's arrows are used. */
  onDateChange: (date: string) => void;
  cycles: GanttCycle[];
  /** Today, `YYYY-MM-DD`. Defaults to the system date; pass it for a stable chart. */
  today?: string;
  rows: GanttRow[];
  /** Controlled open rows; otherwise `defaultExpandedIds`. */
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** The filter menus appear when their options are given. */
  projectOptions?: SearchSelectOption[];
  projectIds?: string[];
  onProjectIdsChange?: (ids: string[]) => void;
  userOptions?: SearchSelectOption[];
  userIds?: string[];
  onUserIdsChange?: (ids: string[]) => void;
  onResetFilters?: () => void;
  /** A bar without an `href` was activated. */
  onBarSelect?: (bar: GanttBar) => void;
}

const VIEW_OPTIONS = [
  { value: 'cycle', label: 'Cycle' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

const statTone = cva('font-numeric text-caption-md-semibold', {
  variants: {
    tone: {
      none: 'text-text-primary',
      brand: 'text-text-brand-medium',
      success: 'text-accent-success-outline-content-default',
      warning: 'text-accent-warning-outline-content-default',
      critical: 'text-accent-critical-outline-content-default',
    },
  },
  defaultVariants: { tone: 'none' },
});

const cardinal = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The summary bar a closed row draws: how many items, how many points, over what span. */
function summarise(bars: GanttBar[], columns: GanttPeriod['columns']) {
  const placed = bars
    .map((bar) => ({ bar, at: place(columns, bar.start, bar.end) }))
    .filter((p): p is { bar: GanttBar; at: NonNullable<typeof p.at> } => p.at !== null);
  if (placed.length === 0) return null;
  return {
    count: placed.length,
    points: placed.reduce((sum, p) => sum + (p.bar.points ?? 0), 0),
    from: Math.min(...placed.map((p) => p.at.from)),
    to: Math.max(...placed.map((p) => p.at.to)),
  };
}

/** A bar one column wide has no room for words: it keeps its points and loses the rest. */
const MINIMISED_SPAN = 1;

const barShell =
  'flex h-9 w-full min-w-0 items-center gap-2.5 rounded-md px-3 text-left font-sans text-caption-md-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-stroke-focused';

const pointsPill =
  'shrink-0 rounded-pill bg-surface-elevated px-2 py-0.5 font-sans text-caption-md-semibold text-text-primary';

function BarItem({
  bar,
  span,
  line,
  from,
  placement,
  onSelect,
}: {
  bar: GanttBar;
  span: number;
  line: number;
  from: number;
  placement: 'top' | 'bottom';
  onSelect?: (bar: GanttBar) => void;
}) {
  const minimised = span <= MINIMISED_SPAN;
  const label = `${bar.title}, ${STATUS[bar.status].label}, ${bar.start} to ${bar.end}`;
  const details: GanttTooltipDetail[] = bar.details ?? [
    { label: 'Status', value: STATUS[bar.status].label },
    ...(bar.project ? [{ label: 'Project', value: bar.project }] : []),
    { label: 'Est. Due Date', value: bar.end },
  ];
  const className = cn(barShell, STATUS[bar.status].bar, minimised && 'justify-center px-1');
  const content = (
    <>
      {!minimised && bar.project && (
        <span className="max-w-24 shrink-0 truncate rounded-pill bg-surface-neutral-subtle px-2 py-0.5 text-caption-md-medium text-text-secondary">
          {bar.project}
        </span>
      )}
      {!minimised && <span className="min-w-0 flex-1 truncate">{bar.title}</span>}
      {bar.points !== undefined && (
        <span className={pointsPill}>{minimised ? bar.points : `${bar.points} pts`}</span>
      )}
    </>
  );
  return (
    <GanttTooltip
      title={bar.title}
      details={details}
      placement={placement}
      className="flex min-w-0"
      style={{ gridColumn: `${from + 1} / span ${span}`, gridRow: line }}
    >
      {bar.href ? (
        <a href={bar.href} aria-label={label} className={className}>
          {content}
        </a>
      ) : (
        <button type="button" aria-label={label} className={className} onClick={() => onSelect?.(bar)}>
          {content}
        </button>
      )}
    </GanttTooltip>
  );
}

/** The diagonal hatch on the Today column: one `<pattern>` per chart, referenced by every cell. */
function Hatch({ id }: { id: string }) {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" strokeWidth="1.5" className="stroke-surface-brand-subtle" />
        </pattern>
      </defs>
    </svg>
  );
}

const todayCell =
  'relative bg-surface-brand-faint border-x border-stroke-brand-medium';

function TodayFill({ hatch }: { hatch: string }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 size-full">
      <rect width="100%" height="100%" fill={`url(#${hatch})`} />
    </svg>
  );
}

export const GanttChart = React.forwardRef<HTMLElement, GanttChartProps>(
  (
    {
      className,
      title = 'Gantt Chart',
      infoText,
      view,
      onViewChange,
      date,
      onDateChange,
      cycles,
      today,
      rows,
      expandedIds,
      defaultExpandedIds = [],
      onExpandedChange,
      projectOptions,
      projectIds = [],
      onProjectIdsChange,
      userOptions,
      userIds = [],
      onUserIdsChange,
      onResetFilters,
      onBarSelect,
      ...props
    },
    ref,
  ) => {
    const hatch = `gantt-hatch-${React.useId().replace(/:/g, '')}`;
    const period = React.useMemo(() => buildPeriod(view, date, cycles), [view, date, cycles]);
    const { columns } = period;
    const todayDay = toDay(today ?? new Date().toISOString().slice(0, 10));
    const todayIndex = columnIndex(columns, todayDay, 'start');
    const isToday = (i: number) =>
      columns[i] !== undefined && columns[i].start <= todayDay && todayDay <= columns[i].end;

    const [openState, setOpenState] = React.useState<string[]>(defaultExpandedIds);
    const open = expandedIds ?? openState;
    const toggle = (id: string) => {
      const next = open.includes(id) ? open.filter((x) => x !== id) : [...open, id];
      if (expandedIds === undefined) setOpenState(next);
      onExpandedChange?.(next);
    };

    /* Bring Today into view when the period changes. */
    const scroller = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
      const el = scroller.current;
      if (!el || todayIndex === -1 || !isToday(todayIndex)) return;
      el.scrollLeft = Math.max(0, LABEL + todayIndex * CELL - el.clientWidth / 2);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, date]);

    const trackWidth = columns.length * CELL;
    const gridColumns = `repeat(${columns.length}, ${CELL}px)`; // ds-lint-ignore

    const arrow = (direction: 'previous' | 'next') => {
      const target = period[direction];
      return (
        <IconButton
          icon={direction === 'previous' ? 'caret-left' : 'caret-right'}
          label={direction === 'previous' ? 'Previous period' : 'Next period'}
          size="xs"
          disabled={target === undefined}
          onClick={() => target && onDateChange(target)}
        />
      );
    };

    const hasFilters = projectOptions || userOptions;

    return (
      <section
        ref={ref}
        aria-label={title}
        className={cn('flex flex-col gap-3 rounded-md bg-surface-elevated p-6', className)}
        {...props}
      >
        <Hatch id={hatch} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <h2 className="font-sans text-title-md-bold text-text-primary">{title}</h2>
            {infoText && (
              <Tooltip content={infoText} placement="bottom">
                <IconButton icon="info" label="About this chart" size="xs" />
              </Tooltip>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onResetFilters && (
              <Button variant="link" onClick={onResetFilters}>
                Reset Filters
              </Button>
            )}
            {hasFilters && (
              <>
                {projectOptions && (
                  <SearchSelect
                    className="w-52"
                    aria-label="Projects"
                    multiple
                    avatars={false}
                    placeholder="Select Projects"
                    options={projectOptions}
                    value={projectIds}
                    onChange={(v) => onProjectIdsChange?.(v as unknown as string[])}
                  />
                )}
                {userOptions && (
                  <SearchSelect
                    className="w-52"
                    aria-label="Users"
                    multiple
                    placeholder="Select Users"
                    options={userOptions}
                    value={userIds}
                    onChange={(v) => onUserIdsChange?.(v as unknown as string[])}
                  />
                )}
              </>
            )}
            <Select
              aria-label="View"
              options={VIEW_OPTIONS}
              value={view}
              onChange={(v) => onViewChange(v as GanttView)}
              className="w-40"
            />
          </div>
        </div>

        {/* The period's own header — year, month, and the arrows that move it. */}
        <div className="flex flex-col" style={{ paddingLeft: LABEL }}>
          {period.heading.map((text, i) => (
            <div
              key={text}
              className={cn(
                'flex h-9 items-center justify-center border border-stroke-subtle font-sans text-caption-md-semibold text-text-primary',
                i === 0 && 'rounded-t-md',
              )}
            >
              {text}
            </div>
          ))}
          <div
            className={cn(
              'flex h-9 items-center justify-between border border-stroke-brand-medium bg-surface-brand-faint px-1',
              period.heading.length === 0 && 'rounded-t-md',
            )}
          >
            <span className="text-text-brand-medium">{arrow('previous')}</span>
            <span className="font-sans text-caption-md-bold text-text-primary" aria-live="polite">
              {period.navLabel}
            </span>
            <span className="text-text-brand-medium">{arrow('next')}</span>
          </div>
        </div>

        <div ref={scroller} tabIndex={0} aria-label={`${title}, scrolls sideways`} role="region" className="min-h-56 overflow-x-auto">
          <div className="flex flex-col" style={{ width: LABEL + trackWidth }}>
            {/* Group row: cycles over the days, months over the cycles. */}
            {period.groups.length > 0 && (
              <div className="flex" style={{ paddingLeft: LABEL }}>
                {period.groups.map((g, i) => (
                  <div
                    key={`${g.label}-${i}`}
                    style={{ width: g.span * CELL }}
                    className="flex h-9 items-center justify-center border-r border-stroke-subtle font-sans text-caption-md-semibold text-text-secondary"
                  >
                    {g.label}
                  </div>
                ))}
              </div>
            )}
            {/* Column headings, with Today picked out. */}
            <div className="flex" style={{ paddingLeft: LABEL }}>
              {columns.map((c, i) => (
                <div
                  key={c.key}
                  aria-current={isToday(i) ? 'date' : undefined}
                  style={{ width: CELL }}
                  className={cn(
                    'flex h-16 shrink-0 items-center justify-center border-r border-stroke-subtle font-sans text-body-md-medium text-text-secondary',
                    isToday(i) && cn(todayCell, 'text-text-brand-medium'),
                  )}
                >
                  {isToday(i) && (
                    <>
                      <TodayFill hatch={hatch} />
                      <span className="absolute left-0 top-0 rounded-br-sm bg-surface-brand-strong px-1.5 font-sans text-caption-sm-semibold text-text-inverted-primary">
                        TODAY
                      </span>
                    </>
                  )}
                  <span className="relative">{c.label}</span>
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="h-1 bg-surface-brand-strong" style={{ marginLeft: LABEL }} />

            {rows.map((row, rowIndex) => {
              const expanded = open.includes(row.id);
              const isProject = row.kind === 'project';
              const summary = summarise(row.bars, columns);
              const placed = row.bars
                .map((bar) => ({ bar, at: place(columns, bar.start, bar.end) }))
                .filter((p): p is { bar: GanttBar; at: NonNullable<typeof p.at> } => p.at !== null);
              const badge =
                row.badge ??
                (isProject
                  ? `${cardinal(row.bars.length, 'AV', 'AVs')} | ${row.bars.reduce((s, b) => s + (b.points ?? 0), 0)} pts`
                  : undefined);
              const panelId = `${hatch}-${row.id}`;
              return (
                <div key={row.id} className={cn('flex border-b border-stroke-default', isProject && 'bg-surface-neutral-subtle')}>
                  <div
                    style={{ width: LABEL }}
                    className={cn(
                      'sticky left-0 z-10 shrink-0 border-r border-stroke-default bg-surface-elevated',
                      isProject && 'bg-surface-neutral-subtle',
                      expanded && !isProject && 'border-l-4 border-l-stroke-focused',
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={row.stats ? panelId : undefined}
                      onClick={() => toggle(row.id)}
                      className="flex w-full items-center gap-2 px-2 py-4 text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-stroke-focused"
                    >
                      <Icon name={expanded ? 'caret-down' : 'caret-right'} size={16} className="shrink-0 text-text-secondary" />
                      <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                        <span className="w-full truncate font-sans text-body-md-semibold text-text-primary">{row.name}</span>
                        {badge && (
                          <span className="rounded-pill bg-surface-elevated px-2 py-0.5 font-sans text-caption-md-medium text-text-secondary">
                            {badge}
                          </span>
                        )}
                      </span>
                    </button>
                    {expanded && row.stats && (
                      <dl id={panelId} className="m-0 flex flex-col gap-1 px-3 pb-4">
                        {row.stats.map((s) => (
                          <div key={s.label} className="flex items-center justify-between gap-2">
                            <dt className="font-sans text-caption-md-regular text-text-tertiary">{s.label}</dt>
                            <dd className={cn('m-0', statTone({ tone: s.tone ?? 'none' }))}>{s.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                  <div className="relative" style={{ width: trackWidth }}>
                    <div aria-hidden="true" className="absolute inset-0 flex">
                      {columns.map((c, i) => (
                        <div
                          key={c.key}
                          style={{ width: CELL }}
                          className={cn('h-full shrink-0 border-r border-stroke-subtle', isToday(i) && todayCell)}
                        >
                          {isToday(i) && <TodayFill hatch={hatch} />}
                        </div>
                      ))}
                    </div>
                    <div className="relative grid gap-1 py-0.5" style={{ gridTemplateColumns: gridColumns }}>
                      {expanded
                        ? placed.map(({ bar, at }, line) => (
                            <BarItem
                              key={bar.id}
                              bar={bar}
                              from={at.from}
                              span={at.to - at.from + 1}
                              line={line + 1}
                              placement={rowIndex === 0 ? 'bottom' : 'top'}
                              onSelect={onBarSelect}
                            />
                          ))
                        : summary && (
                            <div
                              className={cn(barShell, STATUS.planned.bar, 'hover:bg-surface-brand-strong')}
                              style={{ gridColumn: `${summary.from + 1} / span ${summary.to - summary.from + 1}`, gridRow: 1 }}
                            >
                              {summary.to === summary.from ? null : (
                                <span className="min-w-0 flex-1 truncate">
                                  {cardinal(summary.count, 'Added Value', 'Added Values')}
                                </span>
                              )}
                              <span className={pointsPill}>
                                {summary.to === summary.from ? summary.points : `${summary.points} pts`}
                              </span>
                            </div>
                          )}
                    </div>
                  </div>
                </div>
              );
            })}
            {rows.length === 0 && (
              <p className="m-0 p-6 text-center font-sans text-body-md-regular text-text-tertiary" style={{ marginLeft: LABEL }}>
                Nothing planned for this period.
              </p>
            )}
          </div>
        </div>

        <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-3 self-center rounded-sm border border-stroke-default px-2 py-1">
          {LEGEND_ORDER.map((status) => (
            <li key={status}>
              <LegendItem size="sm" label={STATUS[status].label} {...STATUS[status].legend} />
            </li>
          ))}
        </ul>
      </section>
    );
  },
);
GanttChart.displayName = 'GanttChart';
