import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { MetricTile } from '../../components/metric-tile';

/**
 * AnnouncementsOverview — the top of the Announcements tab: a title card ("Announcements — View and manage announcements") and the
 * three facts under it: how many announcements there are, the latest version, and when it was last updated. Built to Figma's
 * `_Announcements_Title` (`Announcement Title Card` and `Metrics`).
 *
 * It only shows what it is given: the caller counts, finds the latest version and formats the date ("May 20, 2026"). The three tiles
 * share the width equally and stack when the container is narrow (a container query, not the viewport's).
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface AnnouncementsOverviewProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The card's title. */
  title?: string;
  description?: string;
  /** How many announcements there are. */
  total: number | string;
  /** The newest version, as it reads: "v1.18.1". */
  latestVersion: string;
  /** When the newest was updated, already formatted: "May 20, 2026". */
  lastUpdated: string;
}

export function AnnouncementsOverview({
  className,
  title = 'Announcements',
  description = 'View and manage announcements',
  total,
  latestVersion,
  lastUpdated,
  ...props
}: AnnouncementsOverviewProps) {
  return (
    <section aria-label={title} className={cn('@container flex flex-col gap-6 font-sans', className)} {...props}>
      <div className="flex items-center gap-4 rounded-md bg-surface-elevated p-8">
        <span aria-hidden="true" className="text-text-brand-medium">
          <Icon name="megaphone" className="size-12" />
        </span>
        <div className="flex flex-col">
          <h2 className="m-0 text-heading-lg-bold text-text-primary">{title}</h2>
          <p className="m-0 text-body-md-regular text-text-tertiary">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-3">
        <MetricTile icon="megaphone" tone="info" label="Total Announcements" value={total} />
        <MetricTile icon="eye" tone="success" label="Latest Version" value={latestVersion} />
        <MetricTile icon="calendar-blank" tone="brand" label="Last Updated" value={lastUpdated} />
      </div>
    </section>
  );
}
AnnouncementsOverview.displayName = 'AnnouncementsOverview';
