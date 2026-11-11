import * as React from 'react';
import { Icon, type IconName } from '../../atoms/icon';
import { Tag } from '../../atoms/tag';

/**
 * HolidayTypeTag — what kind of holiday a Holiday Registry row is, as a glyph and a word: **Public** (a globe), **Team** (a group) or **Individual** (one person). The owner of that
 * vocabulary and its glyphs. Read off the Figma `_Holiday_Registry_Type_Holiday` set (`6155:73488`): a neutral tonal `Tag`, 24 tall, the glyph filled.
 *
 * The vocabulary is closed, like `TypeTag`'s: Figma draws exactly three. The glyph says it as well as the word, so the type never rides on colour.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type HolidayType = 'public' | 'team' | 'individual';

/** Every type, in the order the design lists them. */
export const HOLIDAY_TYPES: readonly HolidayType[] = ['public', 'team', 'individual'];

/** THE mapping: the word and the glyph. */
const TYPE: Record<HolidayType, { label: string; icon: IconName }> = {
  public: { label: 'Public', icon: 'globe-fill' },
  team: { label: 'Team', icon: 'users-three-fill' },
  individual: { label: 'Individual', icon: 'user-fill' },
};

/** The word for a type — for a select's options and anywhere else it is named. */
export const holidayTypeLabel = (type: HolidayType): string => TYPE[type].label;

export interface HolidayTypeTagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  type: HolidayType;
}

export const HolidayTypeTag = React.forwardRef<HTMLSpanElement, HolidayTypeTagProps>(({ type, ...props }, ref) => {
  const { label, icon } = TYPE[type];
  return (
    <Tag ref={ref} variant="tonal" tone="neutral" size="sm" icon={<Icon name={icon} size="sm" />} {...props}>
      {label}
    </Tag>
  );
});
HolidayTypeTag.displayName = 'HolidayTypeTag';
