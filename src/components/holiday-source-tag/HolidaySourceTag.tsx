import * as React from 'react';
import { Icon, type IconName } from '../../atoms/icon';
import { Tag, type TagTone } from '../../atoms/tag';

/**
 * HolidaySourceTag — where a Holiday Registry entry came from: **Manual Entry** (typed in here, a pencil), **Google Calendar** (a calendar) or **In Hubstaff** (a link). The owner of that
 * vocabulary and its look. Read off Figma's `_Holiday_Registry_Source_Badges` (`8048:125076`): tonal tags, 28 tall — Manual Entry in the info tone with its glyph after the word, the other two
 * in the success tone, Google Calendar's glyph before and In Hubstaff's after.
 *
 * The vocabulary is closed; a fourth source is a row here, which is a deliberate compile error at every `Record<HolidaySource, …>`. (`SourceTag` is a different thing: where an *Added Value*
 * came from, free text.)
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type HolidaySource = 'manual' | 'google-calendar' | 'hubstaff';

/** THE mapping: the word, the glyph, which side it sits on, and the tone. */
const SOURCE: Record<HolidaySource, { label: string; icon: IconName; side: 'before' | 'after'; tone: TagTone }> = {
  manual: { label: 'Manual Entry', icon: 'pencil-simple', side: 'after', tone: 'info' },
  'google-calendar': { label: 'Google Calendar', icon: 'calendar-blank', side: 'before', tone: 'success' },
  hubstaff: { label: 'In Hubstaff', icon: 'link', side: 'after', tone: 'success' },
};

export interface HolidaySourceTagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  source: HolidaySource;
}

export const HolidaySourceTag = React.forwardRef<HTMLSpanElement, HolidaySourceTagProps>(({ source, ...props }, ref) => {
  const { label, icon, side, tone } = SOURCE[source];
  const glyph = <Icon name={icon} size="sm" />;
  return (
    <Tag ref={ref} variant="tonal" tone={tone} icon={side === 'before' ? glyph : undefined} trailingIcon={side === 'after' ? glyph : undefined} {...props}>
      {label}
    </Tag>
  );
});
HolidaySourceTag.displayName = 'HolidaySourceTag';
