import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { LegendItem, type LegendItemProps } from '../../atoms/legend-item';
import { Select } from '../../atoms/select';
import { Skeleton } from '../../atoms/skeleton';
import { DatePicker } from '../../components/date-picker';
import { Menu, type MenuItem } from '../../components/menu';
import { Popover } from '../../components/popover';
import { SearchSelect } from '../../components/search-select';
import { GanttTooltip, type GanttTooltipDetail } from '../../components/gantt-tooltip';
import { Tooltip } from '../../components/tooltip';
import {
  buildPeriod,
  columnIndex,
  packLanes,
  place,
  toDay,
  toIso,
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

/** Under 30rem — a phone held upright, and only that: the name column becomes a header above each row. Everything wider keeps the regular layout. */
function useNarrow() {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(max-width: 29.99rem)');
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return narrow;
}

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
  /** Who raised it, for the tooltip. */
  initiator?: string;
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
  /**
   * The data is on its way: the header, the Today column and the legend stay, and the
   * rows become placeholders. Pass the real lists (or empty ones) as they arrive; the
   * filters are off until `loading` ends.
   */
  loading?: boolean;
}

/** Where the placeholder bars sit in each placeholder row: a first column and a width, in columns. */
const SKELETON_ROWS: [number, number][][] = [
  [[0, 5], [6, 4]],
  [[2, 7]],
  [[1, 4], [7, 5]],
  [[0, 9]],
  [[3, 6]],
];

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
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Oct 27, 2026" — a cycle's dates as the filter bar's cycle field writes them, by string split: no Date, no time zone. */
const longDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${MONTHS[Number(m) - 1]} ${d}, ${y}`;
};
const cycleRange = (c: { start: string; end: string }) => `${longDate(c.start)} - ${longDate(c.end)}`;

/** "03.02" — the availability date as the stats panel writes it. */
const formatShort = (iso: string) => shortFormat.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`)).replace('/', '.');

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
  project,
  span,
  lane,
  from,
  placement,
  onSelect,
}: {
  task: GanttTask;
  project?: GanttProject;
  span: number;
  lane: number;
  from: number;
  placement: 'top' | 'bottom';
  onSelect?: (task: GanttTask) => void;
}) {
  const minimised = span <= MINIMISED_SPAN;
  const label = `${task.title}, ${STATUS[task.status].label}, ${task.points} points, ${formatDate(task.start)} to ${formatDate(task.end)}`;
  const details: GanttTooltipDetail[] = [
    { label: 'Status', value: task.statusLabel ?? STATUS[task.status].label },
    ...(task.initiator ? [{ label: 'Initiator', value: task.initiator }] : []),
    { label: 'Est. Due Date', value: formatDate(task.end) },
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
/**
 * Slides its children open and shut — a height transition, for the name cell's
 * figures. They stay mounted so it can animate; `invisible` (which waits out the
 * transition) and `inert` keep a shut one out of reach. `overflow-clip` rather than
 * `hidden`, so a sticky parent keeps working. Only for content with nothing that
 * sticks out of it: a tooltip would be cut off.
 */
function Slide({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'grid transition-all duration-200 ease-out motion-reduce:transition-none',
        !open && 'invisible',
      )}
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
    >
      <div className="min-h-0 overflow-clip" inert={!open}>
        {children}
      </div>
    </div>
  );
}

/**
 * Shows or hides its children outright. A hidden one is `display: none`, so it takes
 * no room and is out of reach of the pointer, the keyboard and assistive tech. No
 * transition and no clipping, so a bar's tooltip is never cut off by the wrapper.
 */
function Show({ open, children }: { open: boolean; children: React.ReactNode }) {
  return <div className={open ? 'block' : 'hidden'}>{children}</div>;
}

