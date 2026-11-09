import * as React from 'react';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { DatePicker, type DatePickerProps } from '../date-picker';
import { Popover } from '../popover';
import { useDateFormat } from '../../lib/format-date';

/** "2026-09-14" → "September 2026". Read in UTC, so no time zone can move the month. */
export const formatMonth = (iso: string): string => {
  const [year, month] = iso.split('-').map(Number);
  if (!year || !month) return '';
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/**
 * DateField — a date in a form: a field that shows it, and a calendar that picks it. Built to Figma's date
 * fields (a calendar glyph, then `2026-03-02`) in the Add Required Details dialog and the detail card.
 *
 * It is `Input` as the trigger — read-only, so the keyboard cannot type a malformed date — with a
 * `DatePicker` in a `Popover`. The field is a `combobox` (it opens a calendar, and that role allows the
 * expanded state the popover sets). The calendar opens with `strategy="fixed"`, so a scrolling dialog or table
 * cannot clip it, and picking a day closes it.
 *
 * The chosen date is **medium** weight and the placeholder regular — the rule `Select` and `SearchSelect` follow — so a date
 * field reads the same as the selects beside it. A **filter** passes `emphasis="regular"` (as its `Select`s do), so a row of
 * filters sits quietly.
 *
 * **`mode="range"`** picks a period: two clicks on a two-month calendar, then **Apply** (or **Clear**). The field reads "01/05/2026 - 02/05/2026" (give `formatDate` for the day format); `value` is the start and `rangeEnd` the end.
 *
 * **`mode="month"`** is the same field for a month with no day (a reporting period): it reads "September 2026", the
 * calendar opens on `DatePicker`'s month grid, and `onChange` gets the first of the chosen month. `estimated` means
 * nothing for a month and is ignored. `mode` is `DatePicker`'s own prop, so the two read alike.
 *
 * **Estimated dates.** `estimated` writes "(est.)" after the date — a value the system calculated rather than
 * a person set, as the Planning table writes it. Picking a day yourself is the caller's cue to clear it.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface DateFieldProps {
  /**
   * What the field picks: a `day` (the default) or a `month` — "September 2026", reported as the first of the month.
   */
  mode?: 'day' | 'range' | 'month';
  /** The date, ISO `yyyy-mm-dd` (in month mode, any day in the month). Empty shows the placeholder. */
  value?: string;
  /** Fires with the chosen ISO date (in month mode, the first of the month); the calendar then closes. */
  onChange?: (iso: string) => void;
  /** Range mode: the end of the range (ISO). `value` is the start. */
  rangeEnd?: string;
  /**
   * Range mode: fires with the start and end when **Apply** is pressed (one day picked is a period of one: its end is its start; nothing picked applies nothing), and with `('', undefined)` when **Clear** is pressed. Nothing
   * reaches the page while the range is being picked.
   */
  onRangeChange?: (start: string, end?: string) => void;
  /**
   * Day and month mode: shows the picker's own **Clear** button, which empties the field (this fires) and closes the calendar. Range mode always has its Clear. Without it a day or month is changed,
   * not cleared — a form field usually is not optional; a **filter** is, and passes this.
   */
  onClear?: () => void;
  /** How a date reads in the field. Default is the ISO date as it is; a page may want `dd/mm/yyyy`. Month mode ignores it. */
  formatDate?: (iso: string) => string;
  /**
   * The weight of the chosen date: `medium` (the default, as `Select`'s value) or `regular` — what a **filter** uses so a
   * row of filters sits quietly. The placeholder is regular either way.
   */
  emphasis?: 'regular' | 'medium';
  /** A calculated date, not one a person set — reads "(est.)". Day mode only. */
  estimated?: boolean;
  /** Shown while there is no date. */
  placeholder?: string;
  /** Names the field when no `Field` label does. */
  'aria-label'?: string;
  /** From a `Field`: the control's id, and the message it is described by. */
  id?: string;
  'aria-describedby'?: string;
  invalid?: boolean;
  /** From a `Field` with an error: the field is invalid, as `invalid` says. */
  'aria-invalid'?: boolean | 'true' | 'false';
  disabled?: boolean;
  /** `min`, `max`, `today` and the rest go to the `DatePicker`. */
  picker?: Omit<DatePickerProps, 'value' | 'onChange' | 'mode' | 'clearable' | 'onClear' | 'clearLabel' | 'rangeEnd' | 'onRangeChange' | 'onApply' | 'applyLabel' | 'dualView'>;
  className?: string;
}

