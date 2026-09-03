import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';
import { Avatar } from '../../atoms/avatar';

/**
 * Timeline — a vertical run of events, newest wherever the caller puts it:
 * node, title, timestamp, optional actor and detail. An `<ol>`, because the
 * order is the meaning.
 *
 * **Generic tones only.** The export's `kind` took VCP lifecycle names —
 * `accepted`, `handoff`, `status` — and each such mapping is owned by exactly
 * one piece, as Badge ruled: `tone` here is neutral/brand/info/success/warning/
 * danger, and the future activity piece owns the event-kind → tone mapping.
 * (The export's `handoff` amber and `status` indigo also had no ramp — the
 * indigo was a raw literal with no token behind it.)
 *
 * Ring and glyph share one colour per tone — the darker `outline.content`
 * step, not the mid `outline.border` the export's look suggested, because a
 * yellow-500 ring on white measures 1.91:1 and vanishes. The tone is still
 * reinforcement: the icon shape and the words carry the event, so a
 * colour-blind reader loses nothing.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type TimelineTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

export interface TimelineItem {
  /** Identity across renders. Defaults to the index — fine for static lists. */
  id?: string;
  title: React.ReactNode;
  timestamp?: React.ReactNode;
  /** Renders an `Avatar` and the name under the title. */
  actor?: string;
  detail?: React.ReactNode;
  /** Colours the node. Generic only — the event-kind mapping is owned elsewhere. */
  tone?: TimelineTone;
  /** The node's glyph. Decorative — the title says what happened. */
  icon?: IconName;
}

export interface TimelineProps extends React.OlHTMLAttributes<HTMLOListElement> {
  items: readonly TimelineItem[];
}

/* One colour per tone, worn by ring and glyph alike. */
const TONE: Record<TimelineTone, string> = {
  neutral: 'border-stroke-stronger text-text-tertiary',
  brand: 'border-stroke-brand-strong text-text-brand-medium',
  info: 'border-accent-info-outline-content-default text-accent-info-outline-content-default',
  success:
    'border-accent-success-outline-content-default text-accent-success-outline-content-default',
  warning:
    'border-accent-warning-outline-content-default text-accent-warning-outline-content-default',
  danger:
    'border-accent-critical-outline-content-default text-accent-critical-outline-content-default',
};

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, items, ...props }, ref) => (
    <ol ref={ref} className={cn('m-0 flex list-none flex-col p-0 font-sans', className)} {...props}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <li key={item.id ?? i} className={cn('flex gap-3', !last && 'pb-4')}>
            <div className="flex shrink-0 flex-col items-center">
              {/* The node: a thin ring on the elevated surface, glyph inside. */}
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full border-2 bg-surface-elevated',
                  TONE[item.tone ?? 'neutral'],
                )}
              >
                <Icon name={item.icon ?? 'clock'} className="size-3.5" />
              </span>
              {/* The connector — decorative; the list order is the meaning. */}
              {!last && <span aria-hidden="true" className="mt-1 w-0.5 flex-1 bg-stroke-subtle" />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-label-md text-text-primary">{item.title}</span>
                {item.timestamp && (
                  <span className="text-label-sm text-text-subtle">{item.timestamp}</span>
                )}
              </div>
              {item.actor && (
                <span className="flex items-center gap-1.5">
                  <Avatar size="sm" name={item.actor} />
                  <span className="text-body-sm text-text-tertiary">{item.actor}</span>
                </span>
              )}
              {item.detail && <span className="text-body-sm text-text-tertiary">{item.detail}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  ),
);
Timeline.displayName = 'Timeline';
