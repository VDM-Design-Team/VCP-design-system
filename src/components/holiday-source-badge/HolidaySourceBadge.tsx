import * as React from 'react';
import { Badge, type BadgeProps } from '../../atoms/badge';
import { Icon, type IconName } from '../../atoms/icon';

/**
 * HolidaySourceBadge — where a Holiday Registry entry came from: **Manual Entry** (a pencil), **Google Calendar** (a calendar) or **In Hubstaff** (a link). The owner of that vocabulary and
 * its look. Read off Figma's `_Holiday_Registry_Source_Badges` (`8048:125076`, revised November 2026): each is a `Badge` — fully rounded, 12 medium, the glyph before the word — Manual Entry in
 * the info tone, the other two in the success tone.
 *
 * The vocabulary is closed; a fourth source is a row here, which is a deliberate compile error at every `Record<HolidaySource, …>`. (`SourceTag` is a different thing: where an *Added Value*
 * came from, free text.)
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type HolidaySource = 'manual' | 'google-calendar' | 'hubstaff';

/** THE mapping: the word, the glyph and the tone. */
const SOURCE: Record<HolidaySource, { label: string; icon: IconName; tone: NonNullable<BadgeProps['tone']> }> = {
  manual: { label: 'Manual Entry', icon: 'pencil-simple', tone: 'info' },
  'google-calendar': { label: 'Google Calendar', icon: 'calendar-blank', tone: 'success' },
  hubstaff: { label: 'In Hubstaff', icon: 'link', tone: 'success' },
};

export interface HolidaySourceBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  source: HolidaySource;
}

export const HolidaySourceBadge = React.forwardRef<HTMLSpanElement, HolidaySourceBadgeProps>(({ source, ...props }, ref) => {
  const { label, icon, tone } = SOURCE[source];
  return (
    <Badge ref={ref} variant="tonal" tone={tone} size="md" icon={<Icon name={icon} size="sm" />} {...props}>
      {label}
    </Badge>
  );
});
HolidaySourceBadge.displayName = 'HolidaySourceBadge';