const Corner = ({ className, width }: { className?: string; width: number }) => (
  <div
    aria-hidden="true"
    style={{ width }}
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
      loading,
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

    const todayIso = toIso(todayDay);
    const [jumpOpen, setJumpOpen] = React.useState(false);

    const rows = React.useMemo(
      () => (loading ? [] : buildRows(tasks, users, projects, projectIds, userIds, columns)),
      [loading, tasks, users, projects, projectIds, userIds, columns],
    );
    /* Where the Added Values are: from the first column any bar starts in to the last one any ends in. The line under the headings marks it, and is absent when there are none. */
    const extent = React.useMemo(() => {
      let first = Infinity;
      let last = -1;
      for (const row of rows) {
        if (row.kind !== 'user') continue;
        for (const { at } of row.placed) {
          first = Math.min(first, at.from);
          last = Math.max(last, at.to);
        }
      }
      return last < 0 ? null : { first, last };
    }, [rows]);
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

    /* Whenever the view, the period or a filter changes, start again from the left edge. */
    const scroller = React.useRef<HTMLDivElement | null>(null);
    const headerTrack = React.useRef<HTMLDivElement | null>(null);
    /* On a phone each person's name and figures sit above their bars, as wide as the screen and held at the left edge while the bars scroll sideways. */
    const narrow = useNarrow();
    const gutter = narrow ? 0 : LABEL;
    const [viewWidth, setViewWidth] = React.useState(0);
    React.useEffect(() => {
      const el = scroller.current;
      if (!el || typeof ResizeObserver === 'undefined') return;
      const sync = () => setViewWidth(el.clientWidth);
      sync();
      const observer = new ResizeObserver(sync);
      observer.observe(el);
      return () => observer.disconnect();
    }, []);
    const nameStyle: React.CSSProperties = narrow ? { width: viewWidth || undefined, maxWidth: '100vw' } : { width: LABEL };
    const scrollKey = [view, date, projectIds.join(), userIds.join()].join('|');
    /* Today asked for from another period: wait for that period to render, then bring the column into view. */
    const wantToday = React.useRef(false);
    const scrollToToday = () => {
      const el = scroller.current;
      if (!el || todayIndex < 0) return;
      const room = el.clientWidth - gutter - CELL;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollTo({ left: Math.max(0, todayIndex * CELL - room / 2), behavior: reduce ? 'auto' : 'smooth' });
    };
    React.useEffect(() => {
      if (scroller.current) scroller.current.scrollLeft = 0;
      if (wantToday.current) {
        wantToday.current = false;
        scrollToToday();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollKey]);
    const goToday = () => {
      if (columns.some((_, i) => isToday(i))) {
        scrollToToday();
      } else {
        wantToday.current = true;
        onDateChange(todayIso);
      }
    };

    const trackWidth = columns.length * CELL;
    const gridColumns = `repeat(${columns.length}, ${CELL}px)`; // ds-lint-ignore

    /* The period label opens the quickest way to pick another one: the cycles themselves, the years, or a calendar of months. */
    const label = (
      <button
        type="button"
        disabled={loading}
        className="flex items-center gap-1 rounded-sm px-2 py-1 font-sans text-body-sm-semibold text-text-primary outline-offset-2 hover:bg-surface-brand-subtle focus-visible:outline-2 focus-visible:outline-stroke-focused disabled:opacity-60"
      >
        <span aria-live="polite">{period.navLabel}</span>
        <Icon name="caret-down" size={16} className="text-text-brand-medium" />
      </button>
    );
    const dateDay = toDay(date);
    const listed = [...cycles].sort((a, b) => toDay(a.start) - toDay(b.start));
    const currentCycle = listed.find((c) => toDay(c.start) <= dateDay && dateDay <= toDay(c.end));
    const years = Array.from(
      new Set([...listed.map((c) => Number(c.start.slice(0, 4))), Number(date.slice(0, 4))]),
    ).sort((a, b) => a - b);
    const jumpItems: MenuItem[] = years.map((y) => ({
      key: String(y),
      label: String(y),
      selected: y === Number(date.slice(0, 4)),
    }));
    const jumpRoot = React.useRef<HTMLSpanElement | null>(null);
    const centreChoice = () => {
      const choice = jumpRoot.current?.querySelector<HTMLElement>('[aria-checked="true"]');
      const panel = choice?.closest<HTMLElement>('[role="menu"]');
      if (!choice || !panel) return;
      const offset = choice.getBoundingClientRect().top - panel.getBoundingClientRect().top;
      panel.scrollTop += offset - (panel.clientHeight - choice.offsetHeight) / 2;
    };
    const jump =
      view === 'cycle' ? (
        /* The cycle field as the filter bar draws it: a search, one pick, each row naming the cycle and its dates. */
        <SearchSelect
          aria-label="Cycle"
          placeholder="Select cycle"
          searchPlaceholder="Search cycles"
          disabled={loading}
          value={currentCycle?.id ?? ''}
          onChange={(id) => {
            const picked = listed.find((c) => c.id === id);
            if (picked) onDateChange(picked.start);
          }}
          options={listed.map((c) => ({ value: c.id, label: `${c.label} (${cycleRange(c)})`, shortLabel: c.label }))}
          renderOption={(option) => {
            const c = listed.find((x) => x.id === option.value);
            return c ? (
              <span className="min-w-0 truncate">
                <span className="text-label-sm-bold text-text-primary">{c.label}</span>
                {/* The space is its own text node: a leading space inside an inline span is dropped from the accessible name. */}
                {' '}
                <span className="text-label-sm-regular">{`(${cycleRange(c)})`}</span>
              </span>
            ) : (
              option.label
            );
          }}
          inline
          /* On a phone the field spans the whole bar, so its panel opens from the bar's left edge and stays on screen; on a wide screen it hugs the value and the panel opens under it. */
          className="absolute inset-0 grid content-center min-[30rem]:static min-[30rem]:block min-[30rem]:w-max"
        />
      ) : view === 'month' ? (
        <Popover
          open={jumpOpen}
          onOpenChange={setJumpOpen}
          width="auto"
          panelRole="dialog"
          label="Jump to"
          autoFocus
          panelClassName="left-1/2 -translate-x-1/2 border-0 bg-transparent p-0 shadow-none"
          trigger={label}
          content={
            <DatePicker
              mode="month"
              value={date}
              today={todayIso}
              clearable={false}
              onChange={(iso) => {
                onDateChange(iso);
                setJumpOpen(false);
              }}
            />
          }
        />
      ) : (
        <span ref={jumpRoot} className="inline-flex">
          <Menu
            trigger={label}
            items={jumpItems}
            panelClassName="left-1/2 max-h-72 min-w-64 -translate-x-1/2 overflow-y-auto"
            onOpenChange={(isOpen) => {
              /* A long list opens on the current choice, not at its top. */
              if (isOpen) window.setTimeout(centreChoice, 50);
            }}
            onSelect={(key) => onDateChange(`${key}-01-01`)}
          />
        </span>
      );

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

    /* The grid lines and the Today column. On a phone they run behind the whole row, name block included, so the lines stay unbroken; on a wide screen they sit in the track beside the name column. */
    const columnsLayer = (className?: string) => (
      <div aria-hidden="true" className={cn('absolute inset-0 flex', className)}>
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

    let firstUser = true;

    const renderRow = (row: RowModel) => {
      if (row.kind === 'project') {
        const closed = folded.includes(row.id);
        return (
          <div key={row.id} className="relative flex flex-col border-b border-stroke-default bg-surface-neutral-subtle min-[30rem]:flex-row">
            {columnsLayer('min-[30rem]:hidden')}
            {/* No edge on the right, and the name and count share one line: a long one runs on over the grid rather than wrapping. */}
            <div style={nameStyle} className="sticky left-0 z-10 shrink-0 min-[30rem]:bg-surface-neutral-subtle">
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
            <div className="relative hidden min-[30rem]:block" style={{ width: trackWidth }}>
              {columnsLayer('hidden min-[30rem]:flex')}
            </div>
          </div>
        );
      }

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
        <div key={row.id} className="relative flex flex-col border-b border-stroke-default pb-3 min-[30rem]:flex-row min-[30rem]:pb-0">
          {columnsLayer('min-[30rem]:hidden')}
          <div
            style={nameStyle}
            className={cn(
              'sticky left-0 z-10 shrink-0 min-[30rem]:border-r min-[30rem]:border-stroke-default min-[30rem]:bg-surface-elevated',
              /* On a phone an open person's block is half-opaque, so the figures read cleanly while the grid lines still show faintly; a closed one lets them through fully. */
              expanded && 'bg-surface-elevated/50',
              expanded && 'mb-3 border-l-4 border-l-stroke-default min-[30rem]:mb-0',
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
            {stats.length > 0 && (
              <Slide open={expanded}>
                <dl id={panelId} className="m-0 flex flex-col gap-1 px-3 pb-4">
                  {stats.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 min-[30rem]:justify-between">
                      <dt className="font-sans text-caption-md-regular text-text-tertiary">{s.label}</dt>
                      <dd className={cn('m-0', statTone({ tone: s.tone }))}>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </Slide>
            )}
          </div>
          <div className="relative" style={{ width: trackWidth }}>
            {columnsLayer('hidden min-[30rem]:flex')}
            {/* The summary bar and the full set of bars trade places: one folds away as the other opens. */}
            <Show open={!expanded}>
              <div className="relative grid auto-rows-min gap-y-1 py-0.5" style={{ gridTemplateColumns: gridColumns }}>
                {summary && (
                  <div
                    className={cn(barShell, STATUS.planned.bar, 'hover:bg-surface-brand-strong')}
                    style={{ gridColumn: `${summary.from + 1} / span ${summary.to - summary.from + 1}`, gridRow: 1 }}
                  >
                    {summary.to !== summary.from && (
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
            </Show>
            <Show open={expanded}>
              <div className="relative grid auto-rows-min gap-y-1 py-0.5" style={{ gridTemplateColumns: gridColumns }}>
                {placed.map(({ task, at }, i) => (
                  <TaskBar
                    key={task.id}
                    task={task}
                    project={projectIds.length === 0 ? projectById.get(task.projectId) : undefined}
                    from={at.from}
                    span={at.to - at.from + 1}
                    lane={lanes[i]}
                    placement={placement}
                    onSelect={onTaskSelect}
                  />
                ))}
              </div>
            </Show>
          </div>
        </div>
      );
    };

    /* A project header and the people under it fold together; with no project filter there are no headers. */
    const blocks: { id: string; header?: React.ReactNode; users: React.ReactNode[] }[] = [];
    for (const row of rows) {
      const node = renderRow(row);
      if (row.kind === 'project') blocks.push({ id: row.id, header: node, users: [] });
      else if (blocks.length > 0) blocks[blocks.length - 1].users.push(node);
      else blocks.push({ id: row.id, users: [node] });
    }

    return (
      <section
        ref={ref}
        aria-label={title}
        aria-busy={loading || undefined}
        className={cn('flex flex-col gap-3 rounded-md bg-surface-elevated p-6', className)}
        {...props}
      >
        <Hatch id={hatch} />
        {/* The placeholders are hidden from assistive tech, so the wait is announced here. */}
        <p role="status" className="sr-only">
          {loading ? `Loading ${title}…` : ''}
        </p>

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
            <Button variant="tertiary" disabled={loading} onClick={reset}>
              Reset Filters
            </Button>
            <SearchSelect
              multiple
              aria-label="Projects"
              disabled={loading}
              className="w-52"
              placeholder="Select Projects"
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              value={projectIds}
              onChange={onProjectIdsChange}
            />
            <SearchSelect
              multiple
              aria-label="Users"
              disabled={loading}
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
            <Button variant="secondary" size="sm" disabled={loading} onClick={goToday}>
              Today
            </Button>
          </div>
        </div>

        {/* The period's own header — year, month, and the arrows that move it. Over the dates (past the 164 name column) on a wide screen; the full width on a phone, where the dates are too narrow to hold it. */}
        <div className="flex flex-col min-[30rem]:pl-41">
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
              'relative flex h-9 items-center justify-between border border-stroke-brand-medium bg-surface-brand-faint px-1',
              period.heading.length === 0 && 'rounded-t-md',
            )}
          >
            <span className="relative z-10 text-text-brand-medium">{arrow('previous')}</span>
            {jump}
            <span className="relative z-10 text-text-brand-medium">{arrow('next')}</span>
          </div>
        </div>

        {/* The timeline's own headings — months or cycles over the days — held at the top of the screen as the page scrolls, so a row far down is never lost. They are outside the sideways scroller (a scroller cannot stick to the page), and slid along with it. -mt-3 takes back the card's gap, so the column lines start at the period bar instead of floating below it. */}
        <div className="sticky top-0 z-30 -mt-3 flex bg-surface-elevated">
          {gutter > 0 && <Corner width={gutter} />}
          <div className="min-w-0 flex-1 overflow-hidden">
            <div ref={headerTrack} className="flex flex-col" style={{ width: trackWidth }}>
              {/* Group row: cycles over the days, months over the cycles. */}
              {period.groups.length > 0 && (
                <div className="flex">
                  {period.groups.map((g, i) => (
                    <div
                      key={`${g.label}-${i}`}
                      style={{ width: g.span * CELL }}
                      className="flex h-11 items-center justify-center border-b border-r border-stroke-subtle font-sans text-body-sm-semibold text-text-primary"
                    >
                      {g.label}
                    </div>
                  ))}
                </div>
              )}
              {/* Column headings, with Today picked out. */}
              <div className="flex">
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
                        <span className="absolute left-0 top-0 rounded-br-sm bg-surface-brand-strong px-1.5 pb-0.5 pt-1 font-sans text-caption-sm-semibold text-text-inverted-primary">
                          TODAY
                        </span>
                      </>
                    )}
                    <span className="relative">{c.label}</span>
                  </div>
                ))}
              </div>
              <div aria-hidden="true" className="h-1">
                {extent && (
                  <div
                    className="h-full bg-surface-brand-strong"
                    style={{ marginLeft: extent.first * CELL, width: (extent.last - extent.first + 1) * CELL }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          ref={scroller}
          tabIndex={0}
          aria-label={`${title}, scrolls sideways`}
          role="region"
          onScroll={(e) => {
            if (headerTrack.current) headerTrack.current.style.transform = `translateX(${-e.currentTarget.scrollLeft}px)`;
          }}
          className="-mt-3 min-h-56 overflow-x-auto"
        >
          <div className="flex flex-col" style={{ width: gutter + trackWidth }}>
            {loading &&
              SKELETON_ROWS.map((bars, i) => (
                <div key={i} className="relative flex flex-col border-b border-stroke-default min-[30rem]:flex-row">
                  {columnsLayer('min-[30rem]:hidden')}
                  <div
                    style={nameStyle}
                    className="sticky left-0 z-10 flex shrink-0 items-center py-4 pl-8 pr-4 min-[30rem]:border-r min-[30rem]:border-stroke-default min-[30rem]:bg-surface-elevated"
                  >
                    <Skeleton width={i % 2 === 0 ? 96 : 72} textStyle="body-sm" />
                  </div>
                  <div className="relative" style={{ width: trackWidth }}>
                    {columnsLayer('hidden min-[30rem]:flex')}
                    <div className="relative grid auto-rows-min gap-y-1 py-0.5" style={{ gridTemplateColumns: gridColumns }}>
                      {bars.map(([start, span], j) => {
                        const from = start % Math.max(columns.length, 1);
                        return (
                          <div
                            key={j}
                            className="flex min-w-0"
                            style={{ gridColumn: `${from + 1} / span ${Math.min(span, columns.length - from)}`, gridRow: 1 }}
                          >
                            <Skeleton radius="md" height={36} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            {blocks.map((block) =>
              block.header ? (
                <React.Fragment key={block.id}>
                  {block.header}
                  <Show open={!folded.includes(block.id)}>{block.users}</Show>
                </React.Fragment>
              ) : (
                <React.Fragment key={block.id}>{block.users}</React.Fragment>
              ),
            )}
            {!loading && rows.length === 0 && (
              <p
                className="m-0 p-6 text-center font-sans text-body-sm-regular text-text-tertiary"
                style={{ marginLeft: gutter }}
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
