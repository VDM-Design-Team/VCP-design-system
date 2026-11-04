/** "2026-05-01" → "01/05/2026" — the day format the Holiday Registry draws. Read from the string, not a `Date`, so no time zone can move the day. */
export const formatDayMonthYear = (iso: string): string => {
  const [year, month, day] = iso.split('-');
  return year && month && day ? `${day}/${month}/${year}` : iso;
};
