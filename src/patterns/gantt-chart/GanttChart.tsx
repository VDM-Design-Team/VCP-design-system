import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { LegendItem, type LegendItemProps } from '../../atoms/legend-item';
import { Select } from '../../atoms/select';
import { SearchSelect } from '../../components/search-select';
import { GanttTooltip, type GanttTooltipDetail } from '../../components/gantt-tooltip';
import { Tooltip } from '../../components/tooltip';
import {
  buildPeriod,
  columnIndex,
  packLanes,
  place,
  toDay,
  type GanttColumn,
  type GanttCycle,
  type GanttView,
  type Placement,
} from './timeline';

export type { GanttCycle, GanttView } from './timeline';

/**
 * GanttChart — who is working on what, and when: each Added Value drawn as a bar
 * from its start to its due date, against people down the side and time across
 * the top. Three views of the same data — one cycle by the day, a month by the
 * day, a year by the cycle — with a Today column, a legend, a tooltip on every
 * bar, and rows that open to show their bars.
 *
 * **The data is what a backend would send:** flat `tasks` (each knows its
 * `userId` and `projectId`), the `users` with their availability figures, the
 * `projects`, and the `cycles`. The chart does the one thing the page design
 * dictates and nothing else, so every page that shows a Gantt chart behaves the
 * same way:
 *
 * - **No project filter:** one row per user, in the order given, each with their
 *   tasks from every project.
 * - **Projects filtered:** the chart groups by project. Each selected project is a
 *   header row (with its count and points) and under it only the users who have
 *   tasks in it, showing only that project's tasks. The same person can appear
 *   under two projects.
 * - **Users filtered:** only those users, in whichever layout the above gives.
 *
 * It never fetches and never pages. A closed row draws one summary bar (how many
 * Added Values, how many points); an open row draws each task, packing tasks that
 * do not overlap onto the same line. The view, the period and the filters are
 * controlled props: the chart says when one changes.
 *
 * **Statuses are this pattern's vocabulary and live here once.** `planned`,
 * `in-progress`, `pre-delivered`, `completed`, `overdue` each map to one colour,
 * for the bar and its legend entry, so they cannot drift apart. The colours are
 * the accessible `filled` tones the other charts use (`ProgressBar`,
 * `DonutChart`) with their own content token, not the bright fills Figma draws,
 * whose white text would fail contrast.
 *
 * Geometry is measured, not stepped: a column is `CELL` wide and a bar is placed
 * by column, the way `DonutChart`'s ring is sized in numbers rather than on the
 * spacing scale. Everything else is tokens.
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

export interface GanttUser {
  id: string;
  name: string;
  /** Tasks the person has in progress — the "WIP" line of their panel. */
  wip?: number;
  /** Tasks they have planned. */
  planned?: number;
  /** Earliest availability date, `YYYY-MM-DD` — "EAD". */
  ead?: string;
  /** Days from today until `ead` — "EAD TD". */
  eadTd?: number;
}

export interface GanttProject {
  id: string;
  name: string;
}

export interface GanttTask {
  id: string;
  /** The Added Value's title — drawn in the bar and as the tooltip's heading. */
  title: string;
  userId: string;
  projectId: string;
  /** Which colour and legend entry the bar takes. */
  status: GanttStatus;
  /** The Added Value's own workflow status, shown in the tooltip ("AB Testing"). Defaults to the bar's status. */
  statusLabel?: string;
  /** Capacity points, drawn as a pill at the bar's end. */
  points: number;
  /** First and last day, `YYYY-MM-DD`, inclusive. */
  start: string;
  end: string;
  /** Makes the bar a link to the Added Value. Without it the bar is a button that calls `onTaskSelect`. */
  href?: string;
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
  /** The delivery periods. A cycle is the company's, not the calendar's, so they are passed in. */
  cycles: GanttCycle[];
  /** Today, `YYYY-MM-DD`. Defaults to the system date; pass it for a stable chart. */
  today?: string;
  tasks: GanttTask[];
  users: GanttUser[];
  projects: GanttProject[];
  /** Selected projects and users — empty means all. */
  projectIds: string[];
  onProjectIdsChange: (ids: string[]) => void;
  userIds: string[];
  onUserIdsChange: (ids: string[]) => void;
  /** Controlled open user rows; otherwise `defaultExpandedIds`. Row ids are the user's id, or `projectId:userId` under a project. */
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** A task without an `href` was activated. */
  onTaskSelect?: (task: GanttTask) => void;
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
      warning: 'text-accent-warning-outline-content-default',
    },
  },
  defaultVariants: { tone: 'none' },
});

