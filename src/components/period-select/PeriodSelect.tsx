import * as React from 'react';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { DatePicker, type DatePickerPreset } from '../date-picker';
import { formatMonth } from '../date-field';
import { Popover } from '../popover';

/**
 * PeriodSelect — a filter that picks a period: a month, or one of the named stretches you offer (sprints, cycles). The field says what is picked ("May 2026, Sprint 34 (19-22 May)")
 * and opens a panel with the named periods down the left and a year of months on the right, then **Clear**. Built to Figma's `_Holiday_Registry_Period_Selection` (`6155:40803`:
 * Empty, Filled, Dropdown) and its "Datepicker with sprint selection".
 *
 * - **It is `DatePicker` in month mode with `presets`**, in a `Popover` under a read-only field, as `DateField` is. A month picks the whole month; a preset picks its own dates.
 * - **What is picked is `{ start, end }`** (ISO), or `null`: a month is its first and last day. When it is one of your `presets` the field names it after the month.
 * - **Choosing closes the panel**; **Clear** empties the filter and closes it too. The page keeps the value — `value` in, `onChange` out.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface Period {
  /** ISO `yyyy-mm-dd`. */
  start: string;
  /** ISO `yyyy-mm-dd`, inclusive. */
  end: string;
}

export interface PeriodSelectProps {
  value: Period | null;
  onChange: (period: Period | null) => void;
  /** The named periods down the left: `{ label: 'Sprint 34 (19-22 May)', value: start, rangeEnd: end }`. */
  presets?: readonly DatePickerPreset[];
  /** Shown while nothing is picked. */
  placeholder?: string;
  /** Names the field when no label does. */
  'aria-label'?: string;
  /** `regular` (the default here) keeps a row of filters quiet; `medium` reads as a value in a form. */
  emphasis?: 'regular' | 'medium';
  disabled?: boolean;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** The last day of the month `iso` is in. */
const lastDayOf = (iso: string) => {
  const [year, month] = iso.split('-').map(Number);
  return `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`;
};

export const PeriodSelect = React.forwardRef<HTMLInputElement, PeriodSelectProps>(
  ({ value, onChange, presets, placeholder = 'Select Period', emphasis = 'regular', disabled, className, 'aria-label': ariaLabel }, ref) => {
    const [open, setOpen] = React.useState(false);

    const preset = value ? presets?.find((p) => p.value === value.start && (p.rangeEnd ?? p.value) === value.end) : undefined;
    const shown = !value ? '' : preset ? `${formatMonth(value.start)}, ${preset.label}` : formatMonth(value.start);

    const pick = (period: Period | null) => {
      onChange(period);
      setOpen(false);
    };

    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="left"
        className={className ?? 'w-full'}
        width="auto"
        strategy="fixed"
        panelClassName="p-0"
        trigger={
          <Input
            ref={ref}
            readOnly
            role="combobox"
            emphasis={emphasis}
            fullWidth
            disabled={disabled}
            aria-label={ariaLabel ?? placeholder}
            placeholder={placeholder}
            value={shown}
            trailingIcon={<Icon name="caret-down" size="sm" />}
            onClick={() => !disabled && setOpen(true)}
          />
        }
        content={
          <DatePicker
            mode="month"
            value={value?.start}
            rangeEnd={value?.end}
            presets={presets}
            onChange={(first) => pick({ start: first, end: lastDayOf(first) })}
            onRangeChange={(start, end) => pick({ start, end: end ?? lastDayOf(start) })}
            onClear={() => pick(null)}
          />
        }
      />
    );
  },
);
PeriodSelect.displayName = 'PeriodSelect';
