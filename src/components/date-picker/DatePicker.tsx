import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';

/**
 * DatePicker — the calendar panel, in the four shapes the Figma
 * `Date_Picker_VCP` set draws (3169:1227, revised 5 Oct 2026):
 *
 * - `mode` — **day** (one date), **range** (two clicks: start, then end) or
 *   **month** (a year of months). In day and range mode the month heading is a
 *   toggle: "Jun 2022 ▾" swaps the panel to the month grid, whose heading reads
 *   "2022 ▴" and swaps back. The panel's footer stays put across the swap.
 * - `dualView` — two calendars side by side, each paging on its own, so a
 *   range can start in June and end in September with both ends visible.
 * - `mobile` — the touch layout: 40-point day targets (`h-10`), full width, presets as a
 *   scrolling row across the top instead of a column down the side.
 * - the footer **Clear** button (Figma's `Button=Yes`) is **on by default**;
 *   `clearable={false}` turns it off, `onClear` is what it does and `clearLabel`
 *   renames it (Figma's range variant says "Cancel").
 *
 * `presets` are the quick picks Figma lists beside the calendar ("Today",
 * "Last 7 days", "Overdue"…). The panel only knows label → dates; what
 * "Overdue" means is the caller's to compute, same as `markers`/`flagged`.
 *
 * The *panel* only — pair it with a trigger in a `Popover` (the story shows
 * the composition); an inline calendar is just this, no wrapping.
 *
 * Dates are ISO `yyyy-mm-dd` strings end to end, parsed and formatted in
 * LOCAL time — the export round-tripped through `toISOString()`, which
 * shifts dates across midnight for anyone east of UTC.
 *
 * Type (design review, 5 Oct 2026): weekdays `caption-md-semibold` in
 * `text.tertiary`; day and month cells `label-sm-regular` in `text.secondary`;
 * today's date and today's month `label-sm-semibold`; the days between a range's
 * ends `label-sm-medium` in `text.primary`; the selected ends `label-sm-semibold`.
 * The heading is `label-sm-medium` in `text.secondary`, and the carets —
 * previous, next and the heading's — follow `neutral.textual.content` through
 * default, hover and pressed (not the action blue). Every clickable cell and
 * toggle shows the pointer cursor.
 *
 * Keyboard: each grid is one tab stop (roving tabindex). Arrows move by day
 * and week (or month and row of months) and cross boundaries — the view
 * follows the focus. The heading is a polite live region, so paging is
 * announced.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type DatePickerMarker = 'success' | 'warning' | 'danger';
export type DatePickerMode = 'day' | 'range' | 'month';

export interface DatePickerPreset {
  label: string;
  /** ISO start (or the single day, outside range mode). */
  value: string;
  /** ISO end, for range presets. */
  rangeEnd?: string;
  /**
   * A filter rather than a period (Overdue, Due Soon): clicking it leaves the
   * calendar and the value alone and only calls `onSelect`. Range mode only.
   */
  filter?: boolean;
  onSelect?: () => void;
}

export interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** What a click picks. Default `day`. */
  mode?: DatePickerMode;
  /** ISO `yyyy-mm-dd`. The day, the range start, or (month mode) any day in the month. */
  value?: string;
  /** Day mode: the picked day. Month mode: the first of the picked month. */
  onChange?: (iso: string) => void;
  /** With `value`, shades the days between (exclusive) and marks the end. */
  rangeEnd?: string;
  /** Range mode: the first click starts a range (`end` undefined), the second ends it. */
  onRangeChange?: (start: string, end?: string) => void;
  /** Controlled visible month (the first calendar's, in dual view) — any ISO date inside it. */
  month?: string;
  onMonthChange?: (iso: string) => void;
  /** Two calendars side by side, paging independently. Day and range mode only. */
  dualView?: boolean;
  /** Touch layout: `h-10` day targets, full width, presets as a scrolling row. */
  mobile?: boolean;
  /** Quick picks beside (or, on mobile, above) the calendar. */
  presets?: readonly DatePickerPreset[];
  /**
   * The footer Clear button. On by default — turn it off with `false`. It sits
   * in the same place in the day and month views.
   */
  clearable?: boolean;
  /** What the Clear button does. The panel holds no value of its own to reset. */
  onClear?: () => void;
  /** The footer button's label. Default "Clear". */
  clearLabel?: string;
  /** ISO date → dot tone under the day. Meaning is the caller's — pair with a legend. */
  markers?: Record<string, DatePickerMarker>;
  /** ISO dates tinted as unavailable-but-selectable — holidays, freezes. */
  flagged?: readonly string[];
  /** ISO bounds, inclusive. Days (and months) outside are disabled. */
  min?: string;
  max?: string;
  /** The day drawn as today. Defaults to the real today; stories pin it. */
  today?: string;
}