const cardinal = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const shortFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
/** "03.02" — the availability date as the stats panel writes it. */
const formatShort = (iso: string) => shortFormat.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`)).replace('/', '.');

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "27/10 – 09/11/2026"; both years when they differ. */
function formatRange(start: string, end: string) {
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${sameYear ? shortFormat.format(new Date(`${start.slice(0, 10)}T00:00:00Z`)) : formatDate(start)} – ${formatDate(end)}`;
}

/** Where a task stands against today, in the words the chart's reader wants: due in, overdue by, starts in. */
function timing(task: GanttTask, todayDay: number): string | undefined {
  if (task.status === 'completed') return undefined;
  const end = toDay(task.end);
  const start = toDay(task.start);
  if (end < todayDay) return `Overdue by ${plural(todayDay - end, 'day')}`;
  if (start > todayDay) return `Starts in ${plural(start - todayDay, 'day')}`;
  if (end === todayDay) return 'Due today';
  return `Due in ${plural(end - todayDay, 'day')}`;
}

/** A closed row's tooltip: how much the person has in this period, over what span, and in what states. */
function summaryDetails(placed: { task: GanttTask }[]): GanttTooltipDetail[] {
  const tasks = placed.map((p) => p.task);
  const start = tasks.reduce((min, t) => (t.start < min ? t.start : min), tasks[0].start);
  const end = tasks.reduce((max, t) => (t.end > max ? t.end : max), tasks[0].end);
  const byStatus = LEGEND_ORDER.map((status) => ({ status, n: tasks.filter((t) => t.status === status).length }))
    .filter((x) => x.n > 0)
    .map((x) => `${x.n} ${STATUS[x.status].label}`)
    .join(', ');
  return [
    { label: 'Added Values', value: tasks.length },
    { label: 'Capacity', value: `${tasks.reduce((sum, t) => sum + t.points, 0)} pts` },
    { label: 'Span', value: formatRange(start, end) },
    { label: 'Status', value: byStatus },
  ];
}

interface PlacedTask {
  task: GanttTask;
  at: Placement;
}

type RowModel =
  | { kind: 'project'; id: string; project: GanttProject; count: number; points: number }
  | { kind: 'user'; id: string; user: GanttUser; placed: PlacedTask[] };

/** The layout the page design prescribes: by user, or by project and then user. See the component note. */
function buildRows(
  tasks: GanttTask[],
  users: GanttUser[],
  projects: GanttProject[],
  projectIds: string[],
  userIds: string[],
  columns: GanttColumn[],
): RowModel[] {
  const placed: PlacedTask[] = tasks
    .map((task) => ({ task, at: place(columns, task.start, task.end) }))
    .filter((p): p is PlacedTask => p.at !== null);
  const wantedUsers = users.filter((u) => userIds.length === 0 || userIds.includes(u.id));

  if (projectIds.length === 0) {
    return wantedUsers.map((user) => ({
      kind: 'user',
      id: user.id,
      user,
      placed: placed.filter((p) => p.task.userId === user.id),
    }));
  }

  const rows: RowModel[] = [];
  for (const project of projects.filter((p) => projectIds.includes(p.id))) {
    const inProject = placed.filter((p) => p.task.projectId === project.id);
    const people = wantedUsers
      .map((user) => ({ user, placed: inProject.filter((p) => p.task.userId === user.id) }))
      .filter((p) => p.placed.length > 0);
    const shown = people.flatMap((p) => p.placed);
    rows.push({
      kind: 'project',
      id: `project:${project.id}`,
      project,
      count: shown.length,
      points: shown.reduce((sum, p) => sum + p.task.points, 0),
    });
    for (const person of people) {
      rows.push({ kind: 'user', id: `${project.id}:${person.user.id}`, user: person.user, placed: person.placed });
    }
  }
  return rows;
}

/** A bar one column wide has no room for words: it keeps its points and loses the rest. */
const MINIMISED_SPAN = 1;

const barShell =
  'flex h-9 w-full min-w-0 items-center gap-2.5 rounded-md px-3 text-left font-sans text-caption-md-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-stroke-focused';

