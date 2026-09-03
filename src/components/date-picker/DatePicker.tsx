import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../icon-button';

/**
 * DatePicker — the calendar panel: one month of named day buttons, month
 * navigation, optional range shading, day markers and flagged dates. The
 * *panel* only — pair it with an `Input` in a `Popover` (the story shows the
 * composition); an inline calendar is just this, no wrapping.
 *
 * **Generic affordances, not VCP vocabulary.** The export painted `capacity`
 * load-dots and tinted `holidays` "from the Holiday Registry" — planning
 * domain that belongs to patterns, per the Badge/Timeline rulings. Here:
 * `markers` puts a toned dot under any date, `flagged` tints dates as
 * unavailable-but-selectable; the planning patterns map capacity and the
 * registry onto them.
 *
 * Dates are ISO `yyyy-mm-dd` strings end to end, parsed and formatted in
 * LOCAL time — the export round-tripped through `toISOString()`, which
 * shifts dates across midnight for anyone east of UTC.
 *
 * Keyboard: the day grid is one tab stop (roving tabindex). Arrows move by
 * day and week and cross month boundaries — the view follows the focus.
 * The month heading is a polite live region, so paging is announced.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type DatePickerMarker = 'success' | 'warning' | 'danger';

export interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** ISO `yyyy-mm-dd`. */
  value?: string;
  onChange?: (iso: string) => void;
  /** Controlled visible month — any ISO date inside it. */
  month?: string;
  onMonthChange?: (iso: string) => void;
  /** ISO date → dot tone under the day. Meaning is the caller's — pair with a legend. */
  markers?: Record<string, DatePickerMarker>;
  /** ISO dates tinted as unavailable-but-selectable — holidays, freezes. */
  flagged?: readonly string[];
  /** With `value`, shades the days between (exclusive) and marks the end. */
  rangeEnd?: string;
  /** ISO bounds, inclusive. Days outside are disabled. */
  min?: string;
  max?: string;
}

/* Monday-first, as VCP plans. */
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const MARKER: Record<DatePickerMarker, string> = {
  success: 'bg-accent-success-filled-surface-default',
  warning: 'bg-accent-warning-filled-surface-default',
  danger: 'bg-accent-critical-filled-surface-default',
};

/* ISO in LOCAL time — new Date().toISOString() shifts east-of-UTC dates. */
const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      className,
      value,
      onChange,
      month,
      onMonthChange,
      markers = {},
      flagged = [],
      rangeEnd,
      min,
      max,
      ...props
    },
    ref,
  ) => {
    const [innerMonth, setInnerMonth] = React.useState(() =>
      value ? parseIso(value) : new Date(),
    );
    const view = month ? parseIso(month) : innerMonth;
    const setView = (d: Date) => {
      setInnerMonth(d);
      onMonthChange?.(toIso(d));
    };

    const year = view.getFullYear();
    const monthIndex = view.getMonth();
    const lead = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const days: Date[] = [];
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, monthIndex, d));

    const monthName = view.toLocaleString('en', { month: 'long' });
    const inMonth = (isoDate: string) =>
      isoDate.startsWith(`${year}-${pad(monthIndex + 1)}`);

    /* Roving focus over the days: one tab stop; arrows move by day/week and
       drag the view across month boundaries. */
    const [focusIso, setFocusIso] = React.useState(() => value ?? toIso(new Date()));
    const pendingFocus = React.useRef(false);
    const dayButtons = React.useRef(new Map<string, HTMLButtonElement>());
    const tabStop = inMonth(focusIso) ? focusIso : toIso(days[0]);

    React.useEffect(() => {
      if (pendingFocus.current) {
        pendingFocus.current = false;
        dayButtons.current.get(focusIso)?.focus();
      }
    });

    const moveFocus = (deltaDays: number) => {
      const target = parseIso(tabStop);
      target.setDate(target.getDate() + deltaDays);
      const targetIso = toIso(target);
      if ((min && targetIso < min) || (max && targetIso > max)) return;
      setFocusIso(targetIso);
      pendingFocus.current = true;
      if (!inMonth(targetIso)) setView(new Date(target.getFullYear(), target.getMonth(), 1));
    };

    const disabled = (isoDate: string) =>
      Boolean((min && isoDate < min) || (max && isoDate > max));
    const inRange = (isoDate: string) =>
      Boolean(value && rangeEnd && isoDate > value && isoDate < rangeEnd);

    return (
      <div
        ref={ref}
        /* w-75 = the export's 300 panel, on the spacing scale. */
        className={cn(
          'w-75 rounded-md border border-stroke-subtle bg-surface-elevated p-3.5 font-sans shadow-menu',
          className,
        )}
        {...props}
      >
        <div className="mb-2.5 flex items-center justify-between">
          <IconButton
            variant="tertiary"
            size="sm"
            icon="caret-left"
            label="Previous month"
            onClick={() => setView(new Date(year, monthIndex - 1, 1))}
          />
          {/* Announces month changes without stealing focus from the grid. */}
          <span aria-live="polite" className="text-label-lg text-text-primary">
            {monthName} {year}
          </span>
          <IconButton
            variant="tertiary"
            size="sm"
            icon="caret-right"
            label="Next month"
            onClick={() => setView(new Date(year, monthIndex + 1, 1))}
          />
        </div>
        <div aria-hidden="true" className="mb-1 grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-1 text-center text-label-sm text-text-subtle">
              {d}
            </span>
          ))}
        </div>
        <div
          className="grid grid-cols-7 gap-0.5"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); moveFocus(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(-1); }
            if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(7); }
            if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-7); }
          }}
        >
          {Array.from({ length: lead }).map((_, i) => (
            <span key={`lead-${i}`} aria-hidden="true" />
          ))}
          {days.map((day) => {
            const isoDate = toIso(day);
            const selected = isoDate === value || isoDate === rangeEnd;
            const isFlagged = flagged.includes(isoDate);
            const marker = markers[isoDate];
            return (
              <button
                key={isoDate}
                ref={(el) => {
                  if (el) dayButtons.current.set(isoDate, el);
                  else dayButtons.current.delete(isoDate);
                }}
                type="button"
                tabIndex={isoDate === tabStop ? 0 : -1}
                disabled={disabled(isoDate)}
                aria-pressed={selected || undefined}
                aria-label={`${day.getDate()} ${monthName} ${year}${isFlagged ? ', flagged' : ''}`}
                onClick={() => onChange?.(isoDate)}
                onFocus={() => setFocusIso(isoDate)}
                className={cn(
                  'relative grid h-9 place-items-center rounded-md font-numeric text-caption-md transition-colors',
                  selected
                    ? 'bg-action-primary-surface-default text-action-primary-content-default'
                    : inRange(isoDate)
                      ? 'bg-surface-brand-faint text-text-primary'
                      : isFlagged
                        ? 'bg-accent-critical-tonal-surface-default text-accent-critical-tonal-content-default'
                        : 'text-text-primary hover:bg-surface-neutral-faint',
                  'disabled:pointer-events-none disabled:text-text-disabled',
                  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
                )}
              >
                {day.getDate()}
                {marker && !selected && (
                  /* Decorative — its meaning needs the caller's legend. */
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full',
                      MARKER[marker],
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
DatePicker.displayName = 'DatePicker';