/* Monday-first, as VCP plans. */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
const firstOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const monthKey = (y: number, m: number) => `${y}-${pad(m + 1)}`;

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused';

/* The carets are `neutral.textual.content` — one colour per state — not the
   action blue a tertiary icon button wears by default. */
const CARET_COLOUR =
  'text-neutral-textual-content-default hover:text-neutral-textual-content-hover active:text-neutral-textual-content-pressed';

/** The day and month grids share the roving-focus mechanics. */
function useRovingFocus() {
  /* The cell that should take focus once it has rendered — the key itself,
     not a yes/no flag. React can flush an earlier render's effect at the
     start of handling the next key; a flag would let that stale effect
     focus the *old* cell and clear itself. Holding the target means any
     effect that runs focuses the right cell, and only clears once it has. */
  const pendingFocus = React.useRef<string | null>(null);
  const cells = React.useRef(new Map<string, HTMLButtonElement>());
  React.useEffect(() => {
    const target = pendingFocus.current;
    const cell = target ? cells.current.get(target) : undefined;
    if (cell) {
      pendingFocus.current = null;
      cell.focus();
    }
  });
  const register = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) cells.current.set(key, el);
    else cells.current.delete(key);
  };
  return { pendingFocus, register };
}

const arrowDelta = (key: string, row: number) =>
  ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: row, ArrowUp: -row })[key];

interface Shared {
  value?: string;
  rangeEnd?: string;
  min?: string;
  max?: string;
  markers: Record<string, DatePickerMarker>;
  flagged: readonly string[];
  today: string;
  mobile: boolean;
}

/** The header row: previous, heading, next. */
function Header({
  heading,
  shortHeading = heading,
  unit,
  onPrev,
  onNext,
  onHeadingClick,
  headingLabel,
  caret = 'down',
}: {
  heading: string;
  /** What's drawn — Figma's "Jun 2022". `heading` is what's announced. */
  shortHeading?: string;
  unit: 'month' | 'year';
  onPrev: () => void;
  onNext: () => void;
  /** Makes the heading a toggle between the day and month views. */
  onHeadingClick?: () => void;
  /** The toggle's accessible name — say where it goes. */
  headingLabel?: string;
  /** Which way the heading's caret points: down opens the months, up goes back. */
  caret?: 'down' | 'up';
}) {
  /* Announces paging without stealing focus from the grid — in full, while
     the eye gets Figma's short form. */
  const live = (
    <span aria-live="polite">
      <span aria-hidden="true">{shortHeading}</span>
      <span className="sr-only">{heading}</span>
    </span>
  );
  const caretIcon = caret === 'up' ? 'caret-up-fill' : 'caret-down-fill';
  return (
    /* h-6 = Figma's 24 header; the 36 nav targets overhang it (-my-1.5)
       rather than pushing the grid down. */
    <div className="flex h-6 items-center justify-between">
      <IconButton
        variant="tertiary"
        size="sm"
        icon="caret-left"
        label={`Previous ${unit}`}
        onClick={onPrev}
        className={cn('-my-1.5 cursor-pointer', CARET_COLOUR)}
      />
      {onHeadingClick ? (
        /* Figma's small textual button, filling the header's 24: the label in
           text.secondary, a 12 filled caret on the neutral-textual colours,
           which change with the button's state. */
        <button
          type="button"
          onClick={onHeadingClick}
          aria-label={headingLabel ?? heading}
          className={cn(
            'group flex h-6 cursor-pointer items-center gap-2 rounded-sm px-3 transition-colors',
            'text-label-sm-medium text-text-secondary',
            FOCUS_RING,
          )}
        >
          {live}
          <Icon
            name={caretIcon}
            aria-hidden="true"
            className="size-3 shrink-0 text-neutral-textual-content-default group-hover:text-neutral-textual-content-hover group-active:text-neutral-textual-content-pressed"
          />
        </button>
      ) : (
        /* A heading with nothing to toggle to (month mode on its own) — the
           same look, not a button. */
        <span className="flex h-6 items-center gap-2 px-3 text-label-sm-medium text-text-secondary">
          {live}
          <Icon
            name={caretIcon}
            aria-hidden="true"
            className="size-3 shrink-0 text-neutral-textual-content-default"
          />
        </span>
      )}
      <IconButton
        variant="tertiary"
        size="sm"
        icon="caret-right"
        label={`Next ${unit}`}
        onClick={onNext}
        className={cn('-my-1.5 cursor-pointer', CARET_COLOUR)}
      />
    </div>
  );
}