const pointsPill =
  'shrink-0 rounded-pill bg-surface-elevated px-2 py-0.5 font-sans text-caption-md-semibold text-text-primary';

function TaskBar({
  task,
  assignee,
  todayDay,
  projectName,
  project,
  span,
  lane,
  from,
  placement,
  onSelect,
}: {
  task: GanttTask;
  assignee?: string;
  todayDay: number;
  /** The project's name for the tooltip — always known, unlike `project`, which is only passed when the pill should show. */
  projectName?: string;
  project?: GanttProject;
  span: number;
  lane: number;
  from: number;
  placement: 'top' | 'bottom';
  onSelect?: (task: GanttTask) => void;
}) {
  const minimised = span <= MINIMISED_SPAN;
  const label = `${task.title}, ${STATUS[task.status].label}, ${task.points} points, ${formatDate(task.start)} to ${formatDate(task.end)}`;
  /* What the chart can say about a bar: what it is, who has it, when it runs, how big, and how it stands against today. */
  const standing = timing(task, todayDay);
  const details: GanttTooltipDetail[] = [
    { label: 'Status', value: task.statusLabel ?? STATUS[task.status].label },
    ...(projectName ? [{ label: 'Project', value: projectName }] : []),
    ...(assignee ? [{ label: 'Assignee', value: assignee }] : []),
    { label: 'Dates', value: formatRange(task.start, task.end) },
    {
      label: 'Capacity',
      value: `${task.points} pts over ${plural(toDay(task.end) - toDay(task.start) + 1, 'day')}`,
    },
    ...(standing ? [{ label: 'Timing', value: standing }] : []),
  ];
  const className = cn(barShell, STATUS[task.status].bar, minimised && 'justify-center px-1');
  const content = (
    <>
      {!minimised && project && (
        <span className="max-w-24 shrink-0 truncate rounded-pill bg-surface-neutral-subtle px-2 py-0.5 text-caption-md-medium text-text-secondary">
          {project.name}
        </span>
      )}
      {!minimised && <span className="min-w-0 flex-1 truncate">{task.title}</span>}
      <span className={pointsPill}>{minimised ? task.points : `${task.points} pts`}</span>
    </>
  );
  return (
    <GanttTooltip
      title={task.title}
      details={details}
      placement={placement}
      className="flex min-w-0"
      style={{ gridColumn: `${from + 1} / span ${span}`, gridRow: lane + 1 }}
    >
      {task.href ? (
        <a href={task.href} aria-label={label} className={className}>
          {content}
        </a>
      ) : (
        <button type="button" aria-label={label} className={className} onClick={() => onSelect?.(task)}>
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

const todayCell = 'relative bg-surface-brand-faint border-x border-stroke-brand-medium';

function TodayFill({ hatch }: { hatch: string }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 size-full">
      <rect width="100%" height="100%" fill={`url(#${hatch})`} />
    </svg>
  );
}

/**
 * The name column's cell in a header row: opaque and stuck to the left, so the
 * dates scrolling sideways are cut off where the names begin instead of sliding
 * underneath the empty corner.
 */
const Corner = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    style={{ width: LABEL }}
    className={cn('sticky left-0 z-20 shrink-0 bg-surface-elevated', className)}
  />
);

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
      tasks,
      users,
      projects,
      projectIds,
      onProjectIdsChange,
      userIds,
      onUserIdsChange,
      expandedIds,
      defaultExpandedIds = [],
      onExpandedChange,
      onTaskSelect,
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

    const rows = React.useMemo(
      () => buildRows(tasks, users, projects, projectIds, userIds, columns),
      [tasks, users, projects, projectIds, userIds, columns],
    );
    const projectById = React.useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

    const [openState, setOpenState] = React.useState<string[]>(defaultExpandedIds);
    const open = expandedIds ?? openState;
    const toggle = (id: string) => {
      const next = open.includes(id) ? open.filter((x) => x !== id) : [...open, id];
      if (expandedIds === undefined) setOpenState(next);
      onExpandedChange?.(next);
    };
    /* Project groups start open; this is the ones the user has folded away. */
    const [folded, setFolded] = React.useState<string[]>([]);
    const fold = (id: string) => setFolded((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

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

    const reset = () => {
      onProjectIdsChange([]);
      onUserIdsChange([]);
    };

    let hidden = false; // inside a folded project group
    let firstUser = true;

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
            <h2 className="font-sans text-title-sm-bold text-text-primary">{title}</h2>
            {infoText && (
              <Tooltip content={infoText} placement="bottom">
                <IconButton
                  icon="info"
                  label="About this chart"
                  size="xs"
                  className="text-text-tertiary hover:text-text-secondary"
                />
              </Tooltip>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* The filter bar's own Reset: the same ghost, brand-coloured button. */}
            <Button variant="tertiary" onClick={reset}>
              Reset Filters
            </Button>
            <SearchSelect
              multiple
              aria-label="Projects"
              className="w-52"
              placeholder="Select Projects"
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              value={projectIds}
              onChange={onProjectIdsChange}
            />
            <SearchSelect
              multiple
              aria-label="Users"
              className="w-52"
              rows="avatar"
              placeholder="Select Users"
              options={users.map((u) => ({ value: u.id, label: u.name }))}
              value={userIds}
              onChange={onUserIdsChange}
            />
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
              key={i}
              className={cn(
                'flex h-9 items-center justify-center border border-stroke-subtle font-sans text-body-sm-semibold text-text-primary',
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
            <span className="font-sans text-body-sm-semibold text-text-primary" aria-live="polite">
              {period.navLabel}
            </span>
            <span className="text-text-brand-medium">{arrow('next')}</span>
          </div>
        </div>

        <div
          ref={scroller}
          tabIndex={0}
          aria-label={`${title}, scrolls sideways`}
          role="region"
          className="min-h-56 overflow-x-auto"
        >
          <div className="flex flex-col" style={{ width: LABEL + trackWidth }}>
            {/* Group row: cycles over the days, months over the cycles. */}
            {period.groups.length > 0 && (
              <div className="flex">
                <Corner />
                {period.groups.map((g, i) => (
                  <div
                    key={`${g.label}-${i}`}
                    style={{ width: g.span * CELL }}
                    className="flex h-9 items-center justify-center border-r border-stroke-subtle font-sans text-body-sm-semibold text-text-primary"
                  >
                    {g.label}
                  </div>
                ))}
              </div>
            )}
            {/* Column headings, with Today picked out. */}
            <div className="flex">
              <Corner />
              {columns.map((c, i) => (
                <div
                  key={c.key}
                  aria-current={isToday(i) ? 'date' : undefined}
                  style={{ width: CELL }}
                  className={cn(
                    'flex h-16 shrink-0 items-center justify-center border-r border-stroke-subtle font-sans text-body-sm-medium text-text-secondary',
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
            <div className="flex">
              <Corner />
              <div aria-hidden="true" className="h-1 bg-surface-brand-strong" style={{ width: trackWidth }} />
            </div>

            {rows.map((row) => {
              const columnsLayer = (
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
              );

              if (row.kind === 'project') {
                const closed = folded.includes(row.id);
                hidden = closed;
                return (
                  <div key={row.id} className="flex border-b border-stroke-default bg-surface-neutral-subtle">
                    {/* No edge on the right, and the name and count share one line: a long one runs on over the grid rather than wrapping. */}
                    <div style={{ width: LABEL }} className="sticky left-0 z-10 shrink-0 bg-surface-neutral-subtle">
                      <button
                        type="button"
                        aria-expanded={!closed}
                        onClick={() => fold(row.id)}
                        className="flex w-max min-w-full items-center gap-2 whitespace-nowrap px-2 py-4 text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-stroke-focused"
                      >
                        <Icon name={closed ? 'caret-right' : 'caret-down'} size={16} className="shrink-0 text-text-secondary" />
                        <span className="font-sans text-body-sm-semibold text-text-primary">{row.project.name}</span>
                        <span className="rounded-pill bg-surface-elevated px-2 py-0.5 font-sans text-caption-md-medium text-text-secondary">
                          {cardinal(row.count, 'AV', 'AVs')} | {row.points} pts
                        </span>
                      </button>
                    </div>
                    <div className="relative" style={{ width: trackWidth }}>
                      {columnsLayer}
                    </div>
                  </div>
                );
              }

              if (hidden) return null;
              const expanded = open.includes(row.id);
              const { user, placed } = row;
              const lanes = packLanes(placed.map((p) => p.at));
              const stats = [
                user.wip !== undefined && { label: 'WIP', value: user.wip, tone: 'warning' as const },
                user.planned !== undefined && { label: 'Planned', value: user.planned, tone: 'brand' as const },
                user.ead !== undefined && { label: 'EAD', value: formatShort(user.ead), tone: 'none' as const },
                user.eadTd !== undefined && { label: 'EAD TD', value: `${user.eadTd} Days`, tone: 'none' as const },
              ].filter(Boolean) as { label: string; value: React.ReactNode; tone: 'none' | 'brand' | 'warning' }[];
              const panelId = `${hatch}-${row.id.replace(/[^a-z0-9]/gi, '')}`;
              const summary =
                placed.length === 0
                  ? null
                  : {
                      count: placed.length,
                      points: placed.reduce((sum, p) => sum + p.task.points, 0),
                      from: Math.min(...placed.map((p) => p.at.from)),
                      to: Math.max(...placed.map((p) => p.at.to)),
                    };
              /* The first row's tooltips open below their bar, the rest above, so neither runs into the chart's edge. */
              const placement = firstUser ? 'bottom' : 'top';
              firstUser = false;
              return (
                <div key={row.id} className="flex border-b border-stroke-default">
                  <div
                    style={{ width: LABEL }}
                    className={cn(
                      'sticky left-0 z-10 shrink-0 border-r border-stroke-default bg-surface-elevated',
                      expanded && 'border-l-4 border-l-stroke-focused',
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={stats.length > 0 ? panelId : undefined}
                      onClick={() => toggle(row.id)}
                      className="flex w-full items-center gap-2 px-2 py-4 text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-stroke-focused"
                    >
                      <Icon name={expanded ? 'caret-down' : 'caret-right'} size={16} className="shrink-0 text-text-secondary" />
                      <span className="min-w-0 flex-1 truncate font-sans text-body-sm-semibold text-text-primary">{user.name}</span>
                    </button>
                    {expanded && stats.length > 0 && (
                      <dl id={panelId} className="m-0 flex flex-col gap-1 px-3 pb-4">
                        {stats.map((s) => (
                          <div key={s.label} className="flex items-center justify-between gap-2">
                            <dt className="font-sans text-caption-md-regular text-text-tertiary">{s.label}</dt>
                            <dd className={cn('m-0', statTone({ tone: s.tone }))}>{s.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                  <div className="relative" style={{ width: trackWidth }}>
                    {columnsLayer}
                    <div className="relative grid auto-rows-min gap-y-1 py-0.5" style={{ gridTemplateColumns: gridColumns }}>
                      {expanded
                        ? placed.map(({ task, at }, i) => (
                            <TaskBar
                              key={task.id}
                              task={task}
                              assignee={user.name}
                              todayDay={todayDay}
                              projectName={projectById.get(task.projectId)?.name}
                              project={projectIds.length === 0 ? projectById.get(task.projectId) : undefined}
                              from={at.from}
                              span={at.to - at.from + 1}
                              lane={lanes[i]}
                              placement={placement}
                              onSelect={onTaskSelect}
                            />
                          ))
                        : summary && (
                            <GanttTooltip
                              title={user.name}
                              details={summaryDetails(placed)}
                              placement={placement}
                              className="flex min-w-0"
                              style={{ gridColumn: `${summary.from + 1} / span ${summary.to - summary.from + 1}`, gridRow: 1 }}
                            >
                              <button
                                type="button"
                                aria-label={`${user.name}: ${plural(summary.count, 'Added Value')}, ${summary.points} points. Show them`}
                                onClick={() => toggle(row.id)}
                                className={cn(barShell, STATUS.planned.bar)}
                              >
                                {summary.to !== summary.from && (
                                  <span className="min-w-0 flex-1 truncate">{plural(summary.count, 'Added Value')}</span>
                                )}
                                <span className={pointsPill}>
                                  {summary.to === summary.from ? summary.points : `${summary.points} pts`}
                                </span>
                              </button>
                            </GanttTooltip>
                          )}
                    </div>
                  </div>
                </div>
              );
            })}
            {rows.length === 0 && (
              <p
                className="m-0 p-6 text-center font-sans text-body-sm-regular text-text-tertiary"
                style={{ marginLeft: LABEL }}
              >
                Nothing matches these filters.
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
