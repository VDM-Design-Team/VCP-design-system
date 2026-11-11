import * as React from 'react';

/**
 * How a date reads on screen: **dd/mm/yyyy** ("01/10/2025"), everywhere, unless the product says what the person's locale is. Dates travel as ISO `yyyy-mm-dd` strings and are formatted by splitting the string (or, for a
 * locale, in UTC), never through the machine's time zone, so a day never moves.
 *
 * **A date and a time read "10/06/2026 14:37"**: the date as above, then a **24-hour** time, whatever the locale (the locale changes the date's order and separators, not the clock). `formatDateTime` and `formatTime` do it;
 * anything that shows a time uses them, so a time never reads two ways either. They take an ISO date-time:
 * - **With no zone** ("2026-06-10T14:37", "2026-06-10 14:37:05") the clock reads as written. Nothing is converted, so it cannot move.
 * - **With a zone** ("…Z", "…+02:00") it is an instant, so it is shown in the provider's `timeZone`, else in the person's own.
 * - **With no time** ("2026-06-10") it is just the date.
 * - **Anything else** comes back as given.
 *
 * `DateFormatProvider` carries the person's locale ("en-US", "de-DE"…) and, if the product knows it, their time zone ("Europe/Athens") to every component that shows a date (`DateField`, `InlineDateEdit`, the Planning table, `DetailCard`, `FilterBar`); give it nothing and they all
 * read dd/mm/yyyy. One place decides, so a date never reads two ways on one screen.
 */

const pad = (n: number | string) => String(n).padStart(2, '0');

/** "2026-05-01" → "01/05/2026". Read from the string, so no time zone can move the day. */
export const formatDayMonthYear = (iso: string): string => {
  const [year, month, day] = iso.slice(0, 10).split('-');
  return year && month && day ? `${pad(day)}/${pad(month)}/${year}` : iso;
};

/** An ISO date in a locale's own numeric order and separators ("en-US": 01/05/2026, "de-DE": 01.05.2026), in UTC so the day cannot move. Without a locale: dd/mm/yyyy. */
export const formatDate = (iso: string, locale?: string): string => {
  if (!locale) return formatDayMonthYear(iso);
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
};

const DATE_TIME = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i;

/**
 * An ISO date and time as its date and its 24-hour "HH:mm", or `null` when it is not one. No zone: as written. A zone: the instant, in `timeZone` (else the person's own).
 * Date-only strings have no time.
 */
const parseDateTime = (iso: string, timeZone?: string): { date: string; time: string | null } | null => {
  const match = DATE_TIME.exec(iso.trim());
  if (!match) return null;
  const [, date = '', hour, minute, zone] = match;
  if (hour === undefined || minute === undefined) return zone ? null : { date, time: null };
  if (!zone) return { date, time: `${hour}:${minute}` };
  /* The offset as ISO writes it, with its colon (+0200 becomes +02:00), which every engine reads. */
  const instant = new Date(iso.trim().replace(' ', 'T').replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  if (Number.isNaN(instant.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).formatToParts(instant);
  const at = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return { date: `${at('year')}-${at('month')}-${at('day')}`, time: `${at('hour')}:${at('minute')}` };
};

/** An ISO date and time as "10/06/2026 14:37": the date as `formatDate` writes it (the locale's order), then the 24-hour time. A date with no time is just the date; anything that is not ISO comes back as given. */
export const formatDateTime = (iso: string, locale?: string, timeZone?: string): string => {
  const parsed = parseDateTime(iso, timeZone);
  if (!parsed) return iso;
  return parsed.time ? `${formatDate(parsed.date, locale)} ${parsed.time}` : formatDate(parsed.date, locale);
};

/** Just the time of an ISO date and time, 24-hour: "14:37". A date with no time, or anything that is not ISO, comes back as given. */
export const formatTime = (iso: string, timeZone?: string): string => parseDateTime(iso, timeZone)?.time ?? iso;

/** A span of days, "20/09/2025 - 02/10/2026": each end as `formatDate` writes it. How every cycle's dates read. */
export const formatDateRange = (start: string, end: string, locale?: string): string =>
  `${formatDate(start, locale)} - ${formatDate(end, locale)}`;

/** What to write in an empty date field so it says its own format: "DD/MM/YYYY", or the locale's order ("MM/DD/YYYY"). */
export const datePlaceholder = (locale?: string): string => {
  if (!locale) return 'DD/MM/YYYY';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
    .formatToParts(new Date(Date.UTC(2001, 10, 22)))
    .map((part) => (part.type === 'day' ? 'DD' : part.type === 'month' ? 'MM' : part.type === 'year' ? 'YYYY' : part.value))
    .join('');
};

const DateFormatContext = React.createContext<{ locale?: string; timeZone?: string }>({});

/** Tell every date in the tree which locale to read in, and which time zone to show an instant in. Omit the provider, or `locale`, for dd/mm/yyyy; omit `timeZone` for the person's own. */
export function DateFormatProvider({ locale, timeZone, children }: { locale?: string; timeZone?: string; children: React.ReactNode }) {
  const value = React.useMemo(() => ({ locale, timeZone }), [locale, timeZone]);
  return React.createElement(DateFormatContext.Provider, { value }, children);
}

/** The formatter a component should use for a date or a time it shows: the provider's locale, else dd/mm/yyyy; and "dd/mm/yyyy HH:mm" (24-hour) for a date and time. */
export function useDateFormat() {
  const { locale, timeZone } = React.useContext(DateFormatContext);
  return React.useMemo(
    () => ({
      format: (iso: string) => formatDate(iso, locale),
      /** An ISO date and time: "10/06/2026 14:37". */
      dateTime: (iso: string) => formatDateTime(iso, locale, timeZone),
      /** Just the time of one: "14:37". */
      time: (iso: string) => formatTime(iso, timeZone),
      range: (start: string, end: string) => formatDateRange(start, end, locale),
      placeholder: datePlaceholder(locale),
      locale,
      timeZone,
    }),
    [locale, timeZone],
  );
}