/** One month of days. */
function DayGrid({
  view,
  setView,
  onPick,
  onHeadingClick,
  shared,
}: {
  view: Date;
  setView: (d: Date) => void;
  onPick: (iso: string) => void;
  onHeadingClick: () => void;
  shared: Shared;
}) {
  const { value, rangeEnd, min, max, markers, flagged, today, mobile } = shared;
  const year = view.getFullYear();
  const monthIndex = view.getMonth();
  const monthName = view.toLocaleString('en', { month: 'long' });
  const lead = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const trail = (7 - ((lead + daysInMonth) % 7)) % 7;
  const days: Date[] = [];
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, monthIndex, d));
  const inMonth = (isoDate: string) => isoDate.startsWith(monthKey(year, monthIndex));

  /* Roving focus over the days: one tab stop; arrows move by day/week and
     drag the view across month boundaries. */
  const [focusIso, setFocusIso] = React.useState(() => value ?? today);
  const { pendingFocus, register } = useRovingFocus();
  const tabStop = inMonth(focusIso) ? focusIso : toIso(days[0]);

  const moveFocus = (deltaDays: number) => {
    const target = parseIso(tabStop);
    target.setDate(target.getDate() + deltaDays);
    const targetIso = toIso(target);
    if ((min && targetIso < min) || (max && targetIso > max)) return;
    pendingFocus.current = targetIso;
    setFocusIso(targetIso);
    if (!inMonth(targetIso)) setView(firstOf(target));
  };

  const disabled = (isoDate: string) =>
    Boolean((min && isoDate < min) || (max && isoDate > max));
  const ranged = Boolean(value && rangeEnd && rangeEnd > value);

  /* The neighbouring months' days, greyed — Figma draws them; they're not
     targets (the arrows and the month buttons get you there). Figma greys
     them with text.disabled (1.48:1), which axe rightly fails for text a
     reader may still want; text.subtle is the lightest grey that reads. */
  const spill = (d: Date) => (
    <span
      key={toIso(d)}
      aria-hidden="true"
      className={cn(
        'grid place-items-center text-label-sm-regular text-text-subtle',
        mobile ? 'h-10' : 'h-8',
      )}
    >
      {d.getDate()}
    </span>
  );

  return (
    <>
      <Header
        heading={`${monthName} ${year}`}
        shortHeading={`${view.toLocaleString('en', { month: 'short' })} ${year}`}
        unit="month"
        onPrev={() => setView(addMonths(view, -1))}
        onNext={() => setView(addMonths(view, 1))}
        onHeadingClick={onHeadingClick}
        headingLabel={`${monthName} ${year}, choose month`}
        caret="down"
      />
      {/* Seven 36 columns, exactly Figma's 252. A column that is not a whole
          number of pixels (260 ÷ 7 in the dual view) anti-aliases the seam
          between two tinted cells into a visible line, which is what a range
          must not have. The grid centres in a wider calendar. */}
      <div className={mobile ? undefined : 'mx-auto w-63'}>
        <div aria-hidden="true" className="grid grid-cols-7">
          {WEEKDAYS.map((d) => (
            <span
              key={d}
              className="grid h-9 place-items-center text-caption-md-semibold text-text-tertiary"
            >
              {d}
            </span>
          ))}
        </div>
        <div
          /* Rows sit 35 apart (a 32 cell and 3 between), Figma's pitch — the
             tint runs unbroken along a row, and the rows read as bands. */
          className={cn('grid grid-cols-7', mobile ? 'gap-y-2' : 'gap-y-0.75')}
          onKeyDown={(e) => {
            const delta = arrowDelta(e.key, 7);
            if (delta) {
              e.preventDefault();
              moveFocus(delta);
            }
          }}
        >
          {Array.from({ length: lead }, (_, i) =>
            spill(new Date(year, monthIndex, i - lead + 1)),
          )}
          {days.map((day) => {
            const isoDate = toIso(day);
            const isStart = isoDate === value;
            const isEnd = isoDate === rangeEnd;
            const selected = isStart || isEnd;
            const between = ranged && isoDate > value! && isoDate < rangeEnd!;
            const isFlagged = flagged.includes(isoDate);
            const marker = markers[isoDate];
            return (
              <button
                key={isoDate}
                ref={register(isoDate)}
                type="button"
                tabIndex={isoDate === tabStop ? 0 : -1}
                disabled={disabled(isoDate)}
                aria-pressed={selected || undefined}
                aria-current={isoDate === today ? 'date' : undefined}
                aria-label={`${day.getDate()} ${monthName} ${year}${isFlagged ? ', flagged' : ''}`}
                onClick={() => onPick(isoDate)}
                onFocus={() => setFocusIso(isoDate)}
                className={cn(
                  'relative grid cursor-pointer place-items-center text-label-sm-regular transition-colors',
                  mobile ? 'h-10' : 'h-8',
                  /* A range reads as one bar: the ends round their outer
                     corners only, the days between run square. */
                  selected
                    ? cn(
                        'bg-surface-brand-strong text-label-sm-semibold text-text-inverted-primary',
                        ranged && isStart && !isEnd
                          ? 'rounded-l-md'
                          : ranged && isEnd && !isStart
                            ? 'rounded-r-md'
                            : 'rounded-md',
                      )
                    : between
                      ? 'bg-surface-brand-faint text-label-sm-medium text-text-primary'
                      : isFlagged
                        ? 'rounded-md bg-accent-critical-tonal-surface-default text-accent-critical-tonal-content-default'
                        : cn(
                            'rounded-md hover:bg-surface-neutral-subtle',
                            isoDate === today
                              ? 'text-label-sm-semibold text-text-primary'
                              : 'text-text-secondary',
                          ),
                  'disabled:pointer-events-none disabled:text-text-disabled',
                  FOCUS_RING,
                )}
              >
                {day.getDate()}
                {marker && !selected && (
                  /* Decorative — its meaning needs the caller's legend. */
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full',
                      MARKER[marker],
                    )}
                  />
                )}
              </button>
            );
          })}
          {Array.from({ length: trail }, (_, i) =>
            spill(new Date(year, monthIndex + 1, i + 1)),
          )}
        </div>
      </div>
    </>
  );
}

