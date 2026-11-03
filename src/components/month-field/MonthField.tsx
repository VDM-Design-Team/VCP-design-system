import * as React from 'react';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { DatePicker, type DatePickerProps } from '../date-picker';
import { Popover } from '../popover';

/**
 * MonthField — a month and year chosen from a grid: a field that reads "September 2026", and a month picker that opens
 * under it. Built to Figma's `_SuperAdmin_Metric_Month_Selector` (a text field with a trailing chevron, and the Date
 * Picker in its month mode).
 *
 * It is `DateField`'s sibling: `Input` as the trigger — read-only, so the keyboard cannot type a malformed month —
 * with a `DatePicker` in `month` mode inside a `Popover`. The field is a `combobox` (it opens a picker). The picker
 * opens with `strategy="fixed"`, so a scrolling dialog or table cannot clip it, and choosing a month closes it.
 *
 * The value is an ISO date (`yyyy-mm-dd`) — the first of the month on the way out, any day in it on the way in — so it
 * drops into the same places a `DateField`'s does. The field shows the month, not the date.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface MonthFieldProps {
  /** The month, as any ISO `yyyy-mm-dd` date inside it. Empty shows the placeholder. */
  value?: string;
  /** Fires with the first of the chosen month, ISO; the picker then closes. */
  onChange?: (iso: string) => void;
  /** Shown while there is no month. */
  placeholder?: string;
  /** Names the field when no `Field` label does. */
  'aria-label'?: string;
  /** From a `Field`: the control's id, and the message it is described by. */
  id?: string;
  'aria-describedby'?: string;
  invalid?: boolean;
  disabled?: boolean;
  /** `min`, `max`, `today` and the rest go to the `DatePicker`. */
  picker?: Omit<DatePickerProps, 'value' | 'onChange' | 'mode' | 'clearable' | 'onClear' | 'clearLabel'>;
  className?: string;
}

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

export const MonthField = React.forwardRef<HTMLInputElement, MonthFieldProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Select month',
      id,
      invalid,
      disabled,
      picker,
      className,
      'aria-label': ariaLabel,
      'aria-describedby': describedBy,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="right"
        className={className ?? 'w-full'}
        width="auto"
        strategy="fixed"
        panelClassName="p-0"
        trigger={
          <Input
            ref={ref}
            id={id}
            readOnly
            role="combobox"
            fullWidth
            disabled={disabled}
            invalid={invalid}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            trailingIcon={<Icon name="caret-down" size="sm" />}
            placeholder={placeholder}
            value={value ? formatMonth(value) : ''}
            onClick={() => !disabled && setOpen(true)}
          />
        }
        content={
          <DatePicker
            mode="month"
            value={value}
            onChange={(iso) => {
              onChange?.(iso);
              setOpen(false);
            }}
            {...picker}
          />
        }
      />
    );
  },
);
MonthField.displayName = 'MonthField';
