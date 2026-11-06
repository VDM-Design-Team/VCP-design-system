/**
 * The five series every VCP chart draws — Completed, Committed, Overdue, Available, Leave — and the one place that says
 * what each looks like, so a legend, a bar and a line can never disagree and "Overdue" is the same red on every chart.
 * (The Figma charts drew it red in three and orange in one, and the two blues differed from chart to chart.)
 *
 * Each series is a fill token and the content token that reads on it, both themes included. **Every number is one colour per
 * theme** — white in light, near-black in dark — because every fill here follows the system's filled-surface rule; no series
 * has a pale fill that needs the opposite text. Each clears 4.5:1 in both themes. Colour is never the only signal: a chart
 * also names its series in a legend and gives its values as text.
 *
 * | Series | Fill | Number on it | Light | Dark |
 * |---|---|---|---|---|
 * | `completed` | `accent.success.filled.surface` | `accent.success.filled.content` | 4.95 | 6.27 |
 * | `committed` | `surface.brand.strong` | `action.primary.content` | 6.18 | 8.73 |
 * | `overdue` | `accent.critical.filled.surface` | `accent.critical.filled.content` | 4.77 | 5.30 |
 * | `available` | `surface.brand.stronger` | `action.primary.content` | 13.23 | 13.69 |
 * | `leave` | `accent.warning.filled.surface` | `accent.warning.filled.content` | 4.93 | 10.56 |
 *
 * Available is the deepest blue and Committed the step lighter (in dark the ramp flips, so Available is the lighter of the
 * two there). They are 2.14:1 apart in light and 1.57:1 in dark, with a 1 gap between segments.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type ChartSeries = 'completed' | 'committed' | 'overdue' | 'available' | 'leave';

export interface ChartSeriesStyle {
  /** What a legend and a screen reader call it. */
  label: string;
  /** The fill, as a `bg-*` class. */
  fill: string;
  /** The colour of a number written on that fill, as a `text-*` class. */
  content: string;
}

export const CHART_SERIES: Record<ChartSeries, ChartSeriesStyle> = {
  completed: { label: 'Completed', fill: 'bg-accent-success-filled-surface-default', content: 'text-accent-success-filled-content-default' },
  committed: { label: 'Committed', fill: 'bg-surface-brand-strong', content: 'text-action-primary-content-default' },
  overdue: { label: 'Overdue', fill: 'bg-accent-critical-filled-surface-default', content: 'text-accent-critical-filled-content-default' },
  available: { label: 'Available', fill: 'bg-surface-brand-stronger', content: 'text-action-primary-content-default' },
  leave: { label: 'Leave', fill: 'bg-accent-warning-filled-surface-default', content: 'text-accent-warning-filled-content-default' },
};

/** The order a legend lists them in, and a stacked bar draws them in. */
export const CHART_SERIES_ORDER: readonly ChartSeries[] = ['completed', 'committed', 'overdue', 'available', 'leave'];

/** The series a set of things (segments, members' segments) has, in the system's order, each once: what a legend lists. */
export const seriesIn = (...lists: readonly (readonly { series: ChartSeries }[])[]): ChartSeries[] => {
  const present = new Set<ChartSeries>();
  for (const list of lists) for (const item of list) present.add(item.series);
  return CHART_SERIES_ORDER.filter((s) => present.has(s));
};