/** A year of months, three to a row. */
function MonthGrid({
  view,
  setView,
  selected,
  onPick,
  onHeadingClick,
  shared,
}: {
  view: Date;
  setView: (d: Date) => void;
  /** `yyyy-mm` of the highlighted month. */
  selected?: string;
  onPick: (month: Date) => void;
  /** Swaps back to the days. Omit in month mode, where there are none. */
  onHeadingClick?: () => void;
  shared: Shared;
}) {
  const { min, max, mobile, today } = shared;
  const year = view.getFullYear();
  const [focusKey, setFocusKey] = React.useState(() => selected ?? monthKey(year, view.getMonth()));
  const { pendingFocus, register } = useRovingFocus();
  const tabStop = focusKey.startsWith(`${year}-`) ? focusKey : monthKey(year, 0);

  /* A month is out when it ends before `min` or starts after `max`. */
  const disabled = (m: number) =>
    Boolean((min && monthKey(year, m) < min.slice(0, 7)) || (max && monthKey(year, m) > max.slice(0, 7)));

  const moveFocus = (delta: number) => {
    const [y, m] = tabStop.split('-').map(Number);
    const target = new Date(y, m - 1 + delta, 1);
    const key = monthKey(target.getFullYear(), target.getMonth());
    if ((min && key < min.slice(0, 7)) || (max && key > max.slice(0, 7))) return;
    pendingFocus.current = key;
    setFocusKey(key);
    if (target.getFullYear() !== year) setView(target);
  };

  return (
    <>
      <Header
        heading={String(year)}
        unit="year"
        onPrev={() => setView(new Date(year - 1, view.getMonth(), 1))}
        onNext={() => setView(new Date(year + 1, view.getMonth(), 1))}
        onHeadingClick={onHeadingClick}
        headingLabel={`${year}, show days`}
        caret="up"
      />
      <div
        className="grid grid-cols-3"
        onKeyDown={(e) => {
          const delta = arrowDelta(e.key, 3);
          if (delta) {
            e.preventDefault();
            moveFocus(delta);
          }
        }}
      >
        {Array.from({ length: 12 }, (_, m) => {
          const key = monthKey(year, m);
          const date = new Date(year, m, 1);
          const isSelected = key === selected;
          const isThisMonth = key === today.slice(0, 7);
          return (
            <button
              key={key}
              ref={register(key)}
              type="button"
              tabIndex={key === tabStop ? 0 : -1}
              disabled={disabled(m)}
              aria-pressed={isSelected || undefined}
              aria-label={`${date.toLocaleString('en', { month: 'long' })} ${year}`}
              onClick={() => onPick(date)}
              onFocus={() => setFocusKey(key)}
              className={cn(
                /* h-13 = Figma's 52 month rows (208 grid ÷ 4). */
                'grid cursor-pointer place-items-center rounded-md text-label-sm-regular transition-colors',
                mobile ? 'h-14' : 'h-13',
                isSelected
                  ? 'bg-surface-brand-strong text-label-sm-semibold text-text-inverted-primary'
                  : cn(
                      'hover:bg-surface-neutral-subtle',
                      isThisMonth
                        ? 'text-label-sm-semibold text-text-primary'
                        : 'text-text-secondary',
                    ),
                'disabled:pointer-events-none disabled:text-text-disabled',
                FOCUS_RING,
              )}
            >
              {date.toLocaleString('en', { month: 'short' })}
            </button>
          );
        })}
      </div>
    </>
  );
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      className,
      mode = 'day',
      value,
      onChange,
      rangeEnd,
      onRangeChange,
      month,
      onMonthChange,
      dualView = false,
      mobile = false,
      presets,
      clearable = true,
      onClear,
      clearLabel = 'Clear',
      markers = {},
      flagged = [],
      min,
      max,
      today = toIso(new Date()),
      ...props
    },
    ref,
  ) => {
    const [innerMonth, setInnerMonth] = React.useState(() => firstOf(parseIso(value ?? today)));
    const view = month ? firstOf(parseIso(month)) : innerMonth;
    const setView = (d: Date) => {
      setInnerMonth(d);
      onMonthChange?.(toIso(d));
    };
    /* The second calendar pages on its own — Figma's dual view shows June
       beside September — starting one month after the first. */
    const [secondRaw, setSecondView] = React.useState(() => addMonths(view, 1));
    /* The right calendar is always after the left — never the same month, never
       before. Nothing is disabled: moving one past the other pushes the other
       along (see `calendar()`); this catches the left moving on its own (a
       controlled `month`). */
    const secondView = secondRaw > view ? secondRaw : addMonths(view, 1);
    /* Which calendar (0 or 1) has its heading open on the month grid. */
    const [choosing, setChoosing] = React.useState<number | null>(null);

    const shared: Shared = { value, rangeEnd, min, max, markers, flagged, today, mobile };
    const dual = dualView && mode !== 'month';

    const pickDay = (iso: string) => {
      if (mode !== 'range') return onChange?.(iso);
      /* First click (or a click before the start) begins a range; the next
         one closes it. A closed range starts over on the next click. */
      if (!value || rangeEnd || iso < value) onRangeChange?.(iso, undefined);
      else onRangeChange?.(value, iso);
    };

    const pickPreset = (preset: DatePickerPreset) => {
      if (preset.filter) return preset.onSelect?.();
      if (mode === 'range' || preset.rangeEnd) onRangeChange?.(preset.value, preset.rangeEnd);
      else onChange?.(preset.value);
      setChoosing(null);
      setView(firstOf(parseIso(preset.value)));
      if (dual) {
        const end = preset.rangeEnd ? firstOf(parseIso(preset.rangeEnd)) : undefined;
        setSecondView(end && end > firstOf(parseIso(preset.value)) ? end : addMonths(parseIso(preset.value), 1));
      }
    };

    const calendar = (index: number) => {
      const v = index === 0 ? view : secondView;
      /* In the dual view the calendars push each other: take the left on to or
         past the right and the right jumps to the month after it; bring the
         right back to or before the left and the left steps to the month before. */
      const setV = (d: Date) => {
        if (index === 0) {
          setView(d);
          if (dual && d >= secondView) setSecondView(addMonths(d, 1));
        } else {
          setSecondView(d);
          if (dual && d <= view) setView(addMonths(d, -1));
        }
      };
      if (mode === 'month') {
        return (
          <MonthGrid
            view={v}
            setView={setV}
            selected={value?.slice(0, 7)}
            onPick={(d) => onChange?.(toIso(d))}
            shared={shared}
          />
        );
      }
      if (choosing === index) {
        return (
          <MonthGrid
            view={v}
            setView={setV}
            selected={monthKey(v.getFullYear(), v.getMonth())}
            onPick={(d) => {
              setV(d);
              setChoosing(null);
            }}
            /* "2026 ▴" swaps back to the days of the month that was open. */
            onHeadingClick={() => setChoosing(null)}
            shared={shared}
          />
        );
      }
      return (
        <DayGrid
          /* Remount on returning from the month grid so focus starts fresh. */
          key={`days-${index}`}
          view={v}
          setView={setV}
          onPick={pickDay}
          onHeadingClick={() => setChoosing(index)}
          shared={shared}
        />
      );
    };

    const isPresetActive = (p: DatePickerPreset) =>
      !p.filter && p.value === value && (p.rangeEnd ?? undefined) === (rangeEnd ?? undefined);

    /* A single date has one quick pick — Today. The ranges (last 7 days, this
       month, overdue…) only make sense when the picker takes a range. */
    const visiblePresets = presets?.filter((p) => mode === 'range' || (!p.rangeEnd && !p.filter));

    /* The desktop list is drawn like the system's dropdown menu (Menu_Dropdown):
       a 4 inset, square full-width rows 40 high with 12 either side, brand
       tints for hover / press / the current pick. Figma doesn't define it. */
    const presetList = visiblePresets && visiblePresets.length > 0 && (
      <div
        role="group"
        aria-label="Quick picks"
        className={cn(
          'flex shrink-0',
          mobile
            ? 'overflow-x-auto border-b border-stroke-default py-1'
            : 'w-35 flex-col justify-center border-r border-stroke-default py-1',
        )}
      >
        {visiblePresets.map((p) => (
          <button
            key={p.label}
            type="button"
            aria-pressed={isPresetActive(p)}
            onClick={() => pickPreset(p)}
            className={cn(
              'h-10 shrink-0 cursor-pointer whitespace-nowrap text-left text-body-sm-regular text-text-primary transition-colors',
              mobile
                ? 'rounded-md px-4 hover:bg-surface-neutral-subtle active:bg-surface-neutral-medium aria-pressed:bg-surface-neutral-subtle aria-pressed:text-body-sm-medium'
                : 'px-3 hover:bg-surface-brand-faint active:bg-surface-brand-subtle aria-pressed:bg-surface-brand-faint aria-pressed:text-body-sm-semibold',
              FOCUS_RING,
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    );

    /* Calendar widths from Figma: 252 alone (the 284 panel less padding),
       260 each side by side; the touch layout fills its container. */
    const calendarWidth = mobile ? 'w-full' : dual ? 'w-65' : 'w-63';

    return (
      <div
        ref={ref}
        className={cn(
          'flex rounded-md bg-surface-elevated font-sans shadow-menu',
          mobile ? 'w-full flex-col' : 'w-fit',
          className,
        )}
        {...props}
      >
        {presetList}
        <div className={cn('flex min-w-0 flex-col p-4', dual ? 'gap-2' : 'gap-3')}>
          {/* Dual view's calendars area is 252 tall in Figma (the single view's is
              244 in a 5-row month), which makes the panel 685 x 329. */}
          <div className={cn('flex gap-4', dual && 'min-h-63')}>
            {(dual ? [0, 1] : [0]).map((index) => (
              <div
                key={index}
                role={dual ? 'group' : undefined}
                aria-label={dual ? (index === 0 ? 'First calendar' : 'Second calendar') : undefined}
                className={cn('flex flex-col gap-3', calendarWidth)}
              >
                {calendar(index)}
              </div>
            ))}
          </div>
          {/* Outside `calendar()`, so it is the same button in the same place in
              the day and month views. */}
          {clearable && (
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={onClear} className="cursor-pointer">
                {clearLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);
DatePicker.displayName = 'DatePicker';
