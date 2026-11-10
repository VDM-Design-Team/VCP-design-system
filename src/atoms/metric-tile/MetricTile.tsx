import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../icon';

/**
 * MetricTile — one number with a name and a tinted icon tile beside it: "Total Announcements 11". Built to Figma's
 * `Announcement Total` / `Latest Version` / `Last Updated` tiles on the Announcements tab.
 *
 * It is not `StatCard`: that is a stripe-topped card for dashboards (a label over a 32 value, with a unit and a hint). This is the
 * quieter settings-page tile — an icon on a tinted square, the label, and a 20 bold value. Use it for a short row of facts about
 * one thing, never for dashboard KPIs.
 *
 * - **`tone`** tints the icon tile: `info` (blue), `success` (green) or `brand`. The tone is decoration, not status: the label and
 *   value say everything, and the icon is hidden from assistive tech.
 * - **The value is text** ("11", "v1.18.1", "May 20, 2026"), formatted by the caller.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type MetricTileTone = 'info' | 'success' | 'brand';

const TONE: Record<MetricTileTone, string> = {
  info: 'bg-accent-info-tonal-surface-default text-accent-info-tonal-content-default',
  success: 'bg-accent-success-tonal-surface-default text-accent-success-tonal-content-default',
  brand: 'bg-surface-brand-base text-text-brand-medium',
};

export interface MetricTileProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  icon: IconName;
  tone?: MetricTileTone;
  /** What the value is — "Total Announcements". */
  label: React.ReactNode;
  /** The value, as text. */
  value: React.ReactNode;
}

export const MetricTile = React.forwardRef<HTMLDivElement, MetricTileProps>(
  ({ className, icon, tone = 'info', label, value, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex min-w-0 items-center gap-4 rounded-md bg-surface-elevated p-8 font-sans', className)}
      {...props}
    >
      <span aria-hidden="true" className={cn('grid size-11 shrink-0 place-items-center rounded-sm', TONE[tone])}>
        <Icon name={icon} size="lg" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-label-md-medium text-text-tertiary">{label}</span>
        <span className="text-heading-md-bold text-text-primary">{value}</span>
      </div>
    </div>
  ),
);
MetricTile.displayName = 'MetricTile';
