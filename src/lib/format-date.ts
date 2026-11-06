import * as React from 'react';

/**
 * How a date reads on screen: **dd/mm/yyyy** ("01/10/2025"), everywhere, unless the product says what the person's locale is. Dates travel as ISO `yyyy-mm-dd` strings and are formatted by splitting the string (or, for a
 * locale, in UTC), never through the machine's time zone, so a day never moves.
 *
 * `DateFormatProvider` carries the person's locale ("en-US", "de-DE"…) to every component that shows a date (`DateField`, `InlineDateEdit`, the Planning table, `DetailCard`, `FilterBar`); give it nothing and they all
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

/** What to write in an empty date field so it says its own format: "DD/MM/YYYY", or the locale's order ("MM/DD/YYYY"). */
export const datePlaceholder = (locale?: string): string => {
  if (!locale) return 'DD/MM/YYYY';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
    .formatToParts(new Date(Date.UTC(2001, 10, 22)))
    .map((part) => (part.type === 'day' ? 'DD' : part.type === 'month' ? 'MM' : part.type === 'year' ? 'YYYY' : part.value))
    .join('');
};

const DateFormatContext = React.createContext<string | undefined>(undefined);

/** Tell every date in the tree which locale to read in. Omit the provider, or `locale`, for dd/mm/yyyy. */
export function DateFormatProvider({ locale, children }: { locale?: string; children: React.ReactNode }) {
  return React.createElement(DateFormatContext.Provider, { value: locale }, children);
}

/** The formatter a component should use for a date it shows: the provider's locale, else dd/mm/yyyy. */
export function useDateFormat() {
  const locale = React.useContext(DateFormatContext);
  return React.useMemo(() => ({ format: (iso: string) => formatDate(iso, locale), placeholder: datePlaceholder(locale), locale }), [locale]);
}