export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  (
    {
      mode = 'day',
      emphasis = 'medium',
      value,
      onChange,
      rangeEnd,
      onRangeChange,
      onClear,
      formatDate,
      estimated,
      placeholder = '-',
      id,
      invalid: invalidProp,
      'aria-invalid': ariaInvalid,
      disabled,
      picker,
      className,
      'aria-label': ariaLabel,
      'aria-describedby': describedBy,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    /* Range mode: what is being picked, kept apart from the page's value until Apply. */
    const [draft, setDraft] = React.useState<{ start?: string; end?: string }>({});
    React.useEffect(() => {
      if (open) setDraft({ start: value || undefined, end: rangeEnd || undefined });
    }, [open]); // eslint-disable-line
    /* dd/mm/yyyy, or the person's locale when the product sets one (`DateFormatProvider`). */
    const dates = useDateFormat();
    /* A caller's `formatDate` wins (it was how the Holiday Registry drew dd/mm/yyyy before the system did); otherwise the system's one format. */
    const show = (iso: string) => (formatDate ? formatDate(iso) : dates.format(iso));
    const invalid = invalidProp || ariaInvalid === true || ariaInvalid === 'true';
    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="left"
        className={className ?? 'w-full'}
        /* As `InlineDateEdit` sets it: the panel is the picker, no wider and with no padding of its own. */
        width="auto"
        strategy="fixed"
        panelClassName="p-0"
        trigger={
          <Input
            ref={ref}
            id={id}
            readOnly
            role="combobox"
            emphasis={emphasis}
            fullWidth
            disabled={disabled}
            invalid={invalid}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            leadingIcon={<Icon name="calendar-blank" size="sm" />}
            placeholder={placeholder}
            value={
              !value
                ? ''
                : mode === 'month'
                  ? /* A named period from the picker's `presets` (a sprint) reads after its month: "May 2026, Sprint 34 (19-22 May)". */
                    (() => {
                      const named = picker?.presets?.find((p) => p.rangeEnd && p.value === value && p.rangeEnd === rangeEnd);
                      return named ? `${formatMonth(value)}, ${named.label}` : formatMonth(value);
                    })()
                  : mode === 'range'
                    ? rangeEnd && rangeEnd !== value
                      ? `${show(value)} - ${show(rangeEnd)}`
                      : show(value)
                    : `${show(value)}${estimated ? ' (est.)' : ''}`
            }
            onClick={() => !disabled && setOpen(true)}
          />
        }
        content={
          mode === 'range' ? (
            <DatePicker
              mode="range"
              dualView
              value={draft.start}
              rangeEnd={draft.end}
              onRangeChange={(start, end) => setDraft({ start, end })}
              onClear={() => {
                setDraft({});
                onRangeChange?.('', undefined);
                setOpen(false);
              }}
              /* Nothing picked, nothing to apply. One day picked is a period of one: its end is its start. */
              onApply={() => {
                if (!draft.start) return;
                onRangeChange?.(draft.start, draft.end ?? draft.start);
                setOpen(false);
              }}
              {...picker}
            />
          ) : (
            <DatePicker
              mode={mode}
              value={value}
              /* Month mode with named periods (`presets` that have an end): picking one reports its start and end. */
              rangeEnd={mode === 'month' ? rangeEnd : undefined}
              /* The picker's Clear is shown only when the page says what clearing does. */
              clearable={Boolean(onClear)}
              onClear={() => {
                onClear?.();
                setOpen(false);
              }}
              onChange={(iso) => {
                onChange?.(iso);
                setOpen(false);
              }}
              onRangeChange={(start, end) => {
                onRangeChange?.(start, end);
                setOpen(false);
              }}
              {...picker}
            />
          )
        }
      />
    );
  },
);
DateField.displayName = 'DateField';
