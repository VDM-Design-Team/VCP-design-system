/**
 * The time axis of the Gantt chart, as plain functions: which columns a view
 * shows for a date, and where a bar lands on them. No React, no DOM — dates are
 * `YYYY-MM-DD` strings and the arithmetic is on whole UTC days, so a time zone
 * can never move a bar by one column.
 *
 * A *cycle* is the company's own delivery period ("Cycle 37"); it cannot be
 * derived from a calendar, so the caller hands the list over and the chart only
 * reads it.
 */

export type GanttView = 'cycle' | 'month' | 'year';

export interface GanttCycle {
  id: string;
  /** "Cycle 37" — the navigator and the month view's group row. */
  label: string;
  /** "C37" — the year view's column heading. Falls back to `label`. */
  short?: string;
  /** First day, inclusive. */
  start: string;
  /** Last day, inclusive. */
  end: string;
}

export interface GanttColumn {
  key: string;
  /** What the column heading says: a day of the month, or a cycle's short name. */
  label: string;
  /** First and last day, as whole UTC day numbers. */
  start: number;
  end: number;
}

export interface GanttGroup {
  label: string;
  /** How many columns the group spans. */
  span: number;
}

export interface GanttPeriod {
  columns: GanttColumn[];
  /** Plain labels stacked above the navigator — the year, the month. */
  heading: string[];
  /** The navigator's text — "Cycle 37", "July", "2026". */
  navLabel: string;
  /** Spanning labels over the columns — cycles in the month view, months in the year view. */
  groups: GanttGroup[];
  /** The date to move to for previous / next; undefined where there is nowhere to go. */
  previous?: string;
  next?: string;
}

const MS_PER_DAY = 86_400_000;

export const toDay = (iso: string): number => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / MS_PER_DAY);
};

export const toIso = (day: number): string => new Date(day * MS_PER_DAY).toISOString().slice(0, 10);

const monthName = (day: number) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(day * MS_PER_DAY);

const parts = (day: number) => {
  const d = new Date(day * MS_PER_DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), date: d.getUTCDate() };
};

const dayOf = (year: number, month: number, date: number) => Math.round(Date.UTC(year, month, date) / MS_PER_DAY);

/** Group consecutive columns that share a key into spans. */
const groupBy = (columns: GanttColumn[], keyOf: (c: GanttColumn) => { key: string; label: string }) => {
  const groups: (GanttGroup & { key: string })[] = [];
  for (const column of columns) {
    const { key, label } = keyOf(column);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.span += 1;
    else groups.push({ key, label, span: 1 });
  }
  return groups.map(({ label, span }) => ({ label, span }));
};

const sortedCycles = (cycles: GanttCycle[]) =>
  cycles
    .map((c) => ({ ...c, s: toDay(c.start), e: toDay(c.end) }))
    .sort((a, b) => a.s - b.s);

/** The cycles' own dates, for a stable "previous / next" and for "which cycle is this day in". */
export function buildPeriod(view: GanttView, date: string, cycles: GanttCycle[]): GanttPeriod {
  const day = toDay(date);
  const { year, month } = parts(day);
  const list = sortedCycles(cycles);

  if (view === 'cycle') {
    /* The cycle holding the date; failing that, the first one after it, else the last. */
    const index = Math.max(
      0,
      list.findIndex((c) => c.s <= day && day <= c.e) !== -1
        ? list.findIndex((c) => c.s <= day && day <= c.e)
        : list.findIndex((c) => c.s > day) !== -1
          ? list.findIndex((c) => c.s > day)
          : list.length - 1,
    );
    const cycle = list[index];
    /* No cycles supplied: a fortnight from the date is a sensible empty chart. */
    const start = cycle ? cycle.s : day;
    const end = cycle ? cycle.e : day + 13;
    const columns: GanttColumn[] = [];
    for (let d = start; d <= end; d += 1) {
      columns.push({ key: toIso(d), label: String(parts(d).date), start: d, end: d });
    }
    return {
      columns,
      heading: [String(parts(start).year), monthName(start)],
      navLabel: cycle?.label ?? 'Cycle',
      groups: [],
      previous: cycle && index > 0 ? toIso(list[index - 1].s) : undefined,
      next: cycle && index < list.length - 1 ? toIso(list[index + 1].s) : undefined,
    };
  }

  if (view === 'month') {
    const first = dayOf(year, month, 1);
    const last = dayOf(year, month + 1, 0);
    const columns: GanttColumn[] = [];
    for (let d = first; d <= last; d += 1) {
      columns.push({ key: toIso(d), label: String(parts(d).date), start: d, end: d });
    }
    const cycleOf = (c: GanttColumn) => list.find((x) => x.s <= c.start && c.start <= x.e);
    return {
      columns,
      heading: [String(year)],
      navLabel: monthName(first),
      groups: groupBy(columns, (c) => {
        const cycle = cycleOf(c);
        return { key: cycle?.id ?? '', label: cycle?.label ?? '' };
      }),
      previous: toIso(dayOf(year, month - 1, 1)),
      next: toIso(dayOf(year, month + 1, 1)),
    };
  }

  /* year: one column per cycle that starts in it. */
  const columns: GanttColumn[] = list
    .filter((c) => parts(c.s).year === year)
    .map((c) => ({ key: c.id, label: c.short ?? c.label, start: c.s, end: c.e }));
  return {
    columns,
    heading: [],
    navLabel: String(year),
    groups: groupBy(columns, (c) => ({ key: String(parts(c.start).month), label: monthName(c.start) })),
    previous: toIso(dayOf(year - 1, 0, 1)),
    next: toIso(dayOf(year + 1, 0, 1)),
  };
}

/** Which column holds the day — or, in a gap between columns, the next one (`edge: 'start'`) or the previous (`'end'`). */
export function columnIndex(columns: GanttColumn[], day: number, edge: 'start' | 'end'): number {
  const inside = columns.findIndex((c) => c.start <= day && day <= c.end);
  if (inside !== -1) return inside;
  if (edge === 'start') return columns.findIndex((c) => c.start > day);
  let found = -1;
  columns.forEach((c, i) => {
    if (c.end < day) found = i;
  });
  return found;
}

export interface Placement {
  /** Zero-based first and last column the bar covers. */
  from: number;
  to: number;
}

/** Where a date range lands on the columns, or `null` when it is outside them. */
export function place(columns: GanttColumn[], start: string, end: string): Placement | null {
  if (columns.length === 0) return null;
  const s = toDay(start);
  const e = toDay(end);
  if (e < columns[0].start || s > columns[columns.length - 1].end) return null;
  const from = columnIndex(columns, Math.max(s, columns[0].start), 'start');
  const to = columnIndex(columns, Math.min(e, columns[columns.length - 1].end), 'end');
  if (from === -1 || to === -1 || to < from) return null;
  return { from, to };
}
